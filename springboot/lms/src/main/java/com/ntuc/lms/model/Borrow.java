package com.ntuc.lms.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//model/Borrow.java
@Entity
@Table(name = "BORROW")
@Getter @Setter @NoArgsConstructor
public class Borrow {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne
 @JoinColumn(name = "user_id", nullable = false)
 private Member member;

 @ManyToOne
 @JoinColumn(name = "book_id", nullable = false)
 private Book book;

 @Column(name = "borrow_date", nullable = false, updatable = false)
 private LocalDateTime borrowDate = LocalDateTime.now();

 @Column(name = "due_date", insertable = false, updatable = false)
 private LocalDateTime dueDate;

 private LocalDateTime returnDate;

 @Column(name = "fine_amount", precision = 6, scale = 2)
 private BigDecimal fineAmount = BigDecimal.ZERO;

 @Column(name = "times_renew")
 private Integer timesRenew = 0;

 @Column(name = "is_returned", nullable = false)
 private boolean returned = false;

 @PreUpdate @PrePersist
 private void validate() {
     if (timesRenew > 2) throw new IllegalArgumentException("Max 2 renewals");
     if (fineAmount.compareTo(new BigDecimal("20.00")) > 0)
         throw new IllegalArgumentException("Fine cannot exceed 20.00");
     if (returnDate != null && returnDate.isBefore(borrowDate))
         throw new IllegalArgumentException("Return date cannot be before borrow date");
 }
}