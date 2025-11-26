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
import com.example.library_manager.repository.BookRepository;
import com.example.library_manager.repository.LibrarianApproveRepository;
import com.example.library_manager.repository.ReaderRepository;
import com.example.library_manager.repository.ReservationItemRepository;
import com.example.library_manager.repository.ReservationRepository;
import com.example.library_manager.repository.UserRepository;

@Service
public class ReservationApprovalService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ReservationItemRepository reservationItemRepository;

    @Autowired
    private ReaderRepository readerRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LibrarianApproveRepository librarianApproveRepository;

    // DUYỆT YÊU CẦU MƯỢN SÁCH
    @Transactional
    public Reservation approveReservation(Integer reservationId, Integer librarianId, Boolean approved,String rejectReason) {

        // LẤY THÔNG TIN PHIẾU MƯỢN
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu mượn với ID: " + reservationId));

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
        Reader reader = readerRepository.findById(reservation.getReaderId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Không tìm thấy độc giả với ID: " + reservation.getReaderId()));
        // Kiểm tra độc giả hợp lệ
        if (!isValidReader(reader)) {
            throw new IllegalArgumentException("Độc giả không còn hoạt động hoặc thẻ đã hết hạn");
        }

        // KIỂM TRA TỪNG SÁCH CÒN KHẢ DỤNG
        List<ReservationItem> items = reservationItemRepository.findByReservationId(reservation.getId());

        if (items.isEmpty()) {
            throw new IllegalArgumentException("Phiếu mượn không có sách nào");
        }

        // Kiểm tra từng sách
        StringBuilder unavailableBooks = new StringBuilder();
        for (ReservationItem item : items) {
            Book book = bookRepository.findById(item.getBookId())
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
        Reservation savedReservation = reservationRepository.save(reservation);

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
        Reservation savedReservation = reservationRepository.save(reservation);

        // Cập nhật trạng thái các item
        List<ReservationItem> items = reservationItemRepository.findByReservationId(reservation.getId());
        for (ReservationItem item : items) {
            item.setStatus(ReservationItemStatus.EXPIRED);
            reservationItemRepository.save(item);
        }

        return savedReservation;
    }

    // LẤY DANH SÁCH PHIẾU MƯỢN CHỜ DUYỆT
    @Transactional
    public List<Reservation> getPendingReservations() {
        // Tự động hủy các phiếu APPROVED quá 3 ngày
        expireOldApprovedReservations();

        // Sau đó lấy danh sách PENDING
        List<Reservation> pendingReservations = reservationRepository.findByStatus(ReservationStatus.PENDING);
        // List<Reservation> pendingReservations = reservationRepository.findAll();

        List<Reservation> resultPendReservations = new ArrayList<>();
        // Kiểm tra và gán thông tin cho từng phiếu mượn
        for (Reservation reservation : pendingReservations) {
            List<ReservationItem> items = reservationItemRepository.findByReservationId(reservation.getId());

            // Độc giả
            Reader reader = readerRepository.findById(reservation.getReaderId()).orElse(null);
            if (!isValidReader(reader)) {
                continue;// Nếu độc giả không hợp lệ thì bỏ qua phiếu mượn này
            }
            User user = userRepository.findById(reader.getUserId()).orElse(null);
            reader.setUsername(user.getUsername());
            reader.setFullName(user.getFullName());
            reader.setPhone(user.getPhone());
            reservation.setReader(reader);

            // Sách
            for (ReservationItem item : items) {
                Book book = bookRepository.findById(item.getBookId()).orElse(null);
                item.setBook(book);
            }
            reservation.setReservationItems(items);
            resultPendReservations.add(reservation);
        }
        return resultPendReservations;
    }

    // TỰ ĐỘNG HỦY CÁC PHIẾU MƯỢN QUÁ HẠN (ĐÃ DUYỆT NHƯNG QUÁ 3 NGÀY CHƯA LẤY SÁCH)
    @Transactional
    public int expireOldApprovedReservations() {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -3);
        Date thresholdDate = calendar.getTime();

        List<Reservation> expiredReservations = reservationRepository.findExpiredApprovedReservations(thresholdDate);

        for (Reservation reservation : expiredReservations) {
            reservation.setStatus(ReservationStatus.EXPIRED);
            reservationRepository.save(reservation);

            // Cập nhật trạng thái items
            List<ReservationItem> items = reservationItemRepository.findByReservationId(reservation.getId());
            for (ReservationItem item : items) {
                item.setStatus(ReservationItemStatus.EXPIRED);
                reservationItemRepository.save(item);
            }
        }

        return expiredReservations.size();
    }

    // LẤY CHI TIẾT PHIẾU MƯỢN
    public Reservation getReservationDetails(Integer reservationId) {
        // Tự động hủy các phiếu APPROVED quá 3 ngày
        expireOldApprovedReservations();

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu mượn với ID: " + reservationId));

        // Kiểm tra và gán thông tin cho phiếu mượn
        List<ReservationItem> items = reservationItemRepository.findByReservationId(reservation.getId());

        // Độc giả
        Reader reader = readerRepository.findById(reservation.getReaderId()).orElse(null);
        if (!isValidReader(reader)) {
            return null;// Nếu độc giả không hợp lệ thì bỏ qua phiếu mượn này
        }
        User user = userRepository.findById(reader.getUserId()).orElse(null);
        reader.setUsername(user.getUsername());
        reader.setFullName(user.getFullName());
        reader.setPhone(user.getPhone());
        reservation.setReader(reader);

        // Sách
        for (ReservationItem item : items) {
            Book book = bookRepository.findById(item.getBookId()).orElse(null);
            item.setBook(book);
        }
        reservation.setReservationItems(items);

        return reservation;
    }

    // LẤY CÁC SÁCH TRONG PHIẾU MƯỢN
    public List<ReservationItem> getReservationItems(Integer reservationId) {
        return reservationItemRepository.findByReservationId(reservationId);
    }

    // Valid Người dùng
    public boolean isValidReader(Reader reader) {
        if (reader == null) {
            return false;
        }
        // Kiểm tra User của Reader
        User user = userRepository.findById(reader.getUserId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Không tìm thấy thông tin người dùng với ID: " + reader.getUserId()));

        if (user.getIsActive() != 1) {
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