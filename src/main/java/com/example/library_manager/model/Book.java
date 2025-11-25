package com.example.library_manager.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Book")
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
    
    // Constructors
    public Book() {
    }
    
    public Book(Integer categoryId, Integer topicId, Integer authorId, String title, String publisher, Integer bookAvailable) {
        this.categoryId = categoryId;
        this.topicId = topicId;
        this.authorId = authorId;
        this.title = title;
        this.publisher = publisher;
        this.bookAvailable = bookAvailable;
    }
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    
    public Integer getTopicId() { return topicId; }
    public void setTopicId(Integer topicId) { this.topicId = topicId; }
    
    public Integer getAuthorId() { return authorId; }
    public void setAuthorId(Integer authorId) { this.authorId = authorId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    
    public Integer getBookAvailable() { return bookAvailable; }
    public void setBookAvailable(Integer bookAvailable) { this.bookAvailable = bookAvailable; }
}