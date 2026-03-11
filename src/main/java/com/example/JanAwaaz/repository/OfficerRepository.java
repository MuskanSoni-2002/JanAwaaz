package com.example.JanAwaaz.repository;

import com.example.JanAwaaz.model.Officer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfficerRepository extends JpaRepository<Officer, Long> {
}
