package com.ntuc.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ntuc.lms.model.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByFulfilledFalse();
}