package com.example.JanAwaaz.service.auth;

import com.example.JanAwaaz.model.Admin;
import com.example.JanAwaaz.model.Citizen;
import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.model.enums.UserRole;
import com.example.JanAwaaz.repository.AdminRepository;
import com.example.JanAwaaz.repository.CitizenRepository;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {
    @Autowired
    private CitizenRepository citizenRepository;

    @Autowired
    private OfficerRepository officerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return citizenRepository.findByEmail(email)
                .<UserDetails>map(citizen -> buildUser(citizen.getEmail(), citizen.getPassword(), citizen.getRole(), citizen.getActive()))
                .orElseGet(() -> officerRepository.findByEmail(email)
                        .<UserDetails>map(officer -> buildUser(officer.getEmail(), officer.getPassword(), officer.getRole(), officer.getActive()))
                        .orElseGet(() -> adminRepository.findByEmail(email)
                                .<UserDetails>map(admin -> buildUser(admin.getEmail(), admin.getPassword(), admin.getRole(), admin.getActive()))
                                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email))
                        ));
    }

    private UserDetails buildUser(String email, String password, UserRole role, Boolean active) {
        return User.withUsername(email)
                .password(password)
                .authorities(new SimpleGrantedAuthority("ROLE_" + role.name()))
                .disabled(active == null || !active)
                .build();
    }
}
