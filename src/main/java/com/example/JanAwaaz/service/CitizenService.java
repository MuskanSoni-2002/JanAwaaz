package com.example.JanAwaaz.service;

import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Address;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.repository.AddressRepository;
import com.example.JanAwaaz.repository.CitizenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CitizenService {
    @Autowired
    private CitizenRepository citizenRepo;

    @Autowired
    private AddressRepository addressRepo;

    public Citizen getCitizenById(Long citizenId){
        return citizenRepo.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + citizenId));
    }
    public List<Citizen> getAllCitizens() {
        return citizenRepo.findAll();
    }
    public Citizen patchCitizen(Long citizenId, Citizen citizen){
        Citizen existingCitizen = citizenRepo.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + citizenId));

        if (citizen.getPhoneNumber() != null) {
            existingCitizen.setPhoneNumber(citizen.getPhoneNumber());
        }

        if (citizen.getEmail() != null) {
            existingCitizen.setEmail(citizen.getEmail());
        }

        if (citizen.getAddress() != null) {
            Address existingAddress = existingCitizen.getAddress();

            if (existingAddress == null) {
                Address savedAddress = addressRepo.save(citizen.getAddress());
                existingCitizen.setAddress(savedAddress);
            } else {
                if (citizen.getAddress().getAddressLine1() != null) {
                    existingAddress.setAddressLine1(citizen.getAddress().getAddressLine1());
                }
                if (citizen.getAddress().getAddressLine2() != null) {
                    existingAddress.setAddressLine2(citizen.getAddress().getAddressLine2());
                }
                if (citizen.getAddress().getCity() != null) {
                    existingAddress.setCity(citizen.getAddress().getCity());
                }
                if (citizen.getAddress().getState() != null) {
                    existingAddress.setState(citizen.getAddress().getState());
                }
                if (citizen.getAddress().getPincode() != null) {
                    existingAddress.setPincode(citizen.getAddress().getPincode());
                }
                addressRepo.save(existingAddress);
            }
        }
        return citizenRepo.save(existingCitizen);
    }
    public void deleteCitizen(Long citizenId) {
        Citizen existingCitizen = citizenRepo.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + citizenId));

        existingCitizen.setActive(false);
        citizenRepo.save(existingCitizen);
    }
}
