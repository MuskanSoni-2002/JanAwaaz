package com.example.JanAwaaz.service;

import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Department;
import com.example.JanAwaaz.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {
    @Autowired
    private DepartmentRepository departmentRepo;

    public Department getByDepartmentId(Long deptId){
        return departmentRepo.findById(deptId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: "+ deptId));
    }
    public List<Department> getAllDepartments(){
        return departmentRepo.findAll();
    }
}
