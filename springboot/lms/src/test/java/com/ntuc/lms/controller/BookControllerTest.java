// src/test/java/com/ntuc/lms/controller/BookControllerTest.java
package com.ntuc.lms.controller;

import com.ntuc.lms.model.Book;
import com.ntuc.lms.services.BookService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Year;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookController.class)
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookService bookService;

    @Test
    void getAllBooks_returnsBookList() throws Exception {
        Book book = Book.builder()
                .id(1)
                .title("Spring in Action")
                .author("Craig Walls")
                .isbn("9781617294945")
                .publicationYear(Year.of(2022))
                .availableCopies(5)
                .build();

        when(bookService.getAll()).thenReturn(List.of(book));

        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Spring in Action"))
                .andExpect(jsonPath("$[0].availableCopies").value(5));
    }

    @Test
    void searchByTitle_findsBooks() throws Exception {
        when(bookService.searchByTitle("java"))
                .thenReturn(List.of(Book.builder().title("Java Concurrency").build()));

        mockMvc.perform(get("/api/books/search/title?title=java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Java Concurrency"));
    }
}