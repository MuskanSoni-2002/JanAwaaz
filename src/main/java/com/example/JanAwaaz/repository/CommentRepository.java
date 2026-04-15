package com.example.JanAwaaz.repository;

import com.example.JanAwaaz.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByGrievance_GrievanceIdOrderByCreatedAtAsc(Long grievanceId);
}
