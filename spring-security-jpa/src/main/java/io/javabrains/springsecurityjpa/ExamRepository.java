package io.javabrains.springsecurityjpa;

import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import io.javabrains.springsecurityjpa.models.Exam;

@Service
public interface ExamRepository extends JpaRepository<Exam, Integer> {
    Collection<Exam> findByTeacher_Username(String username); 
}
