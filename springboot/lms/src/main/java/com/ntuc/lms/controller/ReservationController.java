package com.ntuc.lms.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ntuc.lms.model.Reservation;
import com.ntuc.lms.services.ReservationService;

import lombok.RequiredArgsConstructor;

//controller/ReservationController.java
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

 private final ReservationService reservationService;

 @GetMapping
 public ResponseEntity<List<Reservation>> getAllReservations() {
     return ResponseEntity.ok(reservationService.getAll());
 }

 @GetMapping("/active")
 public ResponseEntity<List<Reservation>> getActiveReservations() {
     return ResponseEntity.ok(reservationService.getActiveReservations());
 }

 @PostMapping
 public ResponseEntity<Reservation> reserveBook(@RequestBody ReservationRequest request) {
     Reservation reservation = reservationService.reserveBook(
             request.memberUserId(),
             request.bookId()
     );
     return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
 }

 @PatchMapping("/{id}/fulfill")
 public ResponseEntity<Reservation> fulfillReservation(@PathVariable Long id) {
     Reservation fulfilled = reservationService.fulfillReservation(id);
     return ResponseEntity.ok(fulfilled);
 }

 @DeleteMapping("/{id}")
 public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
     reservationService.cancelReservation(id);
     return ResponseEntity.noContent().build();
 }
}

record ReservationRequest(Long memberUserId, Long bookId) {}