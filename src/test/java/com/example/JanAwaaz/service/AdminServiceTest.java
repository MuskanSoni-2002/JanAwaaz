package com.example.JanAwaaz.service;

import com.example.JanAwaaz.dto.admin.AdminGrievanceResponseDto;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.Grievance;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.model.enums.Status;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.AdminRepository;
import com.example.JanAwaaz.repository.GrievanceRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private OfficerRepository officerRepository;

    @Mock
    private GrievanceRepository grievanceRepository;

    @Mock
    private OfficerService officerService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdminService adminService;

    @Test
    void assigningNewOfficerCreatesNotificationsForOfficerAndCitizen() {
        Citizen citizen = new Citizen();
        citizen.setCitizenId(7L);
        citizen.setFirstName("Asha");
        citizen.setLastName("Kumar");
        citizen.setEmail("asha@example.com");
        citizen.setRole(UserRole.CITIZEN);
        citizen.setActive(true);

        Grievance grievance = new Grievance();
        grievance.setGrievanceId(42L);
        grievance.setCitizen(citizen);
        grievance.setStatus(Status.SUBMITTED);

        Officer officer = new Officer();
        officer.setOfficerId(11L);
        officer.setName("Officer Singh");
        officer.setEmail("officer@example.com");
        officer.setRole(UserRole.OFFICER);
        officer.setActive(true);

        when(grievanceRepository.findById(42L)).thenReturn(Optional.of(grievance));
        when(officerRepository.findById(11L)).thenReturn(Optional.of(officer));
        when(grievanceRepository.save(any(Grievance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminGrievanceResponseDto response = adminService.assignGrievance(42L, 11L);

        assertEquals(11L, response.officerId());
        assertEquals(Status.ASSIGNED, response.status());
        verify(notificationService).createOfficerAssignmentNotification(officer, grievance);
        verify(notificationService).createCitizenAssignmentNotification(citizen, officer, grievance);
    }

    @Test
    void reassigningToSameOfficerDoesNotCreateDuplicateNotifications() {
        Citizen citizen = new Citizen();
        citizen.setCitizenId(7L);
        citizen.setFirstName("Asha");
        citizen.setLastName("Kumar");
        citizen.setEmail("asha@example.com");
        citizen.setRole(UserRole.CITIZEN);
        citizen.setActive(true);

        Officer officer = new Officer();
        officer.setOfficerId(11L);
        officer.setName("Officer Singh");
        officer.setEmail("officer@example.com");
        officer.setRole(UserRole.OFFICER);
        officer.setActive(true);

        Grievance grievance = new Grievance();
        grievance.setGrievanceId(42L);
        grievance.setCitizen(citizen);
        grievance.setOfficer(officer);
        grievance.setStatus(Status.ASSIGNED);

        when(grievanceRepository.findById(42L)).thenReturn(Optional.of(grievance));
        when(officerRepository.findById(11L)).thenReturn(Optional.of(officer));
        when(grievanceRepository.save(any(Grievance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminGrievanceResponseDto response = adminService.assignGrievance(42L, 11L);

        assertEquals(11L, response.officerId());
        verify(notificationService, never()).createOfficerAssignmentNotification(any(Officer.class), any(Grievance.class));
        verify(notificationService, never()).createCitizenAssignmentNotification(any(Citizen.class), any(Officer.class), any(Grievance.class));
    }
}
