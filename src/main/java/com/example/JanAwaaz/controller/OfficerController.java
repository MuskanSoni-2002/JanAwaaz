package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.dto.officer.OfficerCreateRequestDto;
import com.example.JanAwaaz.dto.officer.OfficerPasswordUpdateRequestDto;
import com.example.JanAwaaz.dto.officer.OfficerProfileResponseDto;
import com.example.JanAwaaz.dto.officer.OfficerPatchRequestDto;
import com.example.JanAwaaz.service.OfficerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/officers")
public class OfficerController {
    @Autowired
    private OfficerService officerService;

    @PreAuthorize("hasRole('OFFICER')")
    @GetMapping("/me")
    public ResponseEntity<OfficerProfileResponseDto> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(officerService.getOfficerProfileByEmail(authentication.getName()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<OfficerProfileResponseDto> createOfficer(@Valid @RequestBody OfficerCreateRequestDto officer){
        return new ResponseEntity<>(officerService.createOfficer(officer), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{officerId}")
    public ResponseEntity<OfficerProfileResponseDto> getOfficerById(@PathVariable Long officerId) {
        return ResponseEntity.ok(officerService.getOfficerById(officerId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<OfficerProfileResponseDto>> getAllOfficers() {
        return ResponseEntity.ok(officerService.getAllOfficers());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{officerId}")
    public ResponseEntity<OfficerProfileResponseDto> patchOfficer(@Valid @RequestBody OfficerPatchRequestDto officer,
                                                                  @PathVariable Long officerId) {
        return ResponseEntity.ok(officerService.patchOfficer(officer, officerId));
    }

    @PreAuthorize("hasRole('OFFICER')")
    @PatchMapping("/{officerId}/password")
    public ResponseEntity<String> updateOfficerPassword(Authentication authentication,
                                                        @PathVariable Long officerId,
                                                        @Valid @RequestBody OfficerPasswordUpdateRequestDto request) {
        officerService.updateOfficerPassword(officerId, authentication.getName(), request);
        return ResponseEntity.ok("Officer password updated successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{officerId}")
    public ResponseEntity<String> deleteOfficer(@PathVariable Long officerId) {
        officerService.deleteOfficer(officerId);
        return ResponseEntity.ok("Officer Deleted successfully");
    }
}
