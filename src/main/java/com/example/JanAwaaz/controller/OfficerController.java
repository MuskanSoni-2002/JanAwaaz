package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.service.OfficerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/officers")
public class OfficerController {
    @Autowired
    private OfficerService officerService;

    @PostMapping
    public ResponseEntity<Officer> createOfficer(@RequestBody Officer officer){
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
    public ResponseEntity<Officer> patchOfficer(@RequestBody Officer officer, @PathVariable Long officerId) {
        return ResponseEntity.ok(officerService.patchOfficer(officer, officerId));
    }

    @DeleteMapping("/{officerId}")
    public ResponseEntity<String> deleteOfficer(@PathVariable Long officerId) {
        officerService.deleteOfficer(officerId);
        return ResponseEntity.ok("Officer Deleted successfully");
    }
}
