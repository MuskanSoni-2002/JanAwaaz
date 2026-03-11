package com.example.JanAwaaz.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @Column(nullable = false, unique = true)
    private String categoryName;

    private String description;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}