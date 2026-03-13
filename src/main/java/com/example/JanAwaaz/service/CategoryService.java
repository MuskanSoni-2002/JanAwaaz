package com.example.JanAwaaz.service;

import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Category;
import com.example.JanAwaaz.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepo;

    public Category getByCategoryId(Long catId){
        return categoryRepo.findById(catId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: "+ catId));
    }
    public List<Category> getAllCategories(){
        return categoryRepo.findAll();
    }
}
