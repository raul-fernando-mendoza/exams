package io.javabrains.springsecurityjpa;

import io.javabrains.springsecurityjpa.models.TestApplication;
import io.javabrains.springsecurityjpa.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface TestApplicationRepository extends JpaRepository<TestApplication, Integer> {
    List<TestApplication> findByTeacher_username(String username); 
}
