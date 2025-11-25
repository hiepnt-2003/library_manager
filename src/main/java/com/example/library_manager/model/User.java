package com.example.library_manager.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tblUser")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String username;
    private String password;
    private String fullName;
    private String phone;
    private Integer isActive;
    private Date createdAt;
    @Enumerated(EnumType.STRING)
    private com.example.library_manager.model.enums.UserType userType;
    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }
    public Integer getIsActive() {
        return isActive;
    }
    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }
    public com.example.library_manager.model.enums.UserType getUserType() {
        return userType;
    }
    public void setUserType(com.example.library_manager.model.enums.UserType userType) {
        this.userType = userType;
    }
    // ...existing code...
}
