package com.example.JanAwaaz.dto.officer;

import com.example.JanAwaaz.model.enums.UserRole;

public record OfficerProfileResponseDto(
        Long officerId,
        String name,
        String email,
        String phoneNumber,
        String designation,
        Long departmentId,
        String departmentName,
        UserRole role,
        Boolean active,
        Boolean forcePasswordChange
) {
}
