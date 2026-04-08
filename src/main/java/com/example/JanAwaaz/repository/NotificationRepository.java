package com.example.JanAwaaz.repository;

import com.example.JanAwaaz.model.Notification;
import com.example.JanAwaaz.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientRoleAndRecipientIdOrderByCreatedAtDesc(UserRole recipientRole, Long recipientId);
}
