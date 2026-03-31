package com.example.JanAwaaz.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record OfficerPatchRequestDto(
        String name,

        @Email(message = "Invalid email format")
        String email,

        @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
        String phoneNumber,

        String designation,
        Boolean active,
        Long departmentId
) {
}
