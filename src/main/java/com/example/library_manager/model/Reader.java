package com.example.library_manager.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;

@Entity
@Table(name = "Reader")
public class Reader {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Transient
    private String username;
    @Transient
    private String password;
    @Transient
    private String fullName;
    @Transient
    private String phone;
    @Transient
    private Integer isActive;

    private String libraryCardNumber;
    private Integer userId;
    
    @Temporal(TemporalType.DATE)
    private Date dateJoined;
    
    @Temporal(TemporalType.DATE)
    private Date membershipExpiryDate;
    
    // Constructors
    public Reader() {
        this.dateJoined = new Date();
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.phone = phone;
        this.membershipExpiryDate = membershipExpiryDate;
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

    public String getLibraryCardNumber() { return libraryCardNumber; }
    public void setLibraryCardNumber(String libraryCardNumber) { this.libraryCardNumber = libraryCardNumber; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Date getDateJoined() { return dateJoined; }
    public void setDateJoined(Date dateJoined) { this.dateJoined = dateJoined; }

    public Date getMembershipExpiryDate() { return membershipExpiryDate; }
    public void setMembershipExpiryDate(Date membershipExpiryDate) { this.membershipExpiryDate = membershipExpiryDate; }
}