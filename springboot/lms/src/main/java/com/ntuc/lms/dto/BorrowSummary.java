// dto/BorrowSummary.java
package com.ntuc.lms.dto;

import java.time.LocalDateTime;

public record BorrowSummary(
    Integer id,
    Integer bookId,
    String bookTitle,
    LocalDateTime dueDate,
    Boolean isReturned
) {
    // Add constructor that calls the method
    public BorrowSummary(com.ntuc.lms.model.Borrow borrow) {
        this(
            borrow.getId(),
            borrow.getBook().getId(),
            borrow.getBook().getTitle(),
            borrow.getDueDate(),
            borrow.getIsReturned()  
        );
    }
}