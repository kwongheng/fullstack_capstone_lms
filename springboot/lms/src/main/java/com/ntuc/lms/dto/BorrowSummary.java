// BorrowSummary.java
package com.ntuc.lms.dto;

import java.time.LocalDateTime;

public record BorrowSummary(
        Integer id,
        Integer bookId,
        String bookTitle,
        LocalDateTime dueDate,
        boolean isReturned
) {}
