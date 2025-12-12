// src/test/java/com/ntuc/lms/controller/ReservationControllerTest.java
package com.ntuc.lms.controller;

import com.ntuc.lms.model.Reservation;
import com.ntuc.lms.services.ReservationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReservationController.class)
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReservationService reservationService;

    @Test
    void reserveBook_createsReservation() throws Exception {
        Reservation reservation = Reservation.builder().id(50).build();

        when(reservationService.reserveBook(4, 20)).thenReturn(reservation);

        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"memberUserId":4,"bookId":20}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(50));
    }
}