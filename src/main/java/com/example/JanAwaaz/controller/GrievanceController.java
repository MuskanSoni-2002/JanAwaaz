package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.dto.grievance.GrievanceRequestDto;
import com.example.JanAwaaz.dto.grievance.GrievanceResponseDto;
import com.example.JanAwaaz.model.Grievance;
import com.example.JanAwaaz.model.enums.Status;
import com.example.JanAwaaz.service.GrievanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/grievances")
public class GrievanceController {

    @Autowired
    private GrievanceService grievanceService;

    @PreAuthorize("hasRole('CITIZEN')")
    @PostMapping("/file")
    public ResponseEntity<GrievanceResponseDto> createGrievance(
            Authentication authentication,
            @Valid @RequestBody GrievanceRequestDto request
    ){
        return new ResponseEntity<>(
                grievanceService.createGrievance(authentication.getName(), request),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{grievanceId}")
    public ResponseEntity<Grievance> getGrievanceById(@PathVariable Long grievanceId){
        return ResponseEntity.ok(grievanceService.getGrievanceById(grievanceId));
    }

    @GetMapping
    public ResponseEntity<List<Grievance>> getAllGrievances(){
        return ResponseEntity.ok(grievanceService.getAllGrievances());
    }

    @PatchMapping("/{grievanceId}/status")
    public ResponseEntity<Grievance> updateStatus(@PathVariable Long grievanceId, @RequestParam Status status){
        return ResponseEntity.ok(grievanceService.patchGrievanceStatus(grievanceId, status));
    }

    @DeleteMapping("/{grievanceId}")
    public ResponseEntity<String> deleteGrievance(@PathVariable Long grievanceId){
        grievanceService.deleteGrievance(grievanceId);
        return ResponseEntity.ok("Grievance Deleted successfully");
    }
}
