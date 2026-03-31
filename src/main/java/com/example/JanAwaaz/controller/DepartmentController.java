package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.model.Department;
import com.example.JanAwaaz.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/departments")
public class  DepartmentController {
    @Autowired
    private DepartmentService departmentService;

    @GetMapping("/{departmentId}")
    public ResponseEntity<Department> getByDepartmentId(@PathVariable Long departmentId) {
        return ResponseEntity.ok(departmentService.getByDepartmentId(departmentId));
    }

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }
}
