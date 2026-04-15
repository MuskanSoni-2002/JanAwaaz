package com.example.JanAwaaz.service;

import com.example.JanAwaaz.dto.grievance.CommentCreateRequestDto;
import com.example.JanAwaaz.dto.grievance.CommentResponseDto;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.Comment;
import com.example.JanAwaaz.model.Grievance;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.AdminRepository;
import com.example.JanAwaaz.repository.CitizenRepository;
import com.example.JanAwaaz.repository.CommentRepository;
import com.example.JanAwaaz.repository.GrievanceRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepo;

    @Mock
    private GrievanceRepository grievanceRepo;

    @Mock
    private CitizenRepository citizenRepo;

    @Mock
    private OfficerRepository officerRepo;

    @Mock
    private AdminRepository adminRepo;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CommentService commentService;

    @Test
    void createCommentByCitizenBuildsConversationMessage() {
        Citizen citizen = buildCitizen(7L, "asha@example.com", "Asha", "Kumar");
        Officer officer = buildOfficer(11L, "officer@example.com", "Inspector Rao");
        Grievance grievance = buildGrievance(42L, citizen, officer);
        Authentication authentication = authentication("asha@example.com", "ROLE_CITIZEN");

        when(grievanceRepo.findById(42L)).thenReturn(Optional.of(grievance));
        when(citizenRepo.findById(7L)).thenReturn(Optional.of(citizen));
        when(commentRepo.save(any(Comment.class))).thenAnswer(invocation -> {
            Comment savedComment = invocation.getArgument(0);
            savedComment.setCommentId(101L);
            return savedComment;
        });

        CommentResponseDto response = commentService.createComment(
                42L,
                new CommentCreateRequestDto("Please check this update", null),
                authentication
        );

        ArgumentCaptor<Comment> commentCaptor = ArgumentCaptor.forClass(Comment.class);
        verify(commentRepo).save(commentCaptor.capture());
        Comment savedComment = commentCaptor.getValue();

        assertEquals(7L, savedComment.getSenderId());
        assertEquals(UserRole.CITIZEN, savedComment.getSenderRole());
        assertEquals(11L, savedComment.getReceiverId());
        assertEquals(UserRole.OFFICER, savedComment.getReceiverRole());
        assertEquals(grievance, savedComment.getGrievance());
        assertNull(savedComment.getAttachmentUrl());

        verify(notificationService).createCommentNotification(savedComment, "Asha Kumar");

        assertEquals(101L, response.commentId());
        assertEquals(42L, response.grievanceId());
        assertEquals("Please check this update", response.content());
        assertEquals(UserRole.CITIZEN, response.senderRole());
        assertEquals("Asha Kumar", response.senderName());
    }

    @Test
    void createCommentRejectsCitizenForDifferentGrievanceOwner() {
        Citizen grievanceOwner = buildCitizen(7L, "other@example.com", "Other", "Citizen");
        Officer officer = buildOfficer(11L, "officer@example.com", "Inspector Rao");
        Grievance grievance = buildGrievance(42L, grievanceOwner, officer);
        Authentication authentication = authentication("asha@example.com", "ROLE_CITIZEN");

        when(grievanceRepo.findById(42L)).thenReturn(Optional.of(grievance));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> commentService.createComment(
                        42L,
                        new CommentCreateRequestDto("Unauthorized message", null),
                        authentication
                )
        );

        assertEquals(403, exception.getStatusCode().value());
        verify(commentRepo, never()).save(any(Comment.class));
        verify(notificationService, never()).createCommentNotification(any(Comment.class), any(String.class));
    }

    @Test
    void createCommentRejectsCitizenWhenGrievanceIsUnassigned() {
        Citizen citizen = buildCitizen(7L, "asha@example.com", "Asha", "Kumar");
        Grievance grievance = buildGrievance(42L, citizen, null);
        Authentication authentication = authentication("asha@example.com", "ROLE_CITIZEN");

        when(grievanceRepo.findById(42L)).thenReturn(Optional.of(grievance));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> commentService.createComment(
                        42L,
                        new CommentCreateRequestDto("Anyone there?", null),
                        authentication
                )
        );

        assertEquals(409, exception.getStatusCode().value());
        verify(commentRepo, never()).save(any(Comment.class));
        verify(notificationService, never()).createCommentNotification(any(Comment.class), any(String.class));
    }

    @Test
    void getCommentsByGrievanceReturnsThreadForAssignedOfficer() {
        Citizen citizen = buildCitizen(7L, "asha@example.com", "Asha", "Kumar");
        Officer officer = buildOfficer(11L, "officer@example.com", "Inspector Rao");
        Grievance grievance = buildGrievance(42L, citizen, officer);
        Authentication authentication = authentication("officer@example.com", "ROLE_OFFICER");

        Comment citizenComment = Comment.builder()
                .commentId(1L)
                .content("Citizen reply")
                .senderId(7L)
                .senderRole(UserRole.CITIZEN)
                .receiverId(11L)
                .receiverRole(UserRole.OFFICER)
                .grievance(grievance)
                .build();

        Comment officerComment = Comment.builder()
                .commentId(2L)
                .content("Officer reply")
                .senderId(11L)
                .senderRole(UserRole.OFFICER)
                .receiverId(7L)
                .receiverRole(UserRole.CITIZEN)
                .grievance(grievance)
                .build();

        when(grievanceRepo.findById(42L)).thenReturn(Optional.of(grievance));
        when(commentRepo.findByGrievance_GrievanceIdOrderByCreatedAtAsc(42L))
                .thenReturn(List.of(citizenComment, officerComment));
        when(citizenRepo.findById(7L)).thenReturn(Optional.of(citizen));
        when(officerRepo.findById(11L)).thenReturn(Optional.of(officer));

        List<CommentResponseDto> response = commentService.getCommentsByGrievance(42L, authentication);

        assertEquals(2, response.size());
        assertEquals("Asha Kumar", response.get(0).senderName());
        assertEquals("Inspector Rao", response.get(1).senderName());
        verify(commentRepo).findByGrievance_GrievanceIdOrderByCreatedAtAsc(42L);
        verify(notificationService, never()).createCommentNotification(any(Comment.class), any(String.class));
    }

    private Authentication authentication(String email, String role) {
        return new UsernamePasswordAuthenticationToken(
                email,
                null,
                List.of(new SimpleGrantedAuthority(role))
        );
    }

    private Citizen buildCitizen(Long citizenId, String email, String firstName, String lastName) {
        Citizen citizen = new Citizen();
        citizen.setCitizenId(citizenId);
        citizen.setEmail(email);
        citizen.setFirstName(firstName);
        citizen.setLastName(lastName);
        citizen.setRole(UserRole.CITIZEN);
        citizen.setActive(true);
        return citizen;
    }

    private Officer buildOfficer(Long officerId, String email, String name) {
        Officer officer = new Officer();
        officer.setOfficerId(officerId);
        officer.setEmail(email);
        officer.setName(name);
        officer.setRole(UserRole.OFFICER);
        officer.setActive(true);
        return officer;
    }

    private Grievance buildGrievance(Long grievanceId, Citizen citizen, Officer officer) {
        Grievance grievance = new Grievance();
        grievance.setGrievanceId(grievanceId);
        grievance.setCitizen(citizen);
        grievance.setOfficer(officer);
        return grievance;
    }
}
