package com.example.JanAwaaz.repository;

import com.example.JanAwaaz.model.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, Long> {
}
