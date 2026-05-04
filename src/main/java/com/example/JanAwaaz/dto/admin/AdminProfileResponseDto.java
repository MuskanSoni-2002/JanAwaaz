package com.example.JanAwaaz.dto.admin;

import com.example.JanAwaaz.model.enums.UserRole;

public record AdminProfileResponseDto(
        Long adminId,
        String name,
        String email,
        Boolean active,
        UserRole role
) {
}
