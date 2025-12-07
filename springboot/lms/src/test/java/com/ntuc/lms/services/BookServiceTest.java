// src/test/java/com/ntuc/lms/services/BookServiceTest.java
package com.ntuc.lms.services;

import com.ntuc.lms.model.Book;
import com.ntuc.lms.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Year;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    private BookService bookService;

    @BeforeEach
    void setUp() {
        bookService = new BookService(bookRepository);
    }

    @Test
    void searchByTitle_ValidTitle_ReturnsMatchingBooks() {
        // Arrange
        Book book1 = Book.builder().title("Java Programming").build();
        Book book2 = Book.builder().title("Advanced Java").build();
        List<Book> books = Arrays.asList(book1, book2);

        when(bookRepository.findByTitleContainingIgnoreCase("Java")).thenReturn(books);

        // Act
        List<Book> result = bookService.searchByTitle("Java");

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Java Programming");
    }

    @Test
    void searchByPublicationYear_ValidYear_ReturnsMatchingBooks() {
        // Arrange
        Book book = Book.builder().publicationYear(Year.of(2023)).build();
        List<Book> books = Arrays.asList(book);

        when(bookRepository.findByPublicationYear(Year.of(2023))).thenReturn(books);

        // Act
        List<Book> result = bookService.searchByPublicationYear(2023);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPublicationYear()).isEqualTo(Year.of(2023));
    }
}