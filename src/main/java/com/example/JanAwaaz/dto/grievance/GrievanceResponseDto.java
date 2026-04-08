package com.example.JanAwaaz.dto.grievance;

import com.example.JanAwaaz.model.enums.Status;

import java.time.LocalDateTime;

public record GrievanceResponseDto(
        Long grievanceId,
        String imageUrl,
        String description,
        Double latitude,
        Double longitude,
        String addressText,
        Status status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long citizenId,
        Long categoryId,
        String categoryName,
        Long officerId,
        String officerName
) {
}
