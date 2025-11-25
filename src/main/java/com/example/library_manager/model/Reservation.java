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
@Table(name = "tblReservation")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer readerId;
    private Integer librarianApprovedId;
    private Integer librarianGiveId;
    private Integer librarianReturnId;
    private Date requestDate;
    private Date pickupDate;
    private Date dueDate;
    private Date approvalDate;
    @Enumerated(EnumType.STRING)
    private com.example.library_manager.model.enums.ReservationStatus status;
    // getters and setters
}
