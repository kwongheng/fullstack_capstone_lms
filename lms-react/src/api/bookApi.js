// src/api/bookApi.js
import axiosInstance from "./axiosInstance";

export const bookApi = {
  getAll: () => axiosInstance.get("/books"),
  getById: (id) => axiosInstance.get(`/books/${id}`),
  create: (book) => axiosInstance.post("/books", book),
  update: (id, book) => axiosInstance.put(`/books/${id}`, book),
  delete: (id) => axiosInstance.delete(`/books/${id}`),

  // Uses your existing /isbn/{isbn} endpoint
  checkIsbnExists: async (isbn, excludeId = null) => {
    try {
      const res = await axiosInstance.get(`/books/isbn/${isbn}`);
      const book = res.data;
      return book && (!excludeId || book.id !== excludeId);
    } catch (err) {
      // 404 means ISBN is free → available
      return false;
    }
  },
};