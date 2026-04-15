package com.example.JanAwaaz.controller;

import com.example.JanAwaaz.dto.grievance.CommentCreateRequestDto;
import com.example.JanAwaaz.dto.grievance.CommentResponseDto;
import com.example.JanAwaaz.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/grievances/{grievanceId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PreAuthorize("hasAnyRole('CITIZEN', 'OFFICER')")
    @PostMapping
    public ResponseEntity<CommentResponseDto> createComment(
            Authentication authentication,
            @PathVariable Long grievanceId,
            @Valid @RequestBody CommentCreateRequestDto requestDto
    ) {
        return new ResponseEntity<>(
                commentService.createComment(grievanceId, requestDto, authentication),
                HttpStatus.CREATED
        );
    }

    @PreAuthorize("hasAnyRole('CITIZEN', 'OFFICER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<CommentResponseDto>> getCommentsByGrievance(
            Authentication authentication,
            @PathVariable Long grievanceId
    ) {
        return ResponseEntity.ok(commentService.getCommentsByGrievance(grievanceId, authentication));
    }
}
