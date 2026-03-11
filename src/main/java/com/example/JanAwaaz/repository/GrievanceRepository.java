package com.example.JanAwaaz.repository;

import com.example.JanAwaaz.model.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
}
