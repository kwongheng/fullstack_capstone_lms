package com.ntuc.lms.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

//model/Fine.java
@Entity
@Table(name = "FINE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "borrow_id", nullable = false, unique = true)
    private Borrow borrow;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal amount;

    @Column(name = "is_paid", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private boolean isPaid = false;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}