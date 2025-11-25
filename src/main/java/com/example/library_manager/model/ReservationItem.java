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

import com.example.library_manager.model.enums.PayFineStatus;
import com.example.library_manager.model.enums.ReservationItemStatus;

@Entity
@Table(name = "ReservationItem")
public class ReservationItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private Integer reservationId;
    private Integer bookId;
    
    @Temporal(TemporalType.DATE)
    private Date returnDate;
    
    private Integer overDueDay;
    
    @Enumerated(EnumType.STRING)
    private PayFineStatus isPayFine;
    
    @Enumerated(EnumType.STRING)
    private ReservationItemStatus status;
    
    // Constructors
    public ReservationItem() {
    }
    
    public ReservationItem(Integer reservationId, Integer bookId, ReservationItemStatus status) {
        this.reservationId = reservationId;
        this.bookId = bookId;
        this.status = status;
        this.overDueDay = 0;
        this.isPayFine = PayFineStatus.NOINFORMATION;
    }
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public Integer getReservationId() { return reservationId; }
    public void setReservationId(Integer reservationId) { this.reservationId = reservationId; }
    
    public Integer getBookId() { return bookId; }
    public void setBookId(Integer bookId) { this.bookId = bookId; }
    
    public Date getReturnDate() { return returnDate; }
    public void setReturnDate(Date returnDate) { this.returnDate = returnDate; }
    
    public Integer getOverDueDay() { return overDueDay; }
    public void setOverDueDay(Integer overDueDay) { this.overDueDay = overDueDay; }
    
    public PayFineStatus getIsPayFine() { return isPayFine; }
    public void setIsPayFine(PayFineStatus isPayFine) { this.isPayFine = isPayFine; }
    
    public ReservationItemStatus getStatus() { return status; }
    public void setStatus(ReservationItemStatus status) { this.status = status; }
}