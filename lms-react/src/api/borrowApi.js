// src/api/borrowApi.js
import axiosInstance from "./axiosInstance";

export const borrowApi = {
  // Admin: All borrows
  getAllBorrows: () => axiosInstance.get("/borrows"),

  // Admin: Active borrows only
  getActiveBorrows: () => axiosInstance.get("/borrows/active"),

  // Member: Get current user's active borrows
  getMyActiveBorrows: (userId) =>
    axiosInstance.get(`/borrows/user/${userId}/active`),

  // Member: Get borrow history summary (all borrows, past + present)
  getMyBorrowSummary: (userId) =>
    axiosInstance.get(`/borrows/user/${userId}/summary`),

  // Borrow a book
  borrowBook: (memberUserId, bookId) =>
    axiosInstance.post("/borrows", { memberUserId, bookId }),

  // Return a book
  returnBook: (borrowId) =>
    axiosInstance.patch(`/borrows/${borrowId}/return`),

  // Renew a book
  renewBook: (borrowId) =>
    axiosInstance.patch(`/borrows/${borrowId}/renew`),

  // Trigger fine recalculation (useful for live overdue display)
  calculateFine: (borrowId) =>
    axiosInstance.patch(`/borrows/${borrowId}/calculate-fine`),

  // Pay fine (auto-returns book if not returned yet)
  payFine: (borrowId) =>
    axiosInstance.patch(`/borrows/${borrowId}/pay-fine`),
};