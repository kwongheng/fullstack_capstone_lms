package com.ntuc.lms.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//model/Reservation.java
@Entity
@Table(name = "RESERVATION")
@Getter @Setter @NoArgsConstructor
public class Reservation {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne
 @JoinColumn(name = "user_id", nullable = false)
 private Member member;

 @ManyToOne
 @JoinColumn(name = "book_id", nullable = false)
 private Book book;

 @Column(name = "reservation_date", nullable = false, updatable = false)
 private LocalDateTime reservationDate = LocalDateTime.now();

 @Column(name = "expiry_date", insertable = false, updatable = false)
 private LocalDateTime expiryDate;

 @Column(name = "is_fulfilled", nullable = false)
 private boolean fulfilled = false;
}