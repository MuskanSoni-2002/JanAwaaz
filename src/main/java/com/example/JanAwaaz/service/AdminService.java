package com.example.JanAwaaz.service;

import com.example.JanAwaaz.dto.admin.AdminGrievanceResponseDto;
import com.example.JanAwaaz.dto.admin.AdminProfileResponseDto;
import com.example.JanAwaaz.dto.officer.OfficerCreateRequestDto;
import com.example.JanAwaaz.dto.officer.OfficerProfileResponseDto;
import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Admin;
import com.example.JanAwaaz.model.Category;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.Department;
import com.example.JanAwaaz.model.Grievance;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.model.enums.Status;
import com.example.JanAwaaz.repository.AdminRepository;
import com.example.JanAwaaz.repository.GrievanceRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class AdminService {
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private OfficerRepository officerRepository;

    @Autowired
    private GrievanceRepository grievanceRepository;

    @Autowired
    private OfficerService officerService;

    @Autowired
    private NotificationService notificationService;

    public AdminProfileResponseDto getAdminProfileByEmail(String email) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));

        return new AdminProfileResponseDto(
                admin.getAdminId(),
                admin.getName(),
                admin.getEmail(),
                admin.getActive(),
                admin.getRole()
        );
    }

    public OfficerProfileResponseDto createOfficer(OfficerCreateRequestDto request) {
        return officerService.createOfficer(request);
    }

    public List<OfficerProfileResponseDto> getAllOfficers() {
        return officerService.getAllOfficers();
    }

    public void deactivateOfficer(Long officerId) {
        officerService.deleteOfficer(officerId);
    }

    public List<AdminGrievanceResponseDto> getGrievances(String area) {
        List<Grievance> grievances = StringUtils.hasText(area)
                ? grievanceRepository.findByAddressTextContainingIgnoreCaseOrderByCreatedAtDesc(area.trim())
                : grievanceRepository.findAllByOrderByCreatedAtDesc();

        return grievances.stream()
                .map(this::mapToGrievanceResponse)
                .toList();
    }

    public AdminGrievanceResponseDto assignGrievance(Long grievanceId, Long officerId) {
        Grievance grievance = grievanceRepository.findById(grievanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found with id: " + grievanceId));

        Officer officer = officerRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        if (!Boolean.TRUE.equals(officer.getActive())) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot assign grievance to a deactivated officer");
        }

        Long previousOfficerId = grievance.getOfficer() == null ? null : grievance.getOfficer().getOfficerId();
        grievance.setOfficer(officer);
        if (grievance.getStatus() == null || grievance.getStatus() == Status.SUBMITTED) {
            grievance.setStatus(Status.ASSIGNED);
        }
        grievance.setUpdatedAt(LocalDateTime.now());

        Grievance savedGrievance = grievanceRepository.save(grievance);
        if (!officerId.equals(previousOfficerId)) {
            notificationService.createOfficerAssignmentNotification(officer, savedGrievance);
            if (savedGrievance.getCitizen() != null) {
                notificationService.createCitizenAssignmentNotification(savedGrievance.getCitizen(), officer, savedGrievance);
            }
        }

        return mapToGrievanceResponse(savedGrievance);
    }

    private AdminGrievanceResponseDto mapToGrievanceResponse(Grievance grievance) {
        Citizen citizen = grievance.getCitizen();
        Category category = grievance.getCategory();
        Department department = category == null ? null : category.getDepartment();
        Officer officer = grievance.getOfficer();

        String citizenName = null;
        if (citizen != null) {
            String firstName = citizen.getFirstName() == null ? "" : citizen.getFirstName().trim();
            String lastName = citizen.getLastName() == null ? "" : citizen.getLastName().trim();
            citizenName = (firstName + " " + lastName).trim();
            if (citizenName.isBlank()) {
                citizenName = citizen.getEmail();
            }
        }

        return new AdminGrievanceResponseDto(
                grievance.getGrievanceId(),
                grievance.getImageUrl(),
                grievance.getDescription(),
                grievance.getLatitude(),
                grievance.getLongitude(),
                grievance.getAddressText(),
                grievance.getStatus(),
                citizen == null ? null : citizen.getCitizenId(),
                citizenName,
                category == null ? null : category.getCategoryId(),
                category == null ? null : category.getCategoryName(),
                department == null ? null : department.getDepartmentId(),
                department == null ? null : department.getDepartmentName(),
                officer == null ? null : officer.getOfficerId(),
                officer == null ? null : officer.getName(),
                grievance.getCreatedAt(),
                grievance.getUpdatedAt()
        );
    }
}
