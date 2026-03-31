package com.example.JanAwaaz.dto;
import jakarta.validation.constraints.NotBlank;

public record AddressRequestDto(
        @NotBlank(message = "Address Line is required")
        String addressLine1,

        String addressLine2,

        @NotBlank(message = "City is required")
        String city,

        @NotBlank(message = "State is required")
        String state,

        @NotBlank(message = "Pincode is required")
        String pincode

) {}
