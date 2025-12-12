// src/api/reservationApi.js
import axiosInstance from "./axiosInstance";

export const reservationApi = {
  // Get all reservations (admin)
  getAllReservations: () => axiosInstance.get("/reservations"),

  // Get active (not fulfilled) reservations
  getActiveReservations: () => axiosInstance.get("/reservations/active"),

  // User reserves a book
  reserveBook: (memberUserId, bookId) => axiosInstance.post("/reservations", { memberUserId, bookId }),

  // Admin fulfills a reservation (when issuing book)
  fulfillReservation: (reservationId) => axiosInstance.patch(`/reservations/${reservationId}/fulfill`),

  // User or Admin cancels a reservation
  cancelReservation: (reservationId) => axiosInstance.delete(`/reservations/${reservationId}`),

  // Super user edit
  updateReservationDate: (reservationId, data) =>
    axiosInstance.patch(`/reservations/${reservationId}/super-edit-reservation-date`, data),
};
