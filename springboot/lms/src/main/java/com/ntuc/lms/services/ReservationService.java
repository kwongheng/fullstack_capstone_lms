package com.ntuc.lms.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ntuc.lms.model.Book;
import com.ntuc.lms.model.Member;
import com.ntuc.lms.model.Reservation;
import com.ntuc.lms.repository.BookRepository;
import com.ntuc.lms.repository.MemberRepository;
import com.ntuc.lms.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;

//service/ReservationService.java
@Service
@RequiredArgsConstructor
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

 public Reservation reserveBook(Long integer, Long integer2) {
     Member member = memberRepository.findById(integer)
             .orElseThrow(() -> new RuntimeException("Member not found"));
     Book book = bookRepository.findById(integer2)
             .orElseThrow(() -> new RuntimeException("Book not found"));

     Reservation r = new Reservation();
     r.setMember(member);
     r.setBook(book);
     return reservationRepository.save(r);
 }

 public Reservation fulfillReservation(Long id) {
     Reservation r = reservationRepository.findById(id)
             .orElseThrow(() -> new RuntimeException("Reservation not found"));
     r.setFulfilled(true);
     return reservationRepository.save(r);
 }

 public void cancelReservation(Long id) {
     reservationRepository.deleteById(id);
 }
}