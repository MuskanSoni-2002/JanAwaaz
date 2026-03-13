package com.example.JanAwaaz.service;

import com.example.JanAwaaz.exception.ResourceNotFoundException;
import com.example.JanAwaaz.model.Comment;
import com.example.JanAwaaz.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;

public class CommentService {
    @Autowired
    private CommentRepository CommentRepo;
    public Comment createComment(Comment comment){

        comment.setCreatedAt(LocalDateTime.now());

        return CommentRepo.save(comment);
    }

    public Comment getCommentById(Long id){

        return CommentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
    }

    public List<Comment> getAllComments(){

        return CommentRepo.findAll();
    }
}
