// model/Borrow.java
package com.ntuc.lms.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "BORROW", 
    indexes = @Index(name = "IDX_BORROW_DATES", columnList = "borrow_date, due_date"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Borrow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "borrow_date", nullable = false)
    @Builder.Default
    private LocalDateTime borrowDate = LocalDateTime.now();

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "return_date")
    private LocalDateTime returnDate;

    @Column(name = "fine_amount", precision = 6, scale = 2, columnDefinition = "DECIMAL(6,2) DEFAULT 0.00")
    @Builder.Default
    private BigDecimal fineAmount = BigDecimal.ZERO;

    @Column(name = "fine_paid_at")
    private LocalDateTime finePaidAt;

    @Column(name = "times_renew", nullable = false, columnDefinition = "TINYINT DEFAULT 0 CHECK (times_renew <= 2)")
    @Builder.Default
    private byte timesRenew = 0;

    @Column(name = "is_returned")
    @Builder.Default
    private boolean isReturned = false;
    
    public boolean isReturned() {
        return Boolean.TRUE.equals(isReturned);
    }

    public void setReturned(boolean returned) {
        this.isReturned = returned;  
    }
    
    public void renew() {
        if (timesRenew >= 2) {
            throw new IllegalStateException("Book can only be renewed twice");
        }
        timesRenew++;
    }

    public void setFinePaidAt(LocalDateTime finePaidAt) {
        this.finePaidAt = finePaidAt;
    }
}