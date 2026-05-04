package com.example.JanAwaaz.service;

import com.example.JanAwaaz.dto.citizen.CitizenAddressUpdateRequestDto;
import com.example.JanAwaaz.dto.citizen.CitizenProfileResponseDto;
import com.example.JanAwaaz.dto.citizen.CitizenProfileUpdateRequestDto;
import com.example.JanAwaaz.exception.DuplicateResourceException;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.enums.Gender;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.CitizenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CitizenServiceTest {

    @Mock
    private CitizenRepository citizenRepo;

    @InjectMocks
    private CitizenService citizenService;

    @Test
    void patchCitizenProfileRejectsIncompleteNewAddress() {
        Citizen citizen = buildCitizen();
        when(citizenRepo.findByEmail("old@example.com")).thenReturn(Optional.of(citizen));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> citizenService.patchCitizenProfileByEmail(
                        "old@example.com",
                        new CitizenProfileUpdateRequestDto(
                                null,
                                null,
                                null,
                                null,
                                null,
                                new CitizenAddressUpdateRequestDto(null, null, "Delhi", null, null)
                        )
                )
        );

        assertEquals(400, exception.getStatusCode().value());
        verify(citizenRepo, never()).save(any(Citizen.class));
    }

    @Test
    void patchCitizenProfileThrowsConflictForDuplicateEmail() {
        Citizen citizen = buildCitizen();
        when(citizenRepo.findByEmail("old@example.com")).thenReturn(Optional.of(citizen));
        when(citizenRepo.existsByEmailAndCitizenIdNot("taken@example.com", 7L)).thenReturn(true);

        DuplicateResourceException exception = assertThrows(
                DuplicateResourceException.class,
                () -> citizenService.patchCitizenProfileByEmail(
                        "old@example.com",
                        new CitizenProfileUpdateRequestDto(
                                null,
                                null,
                                null,
                                "taken@example.com",
                                null,
                                null
                        )
                )
        );

        assertEquals("Email already registered", exception.getMessage());
        verify(citizenRepo, never()).save(any(Citizen.class));
    }

    @Test
    void patchCitizenProfileRejectsBlankFirstName() {
        Citizen citizen = buildCitizen();
        when(citizenRepo.findByEmail("old@example.com")).thenReturn(Optional.of(citizen));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> citizenService.patchCitizenProfileByEmail(
                        "old@example.com",
                        new CitizenProfileUpdateRequestDto(
                                "   ",
                                null,
                                null,
                                null,
                                null,
                                null
                        )
                )
        );

        assertEquals(400, exception.getStatusCode().value());
        verify(citizenRepo, never()).save(any(Citizen.class));
    }

    @Test
    void patchCitizenProfileCreatesAddressWhenRequiredFieldsProvided() {
        Citizen citizen = buildCitizen();

        when(citizenRepo.findByEmail("old@example.com")).thenReturn(Optional.of(citizen));
        when(citizenRepo.save(any(Citizen.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CitizenProfileResponseDto response = citizenService.patchCitizenProfileByEmail(
                "old@example.com",
                new CitizenProfileUpdateRequestDto(
                        null,
                        null,
                        null,
                        null,
                        null,
                        new CitizenAddressUpdateRequestDto(
                                "221B Baker Street",
                                null,
                                "Delhi",
                                "Delhi",
                                "110001"
                        )
                )
        );

        assertEquals("221B Baker Street", response.address().addressLine1());
        assertEquals("Delhi", response.address().city());
        assertEquals("110001", response.address().pincode());
    }

    private Citizen buildCitizen() {
        Citizen citizen = new Citizen();
        citizen.setCitizenId(7L);
        citizen.setFirstName("Asha");
        citizen.setLastName("Kumar");
        citizen.setGender(Gender.Female);
        citizen.setEmail("old@example.com");
        citizen.setPhoneNumber("9876543210");
        citizen.setRole(UserRole.CITIZEN);
        citizen.setActive(true);
        return citizen;
    }
}
