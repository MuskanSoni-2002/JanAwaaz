package com.example.JanAwaaz.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "officer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Officer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long officerId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true, length = 10)
    private String phoneNumber;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String designation;

    @Column(nullable = false)
    private Boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}
