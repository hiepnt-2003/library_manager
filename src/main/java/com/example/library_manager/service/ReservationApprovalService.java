package com.example.library_manager.service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.library_manager.model.Book;
import com.example.library_manager.model.LibrarianApprove;
import com.example.library_manager.model.Reader;
import com.example.library_manager.model.Reservation;
import com.example.library_manager.model.ReservationItem;
import com.example.library_manager.model.User;
import com.example.library_manager.model.enums.ReservationItemStatus;
import com.example.library_manager.model.enums.ReservationStatus;
import com.example.library_manager.repository.LibrarianApproveRepository;

@Service
public class ReservationApprovalService {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ReservationItemService reservationItemService;

    @Autowired
    private ReaderService readerService;

    @Autowired
    private BookService bookService;

    @Autowired
    private UserService userService;

    @Autowired
    private LibrarianApproveRepository librarianApproveRepository;

    // DUYỆT YÊU CẦU MƯỢN SÁCH
    @Transactional
    public Reservation approveReservation(Integer reservationId, Integer librarianId, Boolean approved,
            String rejectReason) {

        // LẤY THÔNG TIN PHIẾU MƯỢN
        Reservation reservation = reservationService.getReservationById(reservationId);
        if (reservation == null) {
            throw new IllegalArgumentException("Không tìm thấy phiếu mượn với ID: " + reservationId);
        }

        // Kiểm tra trạng thái phiếu mượn phải là PENDING
        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể duyệt phiếu mượn ở trạng thái PENDING. Trạng thái hiện tại: "
                    + reservation.getStatus());
        }

        // Nếu từ chối yêu cầu
        if (approved != null && !approved) {
            return rejectReservation(reservation, rejectReason);
        }

        // KIỂM TRA ĐỘC GIẢ CÒN HOẠT ĐỘNG KHÔNG
        Reader reader = readerService.getReaderById(reservation.getReaderId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Không tìm thấy độc giả với ID: " + reservation.getReaderId()));
        // Kiểm tra độc giả hợp lệ
        if (!isValidReader(reader)) {
            throw new IllegalArgumentException("Độc giả không còn hoạt động hoặc thẻ đã hết hạn");
        }

        // KIỂM TRA TỪNG SÁCH CÒN KHẢ DỤNG
        List<ReservationItem> items = reservationItemService.getReservationItemsByReservationId(reservation.getId());

        if (items.isEmpty()) {
            throw new IllegalArgumentException("Phiếu mượn không có sách nào");
        }

        // Kiểm tra từng sách
        StringBuilder unavailableBooks = new StringBuilder();
        for (ReservationItem item : items) {
            Book book = bookService.getBookById(item.getBookId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sách với ID: " + item.getBookId()));

            // Kiểm tra sách còn khả dụng không
            if (book.getBookAvailable() == null || book.getBookAvailable() <= 0) {
                if (unavailableBooks.length() > 0) {
                    unavailableBooks.append(", ");
                }
                unavailableBooks.append(book.getTitle()).append(" (ID: ").append(book.getId()).append(")");
            }
        }

        if (unavailableBooks.length() > 0) {
            throw new IllegalArgumentException("Các sách sau không còn khả dụng: " + unavailableBooks.toString());
        }

        // CẬP NHẬT TRẠNG THÁI PHIẾU MƯỢN
        reservation.setStatus(ReservationStatus.APPROVED);
        reservation.setApprovalDate(new Date());
        reservation.setLibrarianApprovedId(librarianId);

        // Lưu thông tin
        Reservation savedReservation = reservationService.saveReservation(reservation);

        // LƯU THÔNG TIN DUYỆT
        LibrarianApprove librarianApprove = new LibrarianApprove(librarianId, reservation.getId());
        librarianApproveRepository.save(librarianApprove);

        return savedReservation;
    }

    // TỪ CHỐI YÊU CẦU MƯỢN SÁCH
    @Transactional
    private Reservation rejectReservation(Reservation reservation, String reason) {

        // Cập nhật trạng thái
        reservation.setStatus(ReservationStatus.REJECTED);
        reservation.setApprovalDate(new Date());
        Reservation savedReservation = reservationService.saveReservation(reservation);

        // Cập nhật trạng thái các item
        List<ReservationItem> items = reservationItemService.getReservationItemsByReservationId(reservation.getId());
        for (ReservationItem item : items) {
            item.setStatus(ReservationItemStatus.EXPIRED);
            reservationItemService.saveReservationItem(item);
        }

        return savedReservation;
    }

    // LẤY PHIẾU MƯỢN THEO TRẠNG THÁI (MAIN METHOD)
    @Transactional
    public List<Reservation> getReservationsByStatus(String statusString) {
        // Tự động hủy các phiếu PENDING quá 3 ngày
        expirePendingReservations();

        // Convert string to enum
        ReservationStatus status = ReservationStatus.valueOf(statusString);

        // Lấy danh sách phiếu theo status
        List<Reservation> reservations = reservationService.getReservationsByStatus(status);

        List<Reservation> resultReservations = new ArrayList<>();

        // Kiểm tra và gán thông tin cho từng phiếu mượn
        for (Reservation reservation : reservations) {
            // Lấy items
            List<ReservationItem> items = reservationItemService
                    .getReservationItemsByReservationId(reservation.getId());

            // Độc giả
            Reader reader = readerService.getReaderById(reservation.getReaderId())
                    .orElse(null);

            // CHỈ KIỂM TRA VALID READER KHI STATUS LÀ PENDING
            if (status == ReservationStatus.PENDING) {
                if (!isValidReader(reader)) {
                    continue; // Bỏ qua phiếu này nếu reader không valid
                }
            }

            // Gán thông tin reader (không quan tâm valid hay không cho các status khác)
            if (reader != null) {
                User user = userService.getUserById(reader.getUserId()).orElse(null);
                if (user != null) {
                    reader.setUsername(user.getUsername());
                    reader.setFullName(user.getFullName());
                    reader.setPhone(user.getPhone());
                }
                reservation.setReader(reader);
            }

            // Sách
            for (ReservationItem item : items) {
                Book book = bookService.getBookById(item.getBookId()).orElse(null);
                item.setBook(book);
            }
            reservation.setReservationItems(items);
            resultReservations.add(reservation);
        }

        return resultReservations;
    }

    // TỰ ĐỘNG HỦY CÁC PHIẾU MƯỢN QUÁ HẠN (CHỈ PENDING QUÁ 3 NGÀY)
    @Transactional
    public int expirePendingReservations() {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -3);
        Date thresholdDate = calendar.getTime();

        // CHỈ LẤY CÁC PHIẾU PENDING CÓ requestDate < 3 ngày trước
        List<Reservation> expiredReservations = reservationService.getPendingExpiredReservations(thresholdDate);

        for (Reservation reservation : expiredReservations) {
            reservation.setStatus(ReservationStatus.EXPIRED);
            reservationService.saveReservation(reservation);

            // Cập nhật trạng thái items
            List<ReservationItem> items = reservationItemService
                    .getReservationItemsByReservationId(reservation.getId());
            for (ReservationItem item : items) {
                item.setStatus(ReservationItemStatus.EXPIRED);
                reservationItemService.saveReservationItem(item);
            }
        }

        return expiredReservations.size();
    }

    // LẤY CHI TIẾT PHIẾU MƯỢN
    @Transactional
    public Reservation getReservationDetails(Integer reservationId) {
        // Tự động hủy các phiếu PENDING quá 3 ngày
        expirePendingReservations();

        Reservation reservation = reservationService.getReservationById(reservationId);

        // Kiểm tra và gán thông tin cho phiếu mượn
        List<ReservationItem> items = reservationItemService.getReservationItemsByReservationId(reservation.getId());

        // Độc giả - KHÔNG KIỂM TRA VALID
        Reader reader = readerService.getReaderById(reservation.getReaderId())
                .orElse(null);
        if (reader != null) {
            User user = userService.getUserById(reader.getUserId()).orElse(null);
            if (user != null) {
                reader.setUsername(user.getUsername());
                reader.setFullName(user.getFullName());
                reader.setPhone(user.getPhone());
            }
            reservation.setReader(reader);
        }

        // Sách
        for (ReservationItem item : items) {
            Book book = bookService.getBookById(item.getBookId()).orElse(null);
            item.setBook(book);
        }
        reservation.setReservationItems(items);

        return reservation;
    }

    // KIỂM TRA NGƯỜI DÙNG HỢP LỆ
    public boolean isValidReader(Reader reader) {
        if (reader == null) {
            return false;
        }

        // Kiểm tra User của Reader
        User user = userService.getUserById(reader.getUserId()).orElse(null);
        if (user == null || user.getIsActive() != 1) {
            return false;
        }

        // Kiểm tra thẻ hết hạn chưa
        Date today = new Date();
        if (reader.getMembershipExpiryDate() != null && reader.getMembershipExpiryDate().before(today)) {
            return false;
        }

        return true;
    }
}