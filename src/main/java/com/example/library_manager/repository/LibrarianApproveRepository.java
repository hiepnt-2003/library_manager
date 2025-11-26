package com.example.library_manager.repository;

import com.example.library_manager.model.LibrarianApprove;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibrarianApproveRepository extends JpaRepository<LibrarianApprove, Integer> {
    
    // Tìm bản ghi approve theo reservationId
    Optional<LibrarianApprove> findByReservationId(Integer reservationId);
    
    // Tìm tất cả reservation mà librarian đã approve
    List<LibrarianApprove> findByLibrarianId(Integer librarianId);
    
    // Kiểm tra xem reservation đã được approve chưa
    boolean existsByReservationId(Integer reservationId);
}