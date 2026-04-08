package com.example.JanAwaaz.dto.citizen;

import com.example.JanAwaaz.model.enums.Gender;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record CitizenProfileUpdateRequestDto(
        String firstName,
        String lastName,
        Gender gender,

        @Email(message = "Invalid email format")
        String email,

        @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
        String phoneNumber,

        @Valid
        CitizenAddressUpdateRequestDto address
) {
}
