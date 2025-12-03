package com.ntuc.lms.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

//model/Reservation.java
@Entity
@Table(name = "RESERVATION",
        uniqueConstraints = @UniqueConstraint(
                name = "UQ_ACTIVE_RESERVATION",
                columnNames = {"user_id", "book_id", "is_fulfilled"}
        )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "reservation_date",
            nullable = false,
            updatable = false,
            columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private LocalDateTime reservationDate = LocalDateTime.now();

    @Column(name = "expiry_date",
            insertable = false,
            updatable = false,
            columnDefinition = "DATETIME GENERATED ALWAYS AS (reservation_date + INTERVAL 14 DAY) STORED")
    private LocalDateTime expiryDate;

    @Column(name = "is_fulfilled",
            nullable = false,
            columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private boolean isFulfilled = false;
}