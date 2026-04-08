package com.example.JanAwaaz.service;

import com.example.JanAwaaz.dto.grievance.GrievanceRequestDto;
import com.example.JanAwaaz.dto.grievance.GrievanceResponseDto;
import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.*;
import com.example.JanAwaaz.model.enums.Status;
import com.example.JanAwaaz.repository.CategoryRepository;
import com.example.JanAwaaz.repository.CitizenRepository;
import com.example.JanAwaaz.repository.GrievanceRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class GrievanceService {
    private static final List<Status> ACTIVE_WORKLOAD_STATUSES = List.of(
            Status.ASSIGNED,
            Status.IN_PROGRESS,
            Status.ADDITIONAL_INFO_REQUESTED
    );

    @Autowired
    private GrievanceRepository GrievanceRepo;

    @Autowired
    private CitizenRepository citizenRepo;

    @Autowired
    private CategoryRepository categoryRepo;

    @Autowired
    private OfficerRepository officerRepo;

    @Autowired
    private NotificationService notificationService;

    public Grievance getGrievanceById(Long grievanceId){
        return GrievanceRepo.findById(grievanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found with id: "+ grievanceId));
    }

    public List<Grievance> getAllGrievances(){
        return GrievanceRepo.findAll();
    }

    public void deleteGrievance(Long id) {
        Grievance grievance = GrievanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found"));

        GrievanceRepo.delete(grievance);
    }
    @Transactional
    public GrievanceResponseDto createGrievance(String citizenEmail, GrievanceRequestDto request) {
        Citizen citizen = citizenRepo.findByEmail(citizenEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with email: " + citizenEmail));

        Category category = categoryRepo.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));

        Long departmentId = category.getDepartment().getDepartmentId();

        Officer assignedOfficer = selectLeastLoadedOfficer(departmentId);

        Grievance grievance = new Grievance();
        grievance.setImageUrl(request.imageUrl());
        grievance.setDescription(request.description());
        grievance.setLatitude(request.latitude());
        grievance.setLongitude(request.longitude());
        grievance.setAddressText(request.addressText());
        grievance.setCreatedAt(LocalDateTime.now());
        grievance.setCitizen(citizen);
        grievance.setCategory(category);

        if(assignedOfficer != null){
            grievance.setOfficer(assignedOfficer);
            grievance.setStatus(Status.ASSIGNED);
        }
        else {
            grievance.setStatus(Status.SUBMITTED);
        }
        Grievance savedGrievance = GrievanceRepo.save(grievance);

        if(assignedOfficer != null){
            notificationService.createOfficerAssignmentNotification(assignedOfficer, savedGrievance);
            notificationService.createCitizenSubmissionNotification(citizen, assignedOfficer, savedGrievance);
        }
        return mapToResponse(savedGrievance);
    }

    public Grievance patchGrievanceStatus(Long grievanceId, Status status) {

        Grievance grievance = GrievanceRepo.findById(grievanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found"));

        grievance.setStatus(status);

        return GrievanceRepo.save(grievance);
    }

    private GrievanceResponseDto mapToResponse(Grievance grievance) {
        Long citizenId = grievance.getCitizen() == null ? null : grievance.getCitizen().getCitizenId();
        Long categoryId = grievance.getCategory() == null ? null : grievance.getCategory().getCategoryId();
        String categoryName = grievance.getCategory() == null ? null : grievance.getCategory().getCategoryName();
        Long officerId = grievance.getOfficer() == null ? null : grievance.getOfficer().getOfficerId();
        String officerName = grievance.getOfficer() == null ? null : grievance.getOfficer().getName();

        return new GrievanceResponseDto(
                grievance.getGrievanceId(),
                grievance.getImageUrl(),
                grievance.getDescription(),
                grievance.getLatitude(),
                grievance.getLongitude(),
                grievance.getAddressText(),
                grievance.getStatus(),
                grievance.getCreatedAt(),
                grievance.getUpdatedAt(),
                citizenId,
                categoryId,
                categoryName,
                officerId,
                officerName
        );
    }

    private Officer selectLeastLoadedOfficer(Long departmentId) {
        return officerRepo.findLeastLoadedActiveOfficersByDepartment(
                        departmentId,
                        ACTIVE_WORKLOAD_STATUSES,
                        PageRequest.of(0, 1)
                )
                .stream()
                .findFirst()
                .orElse(null);
    }
}
