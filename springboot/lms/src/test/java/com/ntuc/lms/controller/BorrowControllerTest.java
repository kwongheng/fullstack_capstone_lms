// src/test/java/com/ntuc/lms/controller/BorrowControllerTest.java
package com.ntuc.lms.controller;

import com.ntuc.lms.model.Book;
import com.ntuc.lms.model.Borrow;
import com.ntuc.lms.services.BorrowService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BorrowController.class)
class BorrowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BorrowService borrowService;

    @Test
    void getActiveBorrowsByUser_returnsList() throws Exception {
        Borrow borrow = Borrow.builder()
                .id(5)
                .book(Book.builder().title("Clean Code").build())
                .dueDate(LocalDateTime.now().plusDays(7))
                .build();

        when(borrowService.getActiveBorrowsByUser(3)).thenReturn(List.of(borrow));

        mockMvc.perform(get("/api/borrows/user/3/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].book.title").value("Clean Code"));
    }

    @Test
    void borrowBook_createsNewBorrow() throws Exception {
        Borrow newBorrow = Borrow.builder().id(999).build();
        when(borrowService.borrowBook(7, 12)).thenReturn(newBorrow);

        mockMvc.perform(post("/api/borrows")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"memberUserId\":7,\"bookId\":12}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(999));
    }
}