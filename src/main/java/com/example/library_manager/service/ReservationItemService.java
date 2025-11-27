package com.example.library_manager.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.library_manager.model.ReservationItem;
import com.example.library_manager.repository.ReservationItemRepository;

@Service
public class ReservationItemService {
    @Autowired
    private ReservationItemRepository reservationItemRepository;

    public List<ReservationItem> getReservationItemsByReservationId(Integer reservationId) {
        return reservationItemRepository.findByReservationId(reservationId);
    }

    public ReservationItem saveReservationItem(ReservationItem item) {
        return reservationItemRepository.save(item);
    }
    
}
