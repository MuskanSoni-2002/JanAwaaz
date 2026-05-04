package com.example.JanAwaaz.service;

import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Admin;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.Comment;
import com.example.JanAwaaz.model.Grievance;
import com.example.JanAwaaz.model.Notification;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.model.enums.Status;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.AdminRepository;
import com.example.JanAwaaz.repository.CitizenRepository;
import com.example.JanAwaaz.repository.NotificationRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository NotificationRepo;

    @Autowired
    private CitizenRepository citizenRepo;

    @Autowired
    private OfficerRepository officerRepo;

    @Autowired
    private AdminRepository adminRepo;

    public Notification createOfficerAssignmentNotification(Officer officer, Grievance grievance){
        Notification notification = new Notification();
        notification.setMessage("New grievance #" + grievance.getGrievanceId() + " has been assigned to you.");
        notification.setRecipientId(officer.getOfficerId());
        notification.setRecipientRole(UserRole.OFFICER);
        notification.setGrievance(grievance);
        return createNotification(notification);
    }
    public Notification createCitizenSubmissionNotification(Citizen citizen, Officer officer, Grievance grievance){
        Notification notification = new Notification();
        notification.setMessage("Your grievance #" + grievance.getGrievanceId() + " has been submitted and assigned to " + officer.getName());
        notification.setRecipientId(citizen.getCitizenId());
        notification.setRecipientRole(UserRole.CITIZEN);
        notification.setGrievance(grievance);
        return createNotification(notification);
    }

    public Notification createCitizenSubmissionPendingNotification(Citizen citizen, Grievance grievance) {
        Notification notification = new Notification();
        notification.setMessage("Your grievance #" + grievance.getGrievanceId() + " has been submitted and is awaiting officer assignment.");
        notification.setRecipientId(citizen.getCitizenId());
        notification.setRecipientRole(UserRole.CITIZEN);
        notification.setGrievance(grievance);
        return createNotification(notification);
    }

    public Notification createCitizenAssignmentNotification(Citizen citizen, Officer officer, Grievance grievance) {
        Notification notification = new Notification();
        notification.setMessage("Your grievance #" + grievance.getGrievanceId() + " is now assigned to " + officer.getName() + ".");
        notification.setRecipientId(citizen.getCitizenId());
        notification.setRecipientRole(UserRole.CITIZEN);
        notification.setGrievance(grievance);
        return createNotification(notification);
    }

    public Notification createCitizenStatusUpdateNotification(Grievance grievance, Status previousStatus) {
        Citizen citizen = grievance.getCitizen();
        if (citizen == null || grievance.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot create a status notification without grievance owner and status");
        }

        Notification notification = new Notification();
        String currentStatus = formatStatus(grievance.getStatus());
        String message = previousStatus == null
                ? "Your grievance #" + grievance.getGrievanceId() + " status is now " + currentStatus + "."
                : "Your grievance #" + grievance.getGrievanceId() + " status changed from " + formatStatus(previousStatus) + " to " + currentStatus + ".";

        notification.setMessage(message);
        notification.setRecipientId(citizen.getCitizenId());
        notification.setRecipientRole(UserRole.CITIZEN);
        notification.setGrievance(grievance);
        return createNotification(notification);
    }

    public Notification createCommentNotification(Comment comment, String senderName) {
        Notification notification = new Notification();
        notification.setMessage("New message on grievance #" + comment.getGrievance().getGrievanceId() + " from " + senderName + ".");
        notification.setRecipientId(comment.getReceiverId());
        notification.setRecipientRole(comment.getReceiverRole());
        notification.setGrievance(comment.getGrievance());
        return createNotification(notification);
    }

    public Notification createNotification(Notification notification) {

        notification.setCreatedAt(LocalDateTime.now());
        notification.setIsRead(false);

        return NotificationRepo.save(notification);
    }
    public Notification getNotificationById(Long id, Authentication authentication) {
        return getAuthorizedNotification(id, authentication);
    }
    public List<Notification> getAllNotifications() {

        return NotificationRepo.findAll();
    }
    public Notification markAsRead(Long id, Authentication authentication) {
        Notification notification = getAuthorizedNotification(id, authentication);

        notification.setIsRead(true);

        return NotificationRepo.save(notification);
    }

    public List<Notification> getMyNotifications(Authentication authentication) {
        String email = authentication.getName();

        if (hasRole(authentication, "ROLE_CITIZEN")) {
            Citizen citizen = citizenRepo.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with email: " + email));
            return NotificationRepo.findByRecipientRoleAndRecipientIdOrderByCreatedAtDesc(
                    UserRole.CITIZEN,
                    citizen.getCitizenId()
            );
        }

        if (hasRole(authentication, "ROLE_OFFICER")) {
            Officer officer = officerRepo.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Officer not found with email: " + email));
            return NotificationRepo.findByRecipientRoleAndRecipientIdOrderByCreatedAtDesc(
                    UserRole.OFFICER,
                    officer.getOfficerId()
            );
        }

        if (hasRole(authentication, "ROLE_ADMIN")) {
            Admin admin = adminRepo.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));
            return NotificationRepo.findByRecipientRoleAndRecipientIdOrderByCreatedAtDesc(
                    UserRole.ADMIN,
                    admin.getAdminId()
            );
        }

        throw new RuntimeException("Unsupported role for notification retrieval");
    }

    private boolean hasRole(Authentication authentication, String role) {
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (role.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    private Notification getAuthorizedNotification(Long id, Authentication authentication) {
        Notification notification = NotificationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (hasRole(authentication, "ROLE_ADMIN")) {
            adminRepo.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + authentication.getName()));
            return notification;
        }

        NotificationRecipient recipient = resolveRecipient(authentication);
        if (notification.getRecipientRole() == recipient.role()
                && notification.getRecipientId() != null
                && notification.getRecipientId().equals(recipient.recipientId())) {
            return notification;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this notification");
    }

    private NotificationRecipient resolveRecipient(Authentication authentication) {
        String email = authentication.getName();

        if (hasRole(authentication, "ROLE_CITIZEN")) {
            Citizen citizen = citizenRepo.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with email: " + email));
            return new NotificationRecipient(UserRole.CITIZEN, citizen.getCitizenId());
        }

        if (hasRole(authentication, "ROLE_OFFICER")) {
            Officer officer = officerRepo.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Officer not found with email: " + email));
            return new NotificationRecipient(UserRole.OFFICER, officer.getOfficerId());
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unsupported role for notification access");
    }

    private String formatStatus(Status status) {
        return Stream.of(String.valueOf(status).split("_"))
                .map(segment -> segment.substring(0, 1).toUpperCase(Locale.ROOT) + segment.substring(1).toLowerCase(Locale.ROOT))
                .collect(Collectors.joining(" "));
    }

    private record NotificationRecipient(UserRole role, Long recipientId) {
    }
}
