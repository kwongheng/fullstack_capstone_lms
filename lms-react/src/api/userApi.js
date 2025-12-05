// src/api/userApi.js
import axiosInstance from "./axiosInstance";

export const userApi = {
  login: (email, password) => axiosInstance.post("/users/login", { email, password }),

  getAllUsers: () => axiosInstance.get("/users"),
  getUserById: (id) => axiosInstance.get(`/users/${id}`),
  createUser: (userData) => axiosInstance.post("/users", userData),
  updateUser: (id, userData) => axiosInstance.put(`/users/${id}`, userData),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
  searchUsers: (name) => axiosInstance.get("/users/search", { params: { name } }),
  checkEmailAvailability: (email, excludeId = null) =>
  axiosInstance.get("/users/check-email", {
    params: { email, excludeId }
  }),
};
