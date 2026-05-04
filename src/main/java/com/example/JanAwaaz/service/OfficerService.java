package com.example.JanAwaaz.service;

import com.example.JanAwaaz.dto.officer.OfficerCreateRequestDto;
import com.example.JanAwaaz.dto.officer.OfficerPasswordUpdateRequestDto;
import com.example.JanAwaaz.dto.officer.OfficerProfileResponseDto;
import com.example.JanAwaaz.dto.officer.OfficerPatchRequestDto;
import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Department;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.DepartmentRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class OfficerService {
    @Autowired
    private OfficerRepository officerRepo;

    @Autowired
    private DepartmentRepository departmentRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DepartmentService departmentService;

    public OfficerProfileResponseDto createOfficer(OfficerCreateRequestDto request) {
        if (officerRepo.existsByEmail(request.email())) {
            throw new RuntimeException("Email already registered");
        }
        if (officerRepo.existsByPhoneNumber(request.phoneNumber())) {
            throw new RuntimeException("Phone number already registered");
        }

        Department department = departmentService.getByDepartmentId(request.departmentId());

        Officer officer = new Officer();
        officer.setName(request.name());
        officer.setEmail(request.email());
        officer.setPhoneNumber(request.phoneNumber());
        officer.setPassword(passwordEncoder.encode(request.password()));
        officer.setDesignation(request.designation());
        officer.setActive(request.active() == null ? Boolean.TRUE : request.active());
        officer.setRole(UserRole.OFFICER);
        officer.setForcePasswordChange(Boolean.TRUE);
        officer.setDepartment(department);

        Officer savedOfficer = officerRepo.save(officer);

        return mapToProfileResponse(savedOfficer);
    }

    public OfficerProfileResponseDto getOfficerProfileByEmail(String email) {
        Officer officer = officerRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with email: " + email));

        return mapToProfileResponse(officer);
    }

    public OfficerProfileResponseDto getOfficerById(Long officerId) {
        return officerRepo.findById(officerId)
                .map(this::mapToProfileResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));
    }

    public List<OfficerProfileResponseDto> getAllOfficers() {
        return officerRepo.findAll().stream()
                .map(this::mapToProfileResponse)
                .toList();
    }

    public OfficerProfileResponseDto patchOfficer(OfficerPatchRequestDto officer, Long officerId) {
        Officer existingOfficer = officerRepo.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        if (officer.name() != null) {
            existingOfficer.setName(officer.name());
        }

        if (officer.email() != null) {
            if (officerRepo.existsByEmailAndOfficerIdNot(officer.email(), officerId)) {
                throw new RuntimeException("Email already registered");
            }
            existingOfficer.setEmail(officer.email());
        }

        if (officer.phoneNumber() != null) {
            if (officerRepo.existsByPhoneNumberAndOfficerIdNot(officer.phoneNumber(), officerId)) {
                throw new RuntimeException("Phone number already registered");
            }
            existingOfficer.setPhoneNumber(officer.phoneNumber());
        }

        if (officer.designation() != null) {
            existingOfficer.setDesignation(officer.designation());
        }

        if (officer.active() != null) {
            existingOfficer.setActive(officer.active());
        }

        if (officer.departmentId() != null) {
            Department department = departmentService.getByDepartmentId(officer.departmentId());
            existingOfficer.setDepartment(department);
        }

        return mapToProfileResponse(officerRepo.save(existingOfficer));
    }

    public void updateOfficerPassword(Long officerId, String email, OfficerPasswordUpdateRequestDto request) {
        Officer existingOfficer = officerRepo.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        if (!existingOfficer.getEmail().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot update another officer's password");
        }

        if (existingOfficer.getPassword() == null || existingOfficer.getPassword().isBlank()) {
            throw new RuntimeException("Officer password is not initialized");
        }

        boolean passwordMatches;
        try {
            passwordMatches = passwordEncoder.matches(request.currentPassword(), existingOfficer.getPassword());
        } catch (IllegalArgumentException ex) {
            // Backward compatibility for old plaintext records; update re-hashes on success.
            passwordMatches = request.currentPassword().equals(existingOfficer.getPassword());
        }

        if (!passwordMatches) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (request.currentPassword().equals(request.newPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        existingOfficer.setPassword(passwordEncoder.encode(request.newPassword()));
        existingOfficer.setForcePasswordChange(Boolean.FALSE);

        officerRepo.save(existingOfficer);
    }

    public void deleteOfficer(Long officerId) {
        Officer existingOfficer = officerRepo.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        existingOfficer.setActive(false);
        officerRepo.save(existingOfficer);
    }

    private OfficerProfileResponseDto mapToProfileResponse(Officer officer) {
        Department department = officer.getDepartment();

        return new OfficerProfileResponseDto(
                officer.getOfficerId(),
                officer.getName(),
                officer.getEmail(),
                officer.getPhoneNumber(),
                officer.getDesignation(),
                department == null ? null : department.getDepartmentId(),
                department == null ? null : department.getDepartmentName(),
                officer.getRole(),
                officer.getActive(),
                officer.getForcePasswordChange()
        );
    }
}
