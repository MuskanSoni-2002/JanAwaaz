package com.example.JanAwaaz.service.auth;

import com.example.JanAwaaz.dto.auth.LoginRequestDto;
import com.example.JanAwaaz.dto.auth.RegisterRequestDto;
import com.example.JanAwaaz.dto.auth.RegisterResponseDto;
import com.example.JanAwaaz.exception.DuplicateResourceException;
import com.example.JanAwaaz.model.Address;
import com.example.JanAwaaz.model.Admin;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.AdminRepository;
import com.example.JanAwaaz.repository.CitizenRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private CitizenRepository citizenRepo;
    @Autowired
    private OfficerRepository officerRepo;
    @Autowired
    private AdminRepository adminRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;

    public RegisterResponseDto registerCitizen(RegisterRequestDto request){
        if(citizenRepo.existsByEmail(request.email())){
            throw new DuplicateResourceException("Email already registered");
        }
        if(citizenRepo.existsByPhoneNumber(request.phoneNumber())){
            throw new DuplicateResourceException("Phone number already registered");
        }
        Address address = new Address();
        address.setAddressLine1(request.address().addressLine1());
        address.setAddressLine2(request.address().addressLine2());
        address.setCity(request.address().city());
        address.setState(request.address().state());
        address.setPincode(request.address().pincode());

        Citizen citizen = new Citizen();
        citizen.setFirstName(request.firstName());
        citizen.setLastName(request.lastName());
        citizen.setGender(request.gender());
        citizen.setEmail(request.email());
        citizen.setPhoneNumber(request.phoneNumber());
        citizen.setPassword(passwordEncoder.encode(request.password()));
        citizen.setRole(UserRole.CITIZEN);
        citizen.setActive(true);
        citizen.setAddress(address);

        Citizen savedCitizen = citizenRepo.save(citizen);

        return new RegisterResponseDto(
                savedCitizen.getCitizenId(),
                savedCitizen.getFirstName(),
                savedCitizen.getLastName(),
                savedCitizen.getGender(),
                savedCitizen.getEmail(),
                savedCitizen.getPhoneNumber(),
                savedCitizen.getRole(),
                savedCitizen.getActive()
        );
    }

    public String loginCitizen(LoginRequestDto loginRequestDto){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.email(),
                        loginRequestDto.password()
                )
        );
        UserDetails userDetails = (UserDetails)authentication.getPrincipal();
        if (!userDetails.getAuthorities().contains(
                new SimpleGrantedAuthority("ROLE_CITIZEN"))) {
            throw new RuntimeException("Invalid role for this login");
        }

        Citizen citizen = citizenRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Citizen not found after authentication"));

        return jwtService.generateToken(
                jwtService.buildSubject(UserRole.CITIZEN, citizen.getCitizenId()),
                "ROLE_CITIZEN"
        );
    }
    public String loginOfficer(LoginRequestDto loginRequestDto){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.email(),
                        loginRequestDto.password()
                )
        );
        UserDetails userDetails = (UserDetails)authentication.getPrincipal();
        if (!userDetails.getAuthorities().contains(
                new SimpleGrantedAuthority("ROLE_OFFICER"))) {
            throw new RuntimeException("Invalid role for this login");
        }

        Officer officer = officerRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Officer not found after authentication"));

        return jwtService.generateToken(
                jwtService.buildSubject(UserRole.OFFICER, officer.getOfficerId()),
                "ROLE_OFFICER"
        );
    }
    public String loginAdmin(LoginRequestDto loginRequestDto){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.email(),
                        loginRequestDto.password()
                )
        );
        UserDetails userDetails = (UserDetails)authentication.getPrincipal();
        if (!userDetails.getAuthorities().contains(
                new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            throw new RuntimeException("Invalid role for this login");
        }

        Admin admin = adminRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found after authentication"));

        return jwtService.generateToken(
                jwtService.buildSubject(UserRole.ADMIN, admin.getAdminId()),
                "ROLE_ADMIN"
        );
    }
}
