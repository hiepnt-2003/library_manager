package com.example.library_manager.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "LibrarianApprove")
public class LibrarianApprove {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private Integer librarianId;
    private Integer reservationId;
    
    // Constructors
    public LibrarianApprove() {
    }
    
    public LibrarianApprove(Integer librarianId, Integer reservationId) {
        this.librarianId = librarianId;
        this.reservationId = reservationId;
    }
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public Integer getLibrarianId() { return librarianId; }
    public void setLibrarianId(Integer librarianId) { this.librarianId = librarianId; }
    
    public Integer getReservationId() { return reservationId; }
    public void setReservationId(Integer reservationId) { this.reservationId = reservationId; }
}