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
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
    private GrievanceRepository grievanceRepo;

    @Autowired
    private CitizenRepository citizenRepo;

    @Autowired
    private CategoryRepository categoryRepo;

    @Autowired
    private OfficerRepository officerRepo;

    @Autowired
    private NotificationService notificationService;

    public Grievance getGrievanceById(Long grievanceId, Authentication authentication){
        Grievance grievance = grievanceRepo.findById(grievanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found with id: "+ grievanceId));

        authorizeGrievanceRead(grievance, authentication);
        return grievance;
    }

    public List<Grievance> getAllGrievances(){
        return grievanceRepo.findAll();
    }

    public void deleteGrievance(Long id) {
        Grievance grievance = grievanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found"));

        grievanceRepo.delete(grievance);
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
        Grievance savedGrievance = grievanceRepo.save(grievance);

        if(assignedOfficer != null){
            notificationService.createOfficerAssignmentNotification(assignedOfficer, savedGrievance);
            notificationService.createCitizenSubmissionNotification(citizen, assignedOfficer, savedGrievance);
        }
        return mapToResponse(savedGrievance);
    }

    public Grievance patchGrievanceStatus(Long grievanceId, Status status, Authentication authentication) {

        Grievance grievance = grievanceRepo.findById(grievanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found"));

        authorizeGrievanceStatusUpdate(grievance, authentication);
        grievance.setStatus(status);

        return grievanceRepo.save(grievance);
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

    public List<GrievanceResponseDto> getGrievancesByCitizenEmail(String citizenEmail) {
        citizenRepo.findByEmail(citizenEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with email: " + citizenEmail));

        return grievanceRepo.findByCitizenEmailOrderByCreatedAtDesc(citizenEmail)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void authorizeGrievanceRead(Grievance grievance, Authentication authentication) {
        if (hasRole(authentication, "ROLE_ADMIN")) {
            return;
        }

        if (hasRole(authentication, "ROLE_CITIZEN")) {
            Citizen citizen = grievance.getCitizen();
            if (citizen != null && authentication.getName().equalsIgnoreCase(citizen.getEmail())) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this grievance");
        }

        if (hasRole(authentication, "ROLE_OFFICER")) {
            Officer officer = grievance.getOfficer();
            if (officer != null && authentication.getName().equalsIgnoreCase(officer.getEmail())) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this grievance");
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unsupported role for grievance access");
    }

    private void authorizeGrievanceStatusUpdate(Grievance grievance, Authentication authentication) {
        if (hasRole(authentication, "ROLE_ADMIN")) {
            return;
        }

        if (hasRole(authentication, "ROLE_OFFICER")) {
            Officer officer = grievance.getOfficer();
            if (officer != null && authentication.getName().equalsIgnoreCase(officer.getEmail())) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this grievance");
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unsupported role for grievance access");
    }

    private boolean hasRole(Authentication authentication, String role) {
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (role.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
