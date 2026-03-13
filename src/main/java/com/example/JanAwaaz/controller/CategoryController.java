package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.model.Category;
import com.example.JanAwaaz.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping("/{categoryId}")
    public ResponseEntity<Category> getByCategoryId(@PathVariable Long categoryId) {
        return ResponseEntity.ok(categoryService.getByCategoryId(categoryId));
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}
