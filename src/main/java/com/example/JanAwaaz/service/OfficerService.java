package com.example.JanAwaaz.service;

import com.example.JanAwaaz.dto.OfficerCreateRequestDto;
import com.example.JanAwaaz.dto.OfficerCreateResponseDto;
import com.example.JanAwaaz.dto.OfficerPasswordUpdateRequestDto;
import com.example.JanAwaaz.dto.OfficerPatchRequestDto;
import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Department;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.DepartmentRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OfficerService {
    private static final int TEMP_PASSWORD_LENGTH = 12;
    private static final String TEMP_PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";

    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    private OfficerRepository officerRepo;

    @Autowired
    private DepartmentRepository departmentRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public OfficerCreateResponseDto createOfficer(OfficerCreateRequestDto request) {
        if (officerRepo.existsByEmail(request.email())) {
            throw new RuntimeException("Email already registered");
        }
        if (officerRepo.existsByPhoneNumber(request.phoneNumber())) {
            throw new RuntimeException("Phone number already registered");
        }

        Department department = getDepartmentById(request.departmentId());
        String temporaryPassword = generateTemporaryPassword();

        Officer officer = new Officer();
        officer.setName(request.name());
        officer.setEmail(request.email());
        officer.setPhoneNumber(request.phoneNumber());
        officer.setPassword(passwordEncoder.encode(temporaryPassword));
        officer.setDesignation(request.designation());
        officer.setActive(request.active() == null ? Boolean.TRUE : request.active());
        officer.setRole(UserRole.OFFICER);
        officer.setForcePasswordChange(Boolean.TRUE);
        officer.setCreatedAt(LocalDateTime.now());
        officer.setDepartment(department);

        Officer savedOfficer = officerRepo.save(officer);

        return new OfficerCreateResponseDto(
                savedOfficer.getOfficerId(),
                savedOfficer.getName(),
                savedOfficer.getEmail(),
                savedOfficer.getPhoneNumber(),
                savedOfficer.getDesignation(),
                savedOfficer.getDepartment().getDepartmentId(),
                savedOfficer.getRole(),
                savedOfficer.getActive(),
                savedOfficer.getForcePasswordChange(),
                temporaryPassword
        );
    }

    public Officer getOfficerById(Long officerId) {
        return officerRepo.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));
    }

    public List<Officer> getAllOfficers() {
        return officerRepo.findAll();
    }

    public Officer patchOfficer(OfficerPatchRequestDto officer, Long officerId) {
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
            Department department = getDepartmentById(officer.departmentId());
            existingOfficer.setDepartment(department);
        }

        existingOfficer.setUpdatedAt(LocalDateTime.now());

        return officerRepo.save(existingOfficer);
    }

    public void updateOfficerPassword(Long officerId, OfficerPasswordUpdateRequestDto request) {
        Officer existingOfficer = officerRepo.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

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
        existingOfficer.setUpdatedAt(LocalDateTime.now());

        officerRepo.save(existingOfficer);
    }

    public void deleteOfficer(Long officerId) {
        Officer existingOfficer = officerRepo.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        existingOfficer.setActive(false);
        officerRepo.save(existingOfficer);
    }

    private Department getDepartmentById(Long departmentId) {
        return departmentRepo.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));
    }

    private String generateTemporaryPassword() {
        StringBuilder password = new StringBuilder(TEMP_PASSWORD_LENGTH);

        for (int i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
            int index = secureRandom.nextInt(TEMP_PASSWORD_CHARS.length());
            password.append(TEMP_PASSWORD_CHARS.charAt(index));
        }

        return password.toString();
    }
}
