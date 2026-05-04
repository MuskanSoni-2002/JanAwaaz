package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.dto.grievance.GrievanceRequestDto;
import com.example.JanAwaaz.dto.grievance.GrievanceResponseDto;
import com.example.JanAwaaz.model.Grievance;
import com.example.JanAwaaz.model.enums.Status;
import com.example.JanAwaaz.service.GrievanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/grievances")
public class GrievanceController {

    @Autowired
    private GrievanceService grievanceService;

    @PreAuthorize("hasRole('CITIZEN')")
    @PostMapping(value = "/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GrievanceResponseDto> createGrievance(
            Authentication authentication,
            @Valid @ModelAttribute GrievanceRequestDto request
    ){
        return new ResponseEntity<>(
                grievanceService.createGrievance(authentication.getName(), request),
                HttpStatus.CREATED
        );
    }

    @PreAuthorize("hasRole('CITIZEN')")
    @GetMapping("/me")
    public ResponseEntity<List<GrievanceResponseDto>> getMyGrievances(Authentication authentication) {
        return ResponseEntity.ok(grievanceService.getGrievancesByCitizenEmail(authentication.getName()));
    }
    @PreAuthorize("hasRole('OFFICER')")
    @GetMapping("/assigned")
    public ResponseEntity<List<GrievanceResponseDto>> getAssignedGrievances(Authentication authentication) {
        return ResponseEntity.ok(grievanceService.getGrievancesByOfficerEmail(authentication.getName()));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CITIZEN', 'OFFICER')")
    @GetMapping("/{grievanceId}")
    public ResponseEntity<Grievance> getGrievanceById(
            @PathVariable Long grievanceId,
            Authentication authentication
    ){
        return ResponseEntity.ok(grievanceService.getGrievanceById(grievanceId, authentication));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Grievance>> getAllGrievances(){
        return ResponseEntity.ok(grievanceService.getAllGrievances());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER')")
    @PatchMapping("/{grievanceId}/status")
    public ResponseEntity<Grievance> updateStatus(
            Authentication authentication,
            @PathVariable Long grievanceId,
            @RequestParam Status status
    ){
        return ResponseEntity.ok(grievanceService.patchGrievanceStatus(grievanceId, status, authentication));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{grievanceId}")
    public ResponseEntity<String> deleteGrievance(@PathVariable Long grievanceId){
        grievanceService.deleteGrievance(grievanceId);
        return ResponseEntity.ok("Grievance Deleted successfully");
    }
}
