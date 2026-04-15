package com.example.JanAwaaz.service;

import com.example.JanAwaaz.model.Admin;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.Notification;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.AdminRepository;
import com.example.JanAwaaz.repository.CitizenRepository;
import com.example.JanAwaaz.repository.NotificationRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepo;

    @Mock
    private CitizenRepository citizenRepo;

    @Mock
    private OfficerRepository officerRepo;

    @Mock
    private AdminRepository adminRepo;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void citizenCannotReadAnotherUsersNotification() {
        Notification notification = buildNotification(50L, UserRole.CITIZEN, 99L, false);
        Citizen citizen = buildCitizen(7L, "asha@example.com");

        when(notificationRepo.findById(50L)).thenReturn(Optional.of(notification));
        when(citizenRepo.findByEmail("asha@example.com")).thenReturn(Optional.of(citizen));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> notificationService.getNotificationById(
                        50L,
                        authentication("asha@example.com", "ROLE_CITIZEN")
                )
        );

        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void citizenCannotMarkAnotherUsersNotificationAsRead() {
        Notification notification = buildNotification(50L, UserRole.CITIZEN, 99L, false);
        Citizen citizen = buildCitizen(7L, "asha@example.com");

        when(notificationRepo.findById(50L)).thenReturn(Optional.of(notification));
        when(citizenRepo.findByEmail("asha@example.com")).thenReturn(Optional.of(citizen));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> notificationService.markAsRead(
                        50L,
                        authentication("asha@example.com", "ROLE_CITIZEN")
                )
        );

        assertEquals(403, exception.getStatusCode().value());
        verify(notificationRepo, never()).save(any(Notification.class));
    }

    @Test
    void citizenCanMarkOwnNotificationAsRead() {
        Notification notification = buildNotification(50L, UserRole.CITIZEN, 7L, false);
        Citizen citizen = buildCitizen(7L, "asha@example.com");

        when(notificationRepo.findById(50L)).thenReturn(Optional.of(notification));
        when(citizenRepo.findByEmail("asha@example.com")).thenReturn(Optional.of(citizen));
        when(notificationRepo.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Notification updated = notificationService.markAsRead(
                50L,
                authentication("asha@example.com", "ROLE_CITIZEN")
        );

        assertEquals(Boolean.TRUE, updated.getIsRead());
        verify(notificationRepo).save(notification);
    }

    @Test
    void adminCanReadAnyNotification() {
        Notification notification = buildNotification(50L, UserRole.CITIZEN, 99L, false);
        Admin admin = new Admin();
        admin.setAdminId(1L);
        admin.setEmail("admin@example.com");
        admin.setActive(true);
        admin.setRole(UserRole.ADMIN);

        when(notificationRepo.findById(50L)).thenReturn(Optional.of(notification));
        when(adminRepo.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));

        Notification result = notificationService.getNotificationById(
                50L,
                authentication("admin@example.com", "ROLE_ADMIN")
        );

        assertEquals(50L, result.getNotificationId());
    }

    private Authentication authentication(String email, String role) {
        return new UsernamePasswordAuthenticationToken(
                email,
                null,
                List.of(new SimpleGrantedAuthority(role))
        );
    }

    private Citizen buildCitizen(Long citizenId, String email) {
        Citizen citizen = new Citizen();
        citizen.setCitizenId(citizenId);
        citizen.setEmail(email);
        citizen.setRole(UserRole.CITIZEN);
        citizen.setActive(true);
        return citizen;
    }

    private Notification buildNotification(Long notificationId, UserRole role, Long recipientId, boolean isRead) {
        Notification notification = new Notification();
        notification.setNotificationId(notificationId);
        notification.setRecipientRole(role);
        notification.setRecipientId(recipientId);
        notification.setIsRead(isRead);
        notification.setMessage("Test notification");
        return notification;
    }
}
