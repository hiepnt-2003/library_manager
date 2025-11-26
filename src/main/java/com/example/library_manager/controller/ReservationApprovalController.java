package com.example.library_manager.controller;

import com.example.library_manager.model.Reservation;
import com.example.library_manager.model.ReservationItem;
import com.example.library_manager.service.ReservationApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationApprovalController {
    
    @Autowired
    private ReservationApprovalService reservationApprovalService;
    
    /**
     * DUYỆT HOẶC TỪ CHỐI PHIẾU MƯỢN
     * POST /api/reservations/approve
     * 
     * Request Body:
     * {
     *   "reservationId": 1,
     *   "librarianId": 1,
     *   "approved": true,
     *   "rejectReason": "Lý do từ chối (nếu approved = false)"
     * }
     */
    @PostMapping("/approve")
    public ResponseEntity<?> approveReservation(@RequestBody Map<String, Object> request) {
        try {
            // Validate input
            Integer reservationId = (Integer) request.get("reservationId");
            Integer librarianId = (Integer) request.get("librarianId");
            Boolean approved = (Boolean) request.get("approved");
            String rejectReason = (String) request.get("rejectReason");
            
            if (reservationId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Reservation ID không được để trống"));
            }
            
            if (librarianId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Librarian ID không được để trống"));
            }
            
            if (approved == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Trạng thái duyệt không được để trống"));
            }
            
            // Gọi service để xử lý
            Reservation savedReservation = reservationApprovalService.approveReservation(
                reservationId, 
                librarianId, 
                approved, 
                rejectReason
            );
            
            // Trả về reservation đã được cập nhật
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", approved ? "Duyệt phiếu mượn thành công" : "Từ chối phiếu mượn thành công");
            response.put("reservation", savedReservation);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }
    
    /**
     * LẤY DANH SÁCH PHIẾU MƯỢN CHỜ DUYỆT
     * GET /api/reservations/pending
     * 
     * Tự động kiểm tra và hủy các phiếu APPROVED quá 3 ngày
     * Chỉ trả về các phiếu PENDING (không bao gồm phiếu đã quá hạn)
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingReservations() {
        try {
            List<Reservation> pendingReservations = reservationApprovalService.getPendingReservations();
            return ResponseEntity.ok(pendingReservations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    /**
     * LẤY CHI TIẾT PHIẾU MƯỢN
     * GET /api/reservations/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getReservationDetails(@PathVariable Integer id) {
        try {
            Reservation reservation = reservationApprovalService.getReservationDetails(id);
            return ResponseEntity.ok(reservation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    /**
     * LẤY DANH SÁCH SÁCH TRONG PHIẾU MƯỢN
     * GET /api/reservations/{id}/items
     */
    @GetMapping("/{id}/items")
    public ResponseEntity<?> getReservationItems(@PathVariable Integer id) {
        try {
            List<ReservationItem> items = reservationApprovalService.getReservationItems(id);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}