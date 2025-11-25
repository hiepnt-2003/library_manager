package com.example.library_manager.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import com.example.library_manager.model.enums.UserType;

@Entity
@Table(name = "User")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private String username;
    private String password;
    private String fullName;
    private String phone;
    private Integer isActive;
    
    @Enumerated(EnumType.STRING)
    private UserType userType;
    
    // Constructors
    public User() {
    }
    
    public User(String username, String password, String fullName, String phone, UserType userType) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.phone = phone;
        this.isActive = 1;
        this.userType = userType;
    }
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public Integer getIsActive() { return isActive; }
    public void setIsActive(Integer isActive) { this.isActive = isActive; }
    
    public UserType getUserType() { return userType; }
    public void setUserType(UserType userType) { this.userType = userType; }
}