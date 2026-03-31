package com.example.JanAwaaz.dto;

import com.example.JanAwaaz.model.enums.UserRole;

public record OfficerCreateResponseDto(
        Long officerId,
        String name,
        String email,
        String phoneNumber,
        String designation,
        Long departmentId,
        UserRole role,
        Boolean active,
        Boolean forcePasswordChange,
        String temporaryPassword
) {
}
