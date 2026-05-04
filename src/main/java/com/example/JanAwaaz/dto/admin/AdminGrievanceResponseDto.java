package com.example.JanAwaaz.dto.admin;

import com.example.JanAwaaz.model.enums.Status;

import java.time.LocalDateTime;

public record AdminGrievanceResponseDto(
        Long grievanceId,
        String imageUrl,
        String description,
        Double latitude,
        Double longitude,
        String addressText,
        Status status,
        Long citizenId,
        String citizenName,
        Long categoryId,
        String categoryName,
        Long departmentId,
        String departmentName,
        Long officerId,
        String officerName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
