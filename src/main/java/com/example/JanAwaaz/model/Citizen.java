package com.example.JanAwaaz.model;

import com.example.JanAwaaz.model.enums.Gender;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "citizen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Citizen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long citizenId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true, length = 10)
    private String phoneNumber;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private Boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id")
    private Address address;
}
