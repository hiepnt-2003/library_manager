package com.example.library_manager.model;

import java.util.Date;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;

import com.example.library_manager.model.enums.ReservationStatus;

@Entity
@Table(name = "Reservation")
public class Reservation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private Integer readerId;
    private Integer librarianApprovedId;
    private Integer librarianGiveId;
    private Integer librarianReturnId;
    
    @Temporal(TemporalType.DATE)
    private Date requestDate;
    
    @Temporal(TemporalType.DATE)
    private Date pickupDate;
    
    @Temporal(TemporalType.DATE)
    private Date dueDate;
    
    @Temporal(TemporalType.DATE)
    private Date approvalDate;
    
    @Enumerated(EnumType.STRING)
    private ReservationStatus status;
    
    @Transient
    private List<ReservationItem> reservationItems;

    @Transient
    private Reader reader;

    // Constructors
    public Reservation() {
    }
    
    public Reservation(Integer readerId, Date requestDate, ReservationStatus status) {
        this.readerId = readerId;
        this.requestDate = requestDate;
        this.status = status;
    }
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public Integer getReaderId() { return readerId; }
    public void setReaderId(Integer readerId) { this.readerId = readerId; }
    
    public Integer getLibrarianApprovedId() { return librarianApprovedId; }
    public void setLibrarianApprovedId(Integer librarianApprovedId) { this.librarianApprovedId = librarianApprovedId; }
    
    public Integer getLibrarianGiveId() { return librarianGiveId; }
    public void setLibrarianGiveId(Integer librarianGiveId) { this.librarianGiveId = librarianGiveId; }
    
    public Integer getLibrarianReturnId() { return librarianReturnId; }
    public void setLibrarianReturnId(Integer librarianReturnId) { this.librarianReturnId = librarianReturnId; }
    
    public Date getRequestDate() { return requestDate; }
    public void setRequestDate(Date requestDate) { this.requestDate = requestDate; }
    
    public Date getPickupDate() { return pickupDate; }
    public void setPickupDate(Date pickupDate) { this.pickupDate = pickupDate; }
    
    public Date getDueDate() { return dueDate; }
    public void setDueDate(Date dueDate) { this.dueDate = dueDate; }
    
    public Date getApprovalDate() { return approvalDate; }
    public void setApprovalDate(Date approvalDate) { this.approvalDate = approvalDate; }
    
    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }

    public List<ReservationItem> getReservationItems() { return reservationItems; }
    public void setReservationItems(List<ReservationItem> reservationItems) { this.reservationItems = reservationItems; }

    public Reader getReader() { return reader; }
    public void setReader(Reader reader) { this.reader = reader; }
}