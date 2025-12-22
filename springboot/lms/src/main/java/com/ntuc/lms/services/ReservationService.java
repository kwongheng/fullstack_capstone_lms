// ReservationService
package com.ntuc.lms.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ntuc.lms.model.Book;
import com.ntuc.lms.model.Member;
import com.ntuc.lms.model.Reservation;
import com.ntuc.lms.repository.BookRepository;
import com.ntuc.lms.repository.MemberRepository;
import com.ntuc.lms.repository.ReservationRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final MemberRepository memberRepository;
    private final BookRepository bookRepository;

    public List<Reservation> getAll() {
        return reservationRepository.findAll();
    }

    public List<Reservation> getActiveReservations() {
        return reservationRepository.findByIsFulfilledFalse();
    }

    @Transactional
    public Reservation reserveBook(Integer memberUserId, Integer bookId) {  // Fixed: Names, types
        // Fixed: Enforce UQ_ACTIVE_RESERVATION
        if (reservationRepository.findByIsFulfilledFalseAndMember_User_IdAndBook_Id(memberUserId, bookId).isPresent()) {
            throw new IllegalStateException("Active reservation exists");
        }
        Member member = memberRepository.findById(memberUserId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        Reservation r = new Reservation();
        r.setMember(member);
        r.setBook(book);
        r.setExpiryDate(LocalDateTime.now().plusDays(14));
        return reservationRepository.save(r);
    }

    @Transactional
    public Reservation fulfillReservation(Integer id) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        r.setFulfilled(true);
        return reservationRepository.save(r);
    }

    @Transactional
    public void cancelReservation(Integer id) {
        reservationRepository.deleteById(id);
    }
    
    @Transactional
    public Reservation updateReservationDate(Integer reservationId, LocalDate newReservationDate) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));

        LocalDate today = LocalDate.now();

        // Super User rule: reservation date can be today or past only
        if (newReservationDate.isAfter(today)) {
            throw new IllegalArgumentException("Reservation date cannot be in the future");
        }

        // Update reservation date
        reservation.setReservationDate(newReservationDate.atStartOfDay());

        // Automatically recalculate expiry date: +14 days from new reservation date
        reservation.setExpiryDate(newReservationDate.plusDays(14).atStartOfDay());

        return reservationRepository.save(reservation);
    }
}