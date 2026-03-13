package com.example.JanAwaaz.service;

import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Department;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.repository.DepartmentRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OfficerService {
    @Autowired
    private OfficerRepository officerRepo;

    @Autowired
    private DepartmentRepository departmentRepo;

    public Officer createOfficer(Officer officer) {
        if (officer.getDepartment() == null || officer.getDepartment().getDepartmentId() == null) {
            throw new IllegalArgumentException("Department id is required for officer");
        }

        Department department = departmentRepo.findById(officer.getDepartment().getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: "
                        + officer.getDepartment().getDepartmentId()));
        officer.setDepartment(department);
        return officerRepo.save(officer);
    }

    public Officer getOfficerById(Long officerId) {
        return officerRepo.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));
    }

    public List<Officer> getAllOfficers() {
        return officerRepo.findAll();
    }

    public Officer patchOfficer(Officer officer, Long officerId) {
        Officer existingOfficer = officerRepo.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));


        if (officer.getEmail() != null) {
            existingOfficer.setEmail(officer.getEmail());
        }

        if (officer.getPhoneNumber() != null) {
            existingOfficer.setPhoneNumber(officer.getPhoneNumber());
        }

        if (officer.getPassword() != null) {
            existingOfficer.setPassword(officer.getPassword());
        }

        if (officer.getDesignation() != null) {
            existingOfficer.setDesignation(officer.getDesignation());
        }

        if (officer.getActive() != null) {
            existingOfficer.setActive(officer.getActive());
        }

        if (officer.getDepartment() != null && officer.getDepartment().getDepartmentId() != null) {
            Department department = departmentRepo.findById(officer.getDepartment().getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: "
                            + officer.getDepartment().getDepartmentId()));
            existingOfficer.setDepartment(department);
        }

        return officerRepo.save(existingOfficer);
    }

    public void deleteOfficer(Long officerId) {
        Officer existingOfficer = officerRepo.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        existingOfficer.setActive(false);
        officerRepo.save(existingOfficer);
    }
}
