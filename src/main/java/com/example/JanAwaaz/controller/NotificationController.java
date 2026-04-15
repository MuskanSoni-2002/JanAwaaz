package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.model.Notification;
import com.example.JanAwaaz.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification){
        return new ResponseEntity<>(notificationService.createNotification(notification), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER', 'CITIZEN')")
    @GetMapping("/{notificationId}")
    public ResponseEntity<Notification> getNotificationById(
            @PathVariable Long notificationId,
            Authentication authentication
    ){
        return ResponseEntity.ok(notificationService.getNotificationById(notificationId, authentication));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications(){
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER', 'CITIZEN')")
    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getMyNotifications(authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER', 'CITIZEN')")
    @PatchMapping("/{notificationId}")
    public ResponseEntity<Notification> markNotificationAsRead(
            @PathVariable Long notificationId,
            Authentication authentication
    ){
        return ResponseEntity.ok(notificationService.markAsRead(notificationId, authentication));
    }
}
