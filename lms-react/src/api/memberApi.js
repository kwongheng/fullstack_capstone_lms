// src/api/memberApi.js
import axiosInstance from "./axiosInstance";

export const memberApi = {
  // Get all members (Admin only)
  getAllMembers: () => axiosInstance.get("/members"),

  // Get member by user ID (used in UserProfile and Login)
  getMemberByUserId: (userId) =>
    axiosInstance.get(`/members/${userId}`),

  // Create new member (Admin only)
  createMember: (userId, memberId) =>
    axiosInstance.post("/members", { userId, memberId }),

  // Update member status (Admin only)
  updateMemberStatus: (userId, status) =>
    axiosInstance.patch(`/members/${userId}/status`, { status }),

  // Renew membership (used on login)
  renewMembership: (userId) =>
    axiosInstance.patch(`/members/${userId}/renew`),

  // Super user join date update
  updateJoinDate: (userId, dateString) =>
    axiosInstance.patch(`/members/${userId}/join-date`, { joinDate: dateString }),
};