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

    @Column(name = "reservation_date", nullable = false)
    @Builder.Default
    private LocalDateTime reservationDate = LocalDateTime.now();

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(name = "is_fulfilled",
            nullable = false,
            columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private boolean isFulfilled = false;
}