package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.model.Grievance;
import com.example.JanAwaaz.model.enums.Status;
import com.example.JanAwaaz.service.GrievanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/grievances")
public class GrievanceController {

    @Autowired
    private GrievanceService grievanceService;

    @PostMapping
    public ResponseEntity<Grievance> createGrievance(@RequestBody Grievance grievance){
        return new ResponseEntity<>(grievanceService.createGrievance(grievance), HttpStatus.CREATED);
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