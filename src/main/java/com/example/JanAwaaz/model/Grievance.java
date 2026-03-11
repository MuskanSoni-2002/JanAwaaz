package com.example.JanAwaaz.model;

import com.example.JanAwaaz.model.enums.Status;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "grievances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grievance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long grievanceId;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String addressText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "officer_id")
    private Officer officer;
}