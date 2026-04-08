package com.example.JanAwaaz.repository;

import com.example.JanAwaaz.model.enums.Status;
import com.example.JanAwaaz.model.Officer;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfficerRepository extends JpaRepository<Officer, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByEmailAndOfficerIdNot(String email, Long officerId);
    boolean existsByPhoneNumberAndOfficerIdNot(String phoneNumber, Long officerId);
    Optional<Officer> findByEmail(String email);

    @Query("""
            SELECT o
            FROM Officer o
            LEFT JOIN Grievance g
                ON g.officer = o AND g.status IN :activeStatuses
            WHERE o.department.departmentId = :departmentId
              AND o.active = true
            GROUP BY o
            ORDER BY COUNT(g) ASC, o.officerId ASC
            """)
    List<Officer> findLeastLoadedActiveOfficersByDepartment(
            @Param("departmentId") Long departmentId,
            @Param("activeStatuses") Collection<Status> activeStatuses,
            Pageable pageable
    );
}
