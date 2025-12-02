package com.ntuc.lms.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//model/Fine.java
@Entity
@Table(name = "FINE")
@Getter @Setter @NoArgsConstructor
public class Fine {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @OneToOne
 @JoinColumn(name = "borrow_id", nullable = false)
 private Borrow borrow;

 @Column(nullable = false, precision = 6, scale = 2)
 private BigDecimal amount;

 @Column(name = "is_paid", nullable = false)
 private boolean paid = false;

 private LocalDateTime paidAt;

 @PrePersist @PreUpdate
 private void validate() {
     if (amount.compareTo(new BigDecimal("20.00")) > 0)
         throw new IllegalArgumentException("Fine cannot exceed 20.00");
     if (paid && paidAt == null) paidAt = LocalDateTime.now();
 }
}