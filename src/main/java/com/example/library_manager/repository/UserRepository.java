package com.example.library_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.library_manager.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    java.util.List<User> findByUsername(String username);
}
