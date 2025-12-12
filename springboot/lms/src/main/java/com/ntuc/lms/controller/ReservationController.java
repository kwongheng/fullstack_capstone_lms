package com.ntuc.lms.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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
		Reservation reservation = reservationService.reserveBook(request.memberUserId(), request.bookId());
		return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
	}

	@PatchMapping("/{id}/fulfill")
	public ResponseEntity<Reservation> fulfillReservation(@PathVariable Integer id) {
		Reservation fulfilled = reservationService.fulfillReservation(id);
		return ResponseEntity.ok(fulfilled);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> cancelReservation(@PathVariable Integer id) {
		reservationService.cancelReservation(id);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/super-edit-reservation-date")
	public ResponseEntity<Reservation> superEditReservationDate(@PathVariable Integer id,
			@RequestBody Map<String, String> body) {

		LocalDate reservationDate = LocalDate.parse(body.get("reservationDate"));
		Reservation updated = reservationService.updateReservationDate(id, reservationDate);
		return ResponseEntity.ok(updated);
	}

}

record ReservationRequest(Integer memberUserId, Integer bookId) {
}