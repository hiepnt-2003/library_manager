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
@Table(name = "Author")
public class Author {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private String authorName;
    private String biography;
    private Integer birthYear;
    private String nationality;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    // Constructors
    public Author() {
    }
    
    public Author(String authorName, String biography, Integer birthYear, String nationality) {
        this.authorName = authorName;
        this.biography = biography;
        this.birthYear = birthYear;
        this.nationality = nationality;
        this.createdAt = new Date();
    }
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    
    public String getBiography() { return biography; }
    public void setBiography(String biography) { this.biography = biography; }
    
    public Integer getBirthYear() { return birthYear; }
    public void setBirthYear(Integer birthYear) { this.birthYear = birthYear; }
    
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}