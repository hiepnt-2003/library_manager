package com.example.library_manager.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "Topic")
public class Topic {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private String categoryName;
    private String description;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    // Constructors
    public Topic() {
    }
    
    public Topic(String categoryName, String description) {
        this.categoryName = categoryName;
        this.description = description;
        this.createdAt = new Date();
    }
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}