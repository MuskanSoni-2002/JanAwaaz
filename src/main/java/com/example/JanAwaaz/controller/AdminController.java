package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.dto.admin.AdminGrievanceAssignmentRequestDto;
import com.example.JanAwaaz.dto.admin.AdminGrievanceResponseDto;
import com.example.JanAwaaz.dto.admin.AdminProfileResponseDto;
import com.example.JanAwaaz.dto.officer.OfficerCreateRequestDto;
import com.example.JanAwaaz.dto.officer.OfficerProfileResponseDto;
import com.example.JanAwaaz.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired
    private AdminService adminService;

    @GetMapping("/me")
    public ResponseEntity<AdminProfileResponseDto> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(adminService.getAdminProfileByEmail(authentication.getName()));
    }

    @GetMapping("/officers")
    public ResponseEntity<List<OfficerProfileResponseDto>> getAllOfficers() {
        return ResponseEntity.ok(adminService.getAllOfficers());
    }

    @PostMapping("/officers")
    public ResponseEntity<OfficerProfileResponseDto> createOfficer(
            @Valid @RequestBody OfficerCreateRequestDto request
    ) {
        return new ResponseEntity<>(adminService.createOfficer(request), HttpStatus.CREATED);
    }

    @PatchMapping("/officers/{officerId}/deactivate")
    public ResponseEntity<String> deactivateOfficer(@PathVariable Long officerId) {
        adminService.deactivateOfficer(officerId);
        return ResponseEntity.ok("Officer deactivated successfully");
    }

    @GetMapping("/grievances")
    public ResponseEntity<List<AdminGrievanceResponseDto>> getGrievances(
            @RequestParam(required = false) String area
    ) {
        return ResponseEntity.ok(adminService.getGrievances(area));
    }

    @PatchMapping("/grievances/{grievanceId}/assignment")
    public ResponseEntity<AdminGrievanceResponseDto> assignGrievance(
            @PathVariable Long grievanceId,
            @Valid @RequestBody AdminGrievanceAssignmentRequestDto request
    ) {
        return ResponseEntity.ok(adminService.assignGrievance(grievanceId, request.officerId()));
    }
}
