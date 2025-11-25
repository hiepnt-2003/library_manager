package com.example.library_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.library_manager.model.Reader;

@Repository
public interface ReaderRepository extends JpaRepository<Reader, Integer> {
    // Custom query methods if needed
}
