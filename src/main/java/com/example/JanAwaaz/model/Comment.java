package com.example.JanAwaaz.model;

import com.example.JanAwaaz.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentId;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    private Long senderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole senderRole;

    @Column(nullable = false)
    private Long receiverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole receiverRole;

    private String attachmentUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "grievance_id", nullable = false)
    private Grievance grievance;
}
