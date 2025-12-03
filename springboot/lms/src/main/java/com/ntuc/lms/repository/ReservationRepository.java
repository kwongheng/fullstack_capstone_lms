package com.ntuc.lms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ntuc.lms.model.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {  
    List<Reservation> findByFulfilledFalse();  // Fixed: Add

    Optional<Reservation> findByFulfilledFalseAndMemberUserIdAndBookId(Integer memberUserId, Integer bookId);  // For unique
}