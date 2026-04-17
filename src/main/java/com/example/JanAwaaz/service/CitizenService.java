package com.example.JanAwaaz.service;

import com.example.JanAwaaz.dto.citizen.CitizenAddressResponseDto;
import com.example.JanAwaaz.dto.citizen.CitizenAddressUpdateRequestDto;
import com.example.JanAwaaz.dto.citizen.CitizenProfileResponseDto;
import com.example.JanAwaaz.dto.citizen.CitizenProfileUpdateRequestDto;
import com.example.JanAwaaz.exception.DuplicateResourceException;
import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Address;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.repository.CitizenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class CitizenService {
    @Autowired
    private CitizenRepository citizenRepo;

    public CitizenProfileResponseDto getCitizenProfileByEmail(String email) {
        Citizen citizen = citizenRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with email: " + email));
        return mapToProfileResponse(citizen);
    }

    public CitizenProfileResponseDto patchCitizenProfileByEmail(String email, CitizenProfileUpdateRequestDto request) {
        Citizen existingCitizen = citizenRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with email: " + email));

        if (request.firstName() != null) {
            validateNonBlankField(request.firstName(), "First name");
            existingCitizen.setFirstName(request.firstName());
        }

        if (request.lastName() != null) {
            validateNonBlankField(request.lastName(), "Last name");
            existingCitizen.setLastName(request.lastName());
        }

        if (request.gender() != null) {
            existingCitizen.setGender(request.gender());
        }

        if (request.email() != null) {
            if (citizenRepo.existsByEmailAndCitizenIdNot(request.email(), existingCitizen.getCitizenId())) {
                throw new DuplicateResourceException("Email already registered");
            }
            existingCitizen.setEmail(request.email());
        }

        if (request.phoneNumber() != null) {
            if (citizenRepo.existsByPhoneNumberAndCitizenIdNot(request.phoneNumber(), existingCitizen.getCitizenId())) {
                throw new DuplicateResourceException("Phone number already registered");
            }
            existingCitizen.setPhoneNumber(request.phoneNumber());
        }

        if (request.address() != null) {
            Address updatedAddress = applyAddressPatch(existingCitizen.getAddress(), request.address());
            existingCitizen.setAddress(updatedAddress);
        }

        Citizen savedCitizen = citizenRepo.save(existingCitizen);
        return mapToProfileResponse(savedCitizen);
    }

    public List<CitizenProfileResponseDto> getAllCitizens() {
        return citizenRepo.findAll().stream()
                .map(this::mapToProfileResponse)
                .toList();
    }

    public void deleteCitizen(String email) {
        Citizen existingCitizen = citizenRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with email: " + email));

        if (existingCitizen.getActive()) {
            existingCitizen.setActive(false);
        }
        citizenRepo.save(existingCitizen);
    }

    private Address applyAddressPatch(Address existingAddress, CitizenAddressUpdateRequestDto addressRequest) {
        Address addressToSave = existingAddress;
        if (addressToSave == null) {
            validateRequiredAddressFields(addressRequest);
            addressToSave = new Address();
        }

        if (addressRequest.addressLine1() != null) {
            addressToSave.setAddressLine1(addressRequest.addressLine1());
        }
        if (addressRequest.addressLine2() != null) {
            addressToSave.setAddressLine2(addressRequest.addressLine2());
        }
        if (addressRequest.city() != null) {
            addressToSave.setCity(addressRequest.city());
        }
        if (addressRequest.state() != null) {
            addressToSave.setState(addressRequest.state());
        }
        if (addressRequest.pincode() != null) {
            addressToSave.setPincode(addressRequest.pincode());
        }

        return addressToSave;
    }

    private void validateRequiredAddressFields(CitizenAddressUpdateRequestDto addressRequest) {
        if (isBlank(addressRequest.addressLine1())
                || isBlank(addressRequest.city())
                || isBlank(addressRequest.state())
                || isBlank(addressRequest.pincode())) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "addressLine1, city, state, and pincode are required when adding an address");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void validateNonBlankField(String value, String fieldName) {
        if (isBlank(value)) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " cannot be blank");
        }
    }

    private CitizenProfileResponseDto mapToProfileResponse(Citizen citizen) {
        CitizenAddressResponseDto addressResponse = null;
        if (citizen.getAddress() != null) {
            addressResponse = new CitizenAddressResponseDto(
                    citizen.getAddress().getAddressLine1(),
                    citizen.getAddress().getAddressLine2(),
                    citizen.getAddress().getCity(),
                    citizen.getAddress().getState(),
                    citizen.getAddress().getPincode());
        }

        return new CitizenProfileResponseDto(
                citizen.getCitizenId(),
                citizen.getFirstName(),
                citizen.getLastName(),
                citizen.getGender(),
                citizen.getEmail(),
                citizen.getPhoneNumber(),
                addressResponse,
                citizen.getRole(),
                citizen.getActive());
    }

    public CitizenProfileResponseDto getCitizenById(Long citizenId) {
        Citizen citizen = citizenRepo.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + citizenId));
        return mapToProfileResponse(citizen);
    }
}
