package com.example.JanAwaaz.service;

import com.example.JanAwaaz.model.Grievance;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.model.enums.Status;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.CategoryRepository;
import com.example.JanAwaaz.repository.CitizenRepository;
import com.example.JanAwaaz.repository.GrievanceRepository;
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
class GrievanceServiceTest {

    @Mock
    private GrievanceRepository grievanceRepo;

    @Mock
    private CitizenRepository citizenRepo;

    @Mock
    private CategoryRepository categoryRepo;

    @Mock
    private OfficerRepository officerRepo;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private GrievanceService grievanceService;

    @Test
    void officerCannotReadAnotherOfficersGrievance() {
        Grievance grievance = buildGrievance("assigned@example.com", "owner@example.com");
        when(grievanceRepo.findById(42L)).thenReturn(Optional.of(grievance));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> grievanceService.getGrievanceById(
                        42L,
                        authentication("other@example.com", "ROLE_OFFICER")
                )
        );

        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void officerCannotUpdateAnotherOfficersGrievanceStatus() {
        Grievance grievance = buildGrievance("assigned@example.com", "owner@example.com");
        when(grievanceRepo.findById(42L)).thenReturn(Optional.of(grievance));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> grievanceService.patchGrievanceStatus(
                        42L,
                        Status.RESOLVED,
                        authentication("other@example.com", "ROLE_OFFICER")
                )
        );

        assertEquals(403, exception.getStatusCode().value());
        verify(grievanceRepo, never()).save(any(Grievance.class));
    }

    @Test
    void assignedOfficerCanUpdateGrievanceStatus() {
        Grievance grievance = buildGrievance("assigned@example.com", "owner@example.com");
        when(grievanceRepo.findById(42L)).thenReturn(Optional.of(grievance));
        when(grievanceRepo.save(any(Grievance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Grievance updated = grievanceService.patchGrievanceStatus(
                42L,
                Status.RESOLVED,
                authentication("assigned@example.com", "ROLE_OFFICER")
        );

        assertEquals(Status.RESOLVED, updated.getStatus());
        verify(grievanceRepo).save(grievance);
    }

    @Test
    void citizenCanReadOwnGrievance() {
        Grievance grievance = buildGrievance("assigned@example.com", "owner@example.com");
        when(grievanceRepo.findById(42L)).thenReturn(Optional.of(grievance));

        Grievance result = grievanceService.getGrievanceById(
                42L,
                authentication("owner@example.com", "ROLE_CITIZEN")
        );

        assertEquals(42L, result.getGrievanceId());
    }

    @Test
    void citizenCannotReadAnotherCitizensGrievance() {
        Grievance grievance = buildGrievance("assigned@example.com", "owner@example.com");
        when(grievanceRepo.findById(42L)).thenReturn(Optional.of(grievance));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> grievanceService.getGrievanceById(
                        42L,
                        authentication("other@example.com", "ROLE_CITIZEN")
                )
        );

        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void adminCanReadAnyGrievance() {
        Grievance grievance = buildGrievance("assigned@example.com", "owner@example.com");
        when(grievanceRepo.findById(42L)).thenReturn(Optional.of(grievance));

        Grievance result = grievanceService.getGrievanceById(
                42L,
                authentication("admin@example.com", "ROLE_ADMIN")
        );

        assertEquals(42L, result.getGrievanceId());
    }

    @Test
    void adminCanUpdateAnyGrievanceStatus() {
        Grievance grievance = buildGrievance("assigned@example.com", "owner@example.com");
        when(grievanceRepo.findById(42L)).thenReturn(Optional.of(grievance));
        when(grievanceRepo.save(any(Grievance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Grievance updated = grievanceService.patchGrievanceStatus(
                42L,
                Status.IN_PROGRESS,
                authentication("admin@example.com", "ROLE_ADMIN")
        );

        assertEquals(Status.IN_PROGRESS, updated.getStatus());
        verify(grievanceRepo).save(grievance);
    }

    private Authentication authentication(String email, String role) {
        return new UsernamePasswordAuthenticationToken(
                email,
                null,
                List.of(new SimpleGrantedAuthority(role))
        );
    }

    private Grievance buildGrievance(String officerEmail, String citizenEmail) {
        Citizen citizen = new Citizen();
        citizen.setCitizenId(7L);
        citizen.setEmail(citizenEmail);
        citizen.setRole(UserRole.CITIZEN);
        citizen.setActive(true);

        Officer officer = new Officer();
        officer.setOfficerId(11L);
        officer.setEmail(officerEmail);
        officer.setRole(UserRole.OFFICER);
        officer.setActive(true);

        Grievance grievance = new Grievance();
        grievance.setGrievanceId(42L);
        grievance.setCitizen(citizen);
        grievance.setOfficer(officer);
        grievance.setStatus(Status.ASSIGNED);
        return grievance;
    }
}
