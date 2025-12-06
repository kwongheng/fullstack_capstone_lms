// src/api/memberApi.js
import axiosInstance from "./axiosInstance";

export const memberApi = {
  // Get all members (Admin only)
  getAllMembers: () => axiosInstance.get("/members"),

  // Get member by user ID (used in UserProfile)
  getMemberByUserId: (userId) =>
    axiosInstance.get(`/members/${userId}`),

  // Create new member (Admin only)
  createMember: (userId, memberId) =>
    axiosInstance.post("/members", { userId, memberId }),
};