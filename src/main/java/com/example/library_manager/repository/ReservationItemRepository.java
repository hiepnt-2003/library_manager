package com.example.library_manager.repository;

import com.example.library_manager.model.ReservationItem;
import com.example.library_manager.model.enums.ReservationItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationItemRepository extends JpaRepository<ReservationItem, Integer> {
    
    // Lấy tất cả các item của một phiếu mượn
    List<ReservationItem> findByReservationId(Integer reservationId);
    
    // Lấy các item theo trạng thái
    List<ReservationItem> findByStatus(ReservationItemStatus status);
    
    // Lấy các item của một sách
    List<ReservationItem> findByBookId(Integer bookId);
    
    // Đếm số lượng item trong một reservation
    long countByReservationId(Integer reservationId);
}