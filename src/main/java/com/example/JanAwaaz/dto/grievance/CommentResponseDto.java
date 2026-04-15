package com.example.JanAwaaz.dto.grievance;

import com.example.JanAwaaz.model.enums.UserRole;

import java.time.LocalDateTime;

public record CommentResponseDto(
        Long commentId,
        Long grievanceId,
        String content,
        String attachmentUrl,
        Long senderId,
        UserRole senderRole,
        String senderName,
        LocalDateTime createdAt
) {
}
