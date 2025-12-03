package com.ntuc.lms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ntuc.lms.model.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {  // Fixed: Long
    List<Reservation> findByFulfilledFalse();  // Fixed: Add

    Optional<Reservation> findByFulfilledFalseAndMemberUserIdAndBookId(Long memberUserId, Long bookId);  // For unique
}