package com.example.library_manager.model;

import java.util.Date;

import com.example.library_manager.model.enums.PayFineStatus;
import com.example.library_manager.model.enums.ReservationItemStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tblReservation_item")
public class ReservationItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer reservationId;
    private Integer bookId;
    private Date returnDate;
    private Integer overDueDay;
    @Enumerated(EnumType.STRING)
    private PayFineStatus isPayFine;
    @Enumerated(EnumType.STRING)
    private ReservationItemStatus status;
    // getters and setters
}
