package com.example.library_manager.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.library_manager.model.Reservation;
import com.example.library_manager.model.enums.ReservationStatus;
import com.example.library_manager.repository.ReservationRepository;

@Service
public class ReservationService {
    @Autowired
    private ReservationRepository reservationRepository;

    public Reservation getReservationById(Integer id) {
        return reservationRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu mượn với ID: " + id));
    }

    public Reservation saveReservation(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    public List<Reservation> getReservationsByStatus(ReservationStatus status) {
        return reservationRepository.findByStatus(status);
    }

    public List<Reservation> getPendingExpiredReservations(Date thresholdDate) {
        return reservationRepository.findPendingExpiredReservations(thresholdDate);
    }
}
