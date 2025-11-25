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
@Table(name = "Librarian")
public class Librarian {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private Integer employeeId;
    private Integer userId;
    private String role;
    
    @Temporal(TemporalType.DATE)
    private Date hireDate;
    
    private String department;
    
    // Constructors
    public Librarian() {
    }
    
    public Librarian(Integer employeeId, Integer userId, String role, Date hireDate, String department) {
        this.employeeId = employeeId;
        this.userId = userId;
        this.role = role;
        this.hireDate = hireDate;
        this.department = department;
    }
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public Integer getEmployeeId() { return employeeId; }
    public void setEmployeeId(Integer employeeId) { this.employeeId = employeeId; }
    
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public Date getHireDate() { return hireDate; }
    public void setHireDate(Date hireDate) { this.hireDate = hireDate; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}