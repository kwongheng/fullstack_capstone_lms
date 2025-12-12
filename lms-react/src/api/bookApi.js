// src/api/bookApi.js
import axiosInstance from "./axiosInstance";

export const bookApi = {
  // Existing methods (unchanged)
  getAll: () => axiosInstance.get("/books"),
  getById: (id) => axiosInstance.get(`/books/${id}`),
  getByIsbn: (isbn) => axiosInstance.get(`/books/isbn/${isbn}`),
  create: (book) => axiosInstance.post("/books", book),
  update: (id, book) => axiosInstance.put(`/books/${id}`, book),
  updateCopies: (id, data) =>
    axiosInstance.patch(`/books/${id}/copies`, data),
  delete: (id) => axiosInstance.delete(`/books/${id}`),

  // NEW: Unified search — clean and powerful
  search: (params = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.title) searchParams.append("title", params.title);
    if (params.author) searchParams.append("author", params.author);
    if (params.category) searchParams.append("category", params.category);
    if (params.publisher) searchParams.append("publisher", params.publisher);
    if (params.year) searchParams.append("year", params.year);
    if (params.startYear) searchParams.append("startYear", params.startYear);
    if (params.endYear) searchParams.append("endYear", params.endYear);

    const query = searchParams.toString();
    return axiosInstance.get(`/books/search${query ? `?${query}` : ""}`);
  },

  // Keep old ISBN check (still useful for forms)
  checkIsbnExists: async (isbn, excludeId = null) => {
    try {
      const res = await axiosInstance.get(`/books/isbn/${isbn}`);
      const book = res.data;
      return book && (!excludeId || book.id !== excludeId);
    } catch (err) {
      return false; // 404 → ISBN available
    }
  },
};