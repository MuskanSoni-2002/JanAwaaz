package com.example.JanAwaaz.dto.grievance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentCreateRequestDto(
        @NotBlank(message = "Content is required")
        @Size(max = 1000, message = "Content must be at most 1000 characters")
        String content,

        @Size(max = 2048, message = "Attachment URL is too long")
        String attachmentUrl
) {
}
