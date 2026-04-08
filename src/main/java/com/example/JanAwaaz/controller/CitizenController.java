package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.dto.citizen.CitizenProfileResponseDto;
import com.example.JanAwaaz.dto.citizen.CitizenProfileUpdateRequestDto;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.service.CitizenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/citizens")
public class CitizenController {
    @Autowired
    private CitizenService citizenService;

    @GetMapping("/me")
    public ResponseEntity<CitizenProfileResponseDto> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(citizenService.getCitizenProfileByEmail(authentication.getName()));
    }

    @PatchMapping("/me")
    public ResponseEntity<CitizenProfileResponseDto> patchMyProfile(
            Authentication authentication,
            @Valid @RequestBody CitizenProfileUpdateRequestDto request
    ) {
        return ResponseEntity.ok(citizenService.patchCitizenProfileByEmail(authentication.getName(), request));
    }

    @GetMapping("/{citizenId}")
    public ResponseEntity<Citizen> getCitizenById(@PathVariable Long citizenId){
        return ResponseEntity.ok(citizenService.getCitizenById(citizenId));
    }
    @GetMapping()
    public ResponseEntity<List<Citizen>> getAllCitizens(){
        return ResponseEntity.ok(citizenService.getAllCitizens());
    }

    @DeleteMapping("/{citizenId}")
    public ResponseEntity<String> deleteCitizen(@PathVariable Long citizenId){
        citizenService.deleteCitizen(citizenId);
        return ResponseEntity.ok("Citizen Deleted successfully");
    }
}
