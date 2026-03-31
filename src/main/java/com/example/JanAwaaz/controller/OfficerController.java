package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.dto.OfficerCreateRequestDto;
import com.example.JanAwaaz.dto.OfficerCreateResponseDto;
import com.example.JanAwaaz.dto.OfficerPasswordUpdateRequestDto;
import com.example.JanAwaaz.dto.OfficerPatchRequestDto;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.service.OfficerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/officers")
public class OfficerController {
    @Autowired
    private OfficerService officerService;

    @PostMapping
    public ResponseEntity<OfficerCreateResponseDto> createOfficer(@Valid @RequestBody OfficerCreateRequestDto officer){
        return new ResponseEntity<>(officerService.createOfficer(officer), HttpStatus.CREATED);
    }

    @GetMapping("/{officerId}")
    public ResponseEntity<Officer> getOfficerById(@PathVariable Long officerId) {
        return ResponseEntity.ok(officerService.getOfficerById(officerId));
    }

    @GetMapping
    public ResponseEntity<List<Officer>> getAllOfficers() {
        return ResponseEntity.ok(officerService.getAllOfficers());
    }

    @PatchMapping("/{officerId}")
    public ResponseEntity<Officer> patchOfficer(@Valid @RequestBody OfficerPatchRequestDto officer,
                                                @PathVariable Long officerId) {
        return ResponseEntity.ok(officerService.patchOfficer(officer, officerId));
    }

    @PatchMapping("/{officerId}/password")
    public ResponseEntity<String> updateOfficerPassword(@PathVariable Long officerId,
                                                        @Valid @RequestBody OfficerPasswordUpdateRequestDto request) {
        officerService.updateOfficerPassword(officerId, request);
        return ResponseEntity.ok("Officer password updated successfully");
    }

    @DeleteMapping("/{officerId}")
    public ResponseEntity<String> deleteOfficer(@PathVariable Long officerId) {
        officerService.deleteOfficer(officerId);
        return ResponseEntity.ok("Officer Deleted successfully");
    }
}
