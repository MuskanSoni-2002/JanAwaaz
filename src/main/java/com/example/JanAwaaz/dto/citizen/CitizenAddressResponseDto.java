package com.example.JanAwaaz.dto.citizen;

public record CitizenAddressResponseDto(
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String pincode
) {
}
