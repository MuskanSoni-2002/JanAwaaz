package com.example.JanAwaaz.dto.citizen;

import jakarta.validation.constraints.Pattern;

public record CitizenAddressUpdateRequestDto(
        String addressLine1,
        String addressLine2,
        String city,
        String state,

        @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits")
        String pincode
) {
}
