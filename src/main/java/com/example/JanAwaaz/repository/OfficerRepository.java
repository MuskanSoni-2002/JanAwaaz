package com.example.JanAwaaz.repository;

import com.example.JanAwaaz.model.Officer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfficerRepository extends JpaRepository<Officer, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByEmailAndOfficerIdNot(String email, Long officerId);
    boolean existsByPhoneNumberAndOfficerIdNot(String phoneNumber, Long officerId);
    Optional<Officer> findByEmail(String email);
}
