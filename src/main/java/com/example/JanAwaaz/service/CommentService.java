package com.example.JanAwaaz.service;

import com.example.JanAwaaz.dto.grievance.CommentCreateRequestDto;
import com.example.JanAwaaz.dto.grievance.CommentResponseDto;
import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Admin;
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
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepo;

    @Autowired
    private GrievanceRepository grievanceRepo;

    @Autowired
    private CitizenRepository citizenRepo;

    @Autowired
    private OfficerRepository officerRepo;

    @Autowired
    private AdminRepository adminRepo;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public CommentResponseDto createComment(
            Long grievanceId,
            CommentCreateRequestDto request,
            Authentication authentication
    ) {
        Grievance grievance = getAuthorizedGrievance(grievanceId, authentication);
        CommentParticipant participant = resolveParticipant(grievance, authentication);

        Comment comment = new Comment();
        comment.setContent(request.content());
        comment.setAttachmentUrl(request.attachmentUrl());
        comment.setSenderId(participant.senderId());
        comment.setSenderRole(participant.senderRole());
        comment.setReceiverId(participant.receiverId());
        comment.setReceiverRole(participant.receiverRole());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setGrievance(grievance);

        Comment savedComment = commentRepo.save(comment);
        notificationService.createCommentNotification(savedComment, participant.senderName());

        return mapToResponse(savedComment);
    }

    public List<CommentResponseDto> getCommentsByGrievance(Long grievanceId, Authentication authentication) {
        getAuthorizedGrievance(grievanceId, authentication);

        return commentRepo.findByGrievance_GrievanceIdOrderByCreatedAtAsc(grievanceId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private Grievance getAuthorizedGrievance(Long grievanceId, Authentication authentication) {
        Grievance grievance = grievanceRepo.findById(grievanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found with id: " + grievanceId));

        String email = authentication.getName();

        if (hasRole(authentication, "ROLE_CITIZEN")) {
            Citizen citizen = grievance.getCitizen();
            if (citizen != null && email.equalsIgnoreCase(citizen.getEmail())) {
                return grievance;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access comments for this grievance");
        }

        if (hasRole(authentication, "ROLE_OFFICER")) {
            Officer officer = grievance.getOfficer();
            if (officer != null && email.equalsIgnoreCase(officer.getEmail())) {
                return grievance;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access comments for this grievance");
        }

        if (hasRole(authentication, "ROLE_ADMIN")) {
            return grievance;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unsupported role for comment access");
    }

    private CommentParticipant resolveParticipant(Grievance grievance, Authentication authentication) {
        Citizen citizen = grievance.getCitizen();
        Officer officer = grievance.getOfficer();

        if (hasRole(authentication, "ROLE_CITIZEN")) {
            if (officer == null) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cannot add comments until the grievance is assigned to an officer"
                );
            }

            return new CommentParticipant(
                    citizen.getCitizenId(),
                    UserRole.CITIZEN,
                    buildCitizenName(citizen),
                    officer.getOfficerId(),
                    UserRole.OFFICER
            );
        }

        if (hasRole(authentication, "ROLE_OFFICER")) {
            if (officer == null) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cannot add comments to an unassigned grievance"
                );
            }

            return new CommentParticipant(
                    officer.getOfficerId(),
                    UserRole.OFFICER,
                    officer.getName(),
                    citizen.getCitizenId(),
                    UserRole.CITIZEN
            );
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only citizens and officers can create comments");
    }

    private CommentResponseDto mapToResponse(Comment comment) {
        return new CommentResponseDto(
                comment.getCommentId(),
                comment.getGrievance().getGrievanceId(),
                comment.getContent(),
                comment.getAttachmentUrl(),
                comment.getSenderId(),
                comment.getSenderRole(),
                resolveSenderName(comment.getSenderRole(), comment.getSenderId()),
                comment.getCreatedAt()
        );
    }

    private String resolveSenderName(UserRole senderRole, Long senderId) {
        if (senderRole == null || senderId == null) {
            return "Unknown";
        }

        return switch (senderRole) {
            case CITIZEN -> citizenRepo.findById(senderId)
                    .map(this::buildCitizenName)
                    .orElse("Citizen");
            case OFFICER -> officerRepo.findById(senderId)
                    .map(Officer::getName)
                    .orElse("Officer");
            case ADMIN -> adminRepo.findById(senderId)
                    .map(Admin::getName)
                    .orElse("Admin");
        };
    }

    private String buildCitizenName(Citizen citizen) {
        String firstName = citizen.getFirstName() == null ? "" : citizen.getFirstName().trim();
        String lastName = citizen.getLastName() == null ? "" : citizen.getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? "Citizen" : fullName;
    }

    private boolean hasRole(Authentication authentication, String role) {
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (role.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    private record CommentParticipant(
            Long senderId,
            UserRole senderRole,
            String senderName,
            Long receiverId,
            UserRole receiverRole
    ) {
    }
}
