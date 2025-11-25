package com.example.library_manager.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tblBook")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer categoryId;
    private Integer topicId;
    private Integer authorId;
    private String title;
    private String publisher;
    private Integer bookAvailable;
    // getters and setters
}
