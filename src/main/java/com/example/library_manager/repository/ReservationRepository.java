package com.example.library_manager.repository;

import com.example.library_manager.model.Reservation;
import com.example.library_manager.model.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    
    // Lấy tất cả phiếu mượn theo trạng thái
    List<Reservation> findByStatus(ReservationStatus status);
    
    // Lấy phiếu mượn của một độc giả
    List<Reservation> findByReaderId(Integer readerId);
    
    // Lấy phiếu mượn theo trạng thái của một độc giả
    List<Reservation> findByReaderIdAndStatus(Integer readerId, ReservationStatus status);
    
    // LẤY CÁC PHIẾU PENDING QUÁ HẠN (requestDate quá 3 ngày)
    @Query("SELECT r FROM Reservation r WHERE r.status = 'PENDING' AND r.requestDate < :thresholdDate")
    List<Reservation> findPendingExpiredReservations(@Param("thresholdDate") Date thresholdDate);
    
    // LẤY CÁC PHIẾU APPROVED QUÁ HẠN (approvalDate quá 3 ngày) - GIỮ LẠI ĐỂ TƯƠNG THÍCH
    @Query("SELECT r FROM Reservation r WHERE r.status = 'APPROVED' AND r.approvalDate < :thresholdDate")
    List<Reservation> findExpiredApprovedReservations(@Param("thresholdDate") Date thresholdDate);
    
    // Đếm số phiếu mượn đang pending
    long countByStatus(ReservationStatus status);
}