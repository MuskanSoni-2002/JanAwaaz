package com.example.JanAwaaz.service;

import com.example.JanAwaaz.dto.grievance.GrievanceRequestDto;
import com.example.JanAwaaz.dto.grievance.GrievanceResponseDto;
import com.example.JanAwaaz.model.Category;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.Department;
import com.example.JanAwaaz.model.Grievance;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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

    @Mock
    private FileStorageService fileStorageService;

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
        verify(notificationService).createCitizenStatusUpdateNotification(grievance, Status.ASSIGNED);
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
        verify(notificationService).createCitizenStatusUpdateNotification(grievance, Status.ASSIGNED);
    }

    @Test
    void createGrievanceWithAvailableOfficerStoresUploadedImageAndNotifiesBothRecipients() {
        Citizen citizen = buildCitizen("owner@example.com");
        Category category = buildCategory(5L);
        Officer officer = buildOfficer("assigned@example.com");
        MockMultipartFile imageFile = new MockMultipartFile("imageFile", "pothole.jpg", "image/jpeg", new byte[]{1, 2, 3});
        GrievanceRequestDto request = buildCreateRequest(category.getCategoryId(), imageFile);

        when(citizenRepo.findByEmail("owner@example.com")).thenReturn(Optional.of(citizen));
        when(categoryRepo.findById(category.getCategoryId())).thenReturn(Optional.of(category));
        when(officerRepo.findLeastLoadedActiveOfficersByDepartment(any(), any(), any())).thenReturn(List.of(officer));
        when(fileStorageService.storeGrievanceImage(imageFile)).thenReturn("/uploads/grievances/test-image.jpg");
        when(grievanceRepo.save(any(Grievance.class))).thenAnswer(invocation -> {
            Grievance saved = invocation.getArgument(0);
            saved.setGrievanceId(99L);
            return saved;
        });

        GrievanceResponseDto response = grievanceService.createGrievance("owner@example.com", request);

        assertEquals(99L, response.grievanceId());
        assertEquals("/uploads/grievances/test-image.jpg", response.imageUrl());
        assertEquals(Status.ASSIGNED, response.status());
        assertEquals(officer.getOfficerId(), response.officerId());
        verify(fileStorageService).storeGrievanceImage(imageFile);
        verify(notificationService).createOfficerAssignmentNotification(eq(officer), any(Grievance.class));
        verify(notificationService).createCitizenSubmissionNotification(eq(citizen), eq(officer), any(Grievance.class));
        verify(notificationService, never()).createCitizenSubmissionPendingNotification(any(Citizen.class), any(Grievance.class));
    }

    @Test
    void createGrievanceWithoutAvailableOfficerStaysSubmittedAndNotifiesCitizenOnly() {
        Citizen citizen = buildCitizen("owner@example.com");
        Category category = buildCategory(5L);
        GrievanceRequestDto request = buildCreateRequest(category.getCategoryId(), null);

        when(citizenRepo.findByEmail("owner@example.com")).thenReturn(Optional.of(citizen));
        when(categoryRepo.findById(category.getCategoryId())).thenReturn(Optional.of(category));
        when(officerRepo.findLeastLoadedActiveOfficersByDepartment(any(), any(), any())).thenReturn(List.of());
        when(fileStorageService.storeGrievanceImage(null)).thenReturn(null);
        when(grievanceRepo.save(any(Grievance.class))).thenAnswer(invocation -> {
            Grievance saved = invocation.getArgument(0);
            saved.setGrievanceId(100L);
            return saved;
        });

        GrievanceResponseDto response = grievanceService.createGrievance("owner@example.com", request);

        assertEquals(100L, response.grievanceId());
        assertEquals(Status.SUBMITTED, response.status());
        assertEquals(null, response.officerId());
        verify(notificationService).createCitizenSubmissionPendingNotification(eq(citizen), any(Grievance.class));
        verify(notificationService, never()).createOfficerAssignmentNotification(any(Officer.class), any(Grievance.class));
        verify(notificationService, never()).createCitizenSubmissionNotification(any(Citizen.class), any(Officer.class), any(Grievance.class));
    }

    private Authentication authentication(String email, String role) {
        return new UsernamePasswordAuthenticationToken(
                email,
                null,
                List.of(new SimpleGrantedAuthority(role))
        );
    }

    private Citizen buildCitizen(String email) {
        Citizen citizen = new Citizen();
        citizen.setCitizenId(7L);
        citizen.setFirstName("Asha");
        citizen.setLastName("Kumar");
        citizen.setEmail(email);
        citizen.setPhoneNumber("9876543210");
        citizen.setPassword("secret");
        citizen.setRole(UserRole.CITIZEN);
        citizen.setActive(true);
        return citizen;
    }

    private Officer buildOfficer(String email) {
        Officer officer = new Officer();
        officer.setOfficerId(11L);
        officer.setName("Officer Singh");
        officer.setEmail(email);
        officer.setPhoneNumber("9988776655");
        officer.setPassword("secret");
        officer.setDesignation("Inspector");
        officer.setRole(UserRole.OFFICER);
        officer.setActive(true);
        officer.setDepartment(buildDepartment(3L));
        return officer;
    }

    private Department buildDepartment(Long departmentId) {
        Department department = new Department();
        department.setDepartmentId(departmentId);
        department.setDepartmentName("Public Works");
        return department;
    }

    private Category buildCategory(Long categoryId) {
        Category category = new Category();
        category.setCategoryId(categoryId);
        category.setCategoryName("Road Repair");
        category.setDepartment(buildDepartment(3L));
        return category;
    }

    private GrievanceRequestDto buildCreateRequest(Long categoryId, MockMultipartFile imageFile) {
        GrievanceRequestDto request = new GrievanceRequestDto();
        request.setCategoryId(categoryId);
        request.setDescription("Large pothole blocking half the road.");
        request.setLatitude(28.6139);
        request.setLongitude(77.2090);
        request.setAddressText("Near the post office");
        request.setImageFile(imageFile);
        return request;
    }

    private Grievance buildGrievance(String officerEmail, String citizenEmail) {
        Citizen citizen = buildCitizen(citizenEmail);
        Officer officer = buildOfficer(officerEmail);

        Grievance grievance = new Grievance();
        grievance.setGrievanceId(42L);
        grievance.setCitizen(citizen);
        grievance.setOfficer(officer);
        grievance.setStatus(Status.ASSIGNED);
        return grievance;
    }
}
