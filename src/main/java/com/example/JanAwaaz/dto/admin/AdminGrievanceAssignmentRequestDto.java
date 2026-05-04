package com.example.JanAwaaz.dto.admin;

import jakarta.validation.constraints.NotNull;

public record AdminGrievanceAssignmentRequestDto(
        @NotNull(message = "Officer id is required")
        Long officerId
) {
}
