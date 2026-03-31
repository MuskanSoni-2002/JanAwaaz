package com.example.JanAwaaz.dto;

import com.example.JanAwaaz.model.enums.Gender;
import com.example.JanAwaaz.model.enums.UserRole;

public record RegisterResponseDto(
        Long citizenId,
        String firstName,
        String lastName,
        Gender gender,
        String email,
        String phoneNumber,
        UserRole role,
        Boolean active
) {
}
