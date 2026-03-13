package com.example.JanAwaaz.service;

import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Grievance;
import com.example.JanAwaaz.model.Notification;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.GrievanceRepository;
import com.example.JanAwaaz.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository NotificationRepo;
    public Notification createNotification(Notification notification) {

        notification.setCreatedAt(LocalDateTime.now());
        notification.setIsRead(false);

        return NotificationRepo.save(notification);
    }
    public Notification getNotificationById(Long id) {

        return NotificationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
    }
    public List<Notification> getAllNotifications() {

        return NotificationRepo.findAll();
    }
    public Notification markAsRead(Long id) {

        Notification notification = NotificationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setIsRead(true);

        return NotificationRepo.save(notification);
    }
}
