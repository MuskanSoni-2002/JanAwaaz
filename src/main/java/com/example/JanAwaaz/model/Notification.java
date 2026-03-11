package com.example.JanAwaaz.model;

import com.example.JanAwaaz.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false)
    private Long recipientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole recipientRole;

    @Column(nullable = false)
    private Boolean isRead;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "grievance_id", nullable = false)
    private Grievance grievance;
}
