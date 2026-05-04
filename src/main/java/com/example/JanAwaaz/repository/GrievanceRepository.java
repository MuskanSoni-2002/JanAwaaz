package com.example.JanAwaaz.repository;

import com.example.JanAwaaz.model.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByCitizenEmailOrderByCreatedAtDesc(String citizenEmail);

    List<Grievance> findByOfficerEmailOrderByCreatedAtDesc(String officerEmail);

    List<Grievance> findAllByOrderByCreatedAtDesc();

    List<Grievance> findByAddressTextContainingIgnoreCaseOrderByCreatedAtDesc(String addressText);
}
