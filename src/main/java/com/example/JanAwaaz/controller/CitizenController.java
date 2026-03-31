package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.service.CitizenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class CitizenController {
    @Autowired
    private CitizenService citizenService;

    @GetMapping("/{citizenId}")
    public ResponseEntity<Citizen> getCitizenById(@PathVariable Long citizenId){
        return ResponseEntity.ok(citizenService.getCitizenById(citizenId));
    }
    @GetMapping()
    public ResponseEntity<List<Citizen>> getAllCitizens(){
        return ResponseEntity.ok(citizenService.getAllCitizens());
    }
    @PatchMapping("/{citizenId}")
    public ResponseEntity<Citizen> patchCitizen(@PathVariable Long citizenId, @RequestBody Citizen citizen){
        return ResponseEntity.ok(citizenService.patchCitizen(citizenId, citizen));
    }
    @DeleteMapping("/{citizenId}")
    public ResponseEntity<String> deleteCitizen(@PathVariable Long citizenId){
        citizenService.deleteCitizen(citizenId);
        return ResponseEntity.ok("Citizen Deleted successfully");
    }
}
