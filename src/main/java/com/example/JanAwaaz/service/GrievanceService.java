package com.example.JanAwaaz.service;

import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Grievance;
import com.example.JanAwaaz.model.enums.Status;
import com.example.JanAwaaz.repository.DepartmentRepository;
import com.example.JanAwaaz.repository.GrievanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class GrievanceService {
    @Autowired
    private GrievanceRepository GrievanceRepo;

    public Grievance getGrievanceById(Long grievanceId){
        return GrievanceRepo.findById(grievanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found with id: "+ grievanceId));
    }

    public List<Grievance> getAllGrievances(){
        return GrievanceRepo.findAll();
    }

    public void deleteGrievance(Long id) {
        Grievance grievance = GrievanceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found"));

        GrievanceRepo.delete(grievance);
    }
    public Grievance createGrievance(Grievance grievance) {
        return GrievanceRepo.save(grievance);
    }

    public Grievance patchGrievanceStatus(Long grievanceId, Status status) {

        Grievance grievance = GrievanceRepo.findById(grievanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found"));

        grievance.setStatus(status);

        return GrievanceRepo.save(grievance);
    }
}
