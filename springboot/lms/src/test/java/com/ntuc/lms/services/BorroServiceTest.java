// src/test/java/com/ntuc/lms/services/BorrowServiceTest.java
package com.ntuc.lms.services;

import com.ntuc.lms.model.Book;
import com.ntuc.lms.model.Borrow;
import com.ntuc.lms.model.Member;
import com.ntuc.lms.repository.BookRepository;
import com.ntuc.lms.repository.BorrowRepository;
import com.ntuc.lms.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BorrowServiceTest {

    @Mock
    private BorrowRepository borrowRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private MemberRepository memberRepository;

    private BorrowService borrowService;

    @BeforeEach
    void setUp() {
        borrowService = new BorrowService(borrowRepository, bookRepository, memberRepository);
    }

    @Test
    void borrowBook_Success() {
        // Arrange
        Integer memberId = 1;
        Integer bookId = 1;

        Member member = new Member();
        member.setUserId(memberId);

        Book book = Book.builder()
                .id(bookId)
                .availableCopies(1)
                .build();

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));
        when(borrowRepository.findByIsReturnedFalseAndMember_User_IdAndBook_Id(memberId, bookId))
                .thenReturn(Optional.empty());
        when(borrowRepository.save(any(Borrow.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Borrow borrow = borrowService.borrowBook(memberId, bookId);

        // Assert
        assertThat(borrow.getMember()).isEqualTo(member);
        assertThat(borrow.getBook()).isEqualTo(book);
        assertThat(book.getAvailableCopies()).isEqualTo(0);  // Should decrement
    }

    @Test
    void borrowBook_NoCopiesAvailable_ThrowsException() {
        // Arrange
        Integer memberId = 1;
        Integer bookId = 1;

        Member member = new Member();
        member.setUserId(memberId);

        Book book = Book.builder()
                .id(bookId)
                .availableCopies(0)
                .build();

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));

        // Act & Assert
        assertThatThrownBy(() -> borrowService.borrowBook(memberId, bookId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("No copies available");
    }

    @Test
    void borrowBook_AlreadyBorrowed_ThrowsException() {
        // Arrange
        Integer memberId = 1;
        Integer bookId = 1;

        Member member = new Member();
        member.setUserId(memberId);

        Book book = Book.builder()
                .id(bookId)
                .availableCopies(1)
                .build();

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));
        when(borrowRepository.findByIsReturnedFalseAndMember_User_IdAndBook_Id(memberId, bookId))
                .thenReturn(Optional.of(new Borrow()));

        // Act & Assert
        assertThatThrownBy(() -> borrowService.borrowBook(memberId, bookId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("You have already borrowed this book.");
    }
}