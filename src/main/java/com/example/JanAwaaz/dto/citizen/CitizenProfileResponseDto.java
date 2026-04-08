package com.example.JanAwaaz.dto.citizen;

import com.example.JanAwaaz.model.enums.Gender;
import com.example.JanAwaaz.model.enums.UserRole;

public record CitizenProfileResponseDto(
        Long citizenId,
        String firstName,
        String lastName,
        Gender gender,
        String email,
        String phoneNumber,
        CitizenAddressResponseDto address,
        UserRole role,
        Boolean active
) {
}
