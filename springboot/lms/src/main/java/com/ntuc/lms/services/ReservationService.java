package com.ntuc.lms.services;

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
        return reservationRepository.findByFulfilledFalse();
    }

    @Transactional
    public Reservation reserveBook(Long memberUserId, Long bookId) {  // Fixed: Names, types
        // Fixed: Enforce UQ_ACTIVE_RESERVATION
        if (reservationRepository.findByFulfilledFalseAndMemberUserIdAndBookId(memberUserId, bookId).isPresent()) {
            throw new IllegalStateException("Active reservation exists");
        }
        Member member = memberRepository.findById(memberUserId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        Reservation r = new Reservation();
        r.setMember(member);
        r.setBook(book);
        return reservationRepository.save(r);
    }

    @Transactional
    public Reservation fulfillReservation(Long id) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        r.setFulfilled(true);
        return reservationRepository.save(r);
    }

    @Transactional
    public void cancelReservation(Long id) {
        reservationRepository.deleteById(id);
    }
}