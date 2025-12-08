// src/hooks/useMembers.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memberApi } from "../api/memberApi";
import Swal from "sweetalert2";

export const useMembers = () => {
  const queryClient = useQueryClient();

  // Get all members (Admin dashboard)
  const {
    data: members = [],
    isLoading: isLoadingAll,
    error: errorAll,
  } = useQuery({
    queryKey: ["members"],
    queryFn: () => memberApi.getAllMembers().then((res) => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get single member by user ID
  const useMember = (userId) => {
    return useQuery({
      queryKey: ["member", userId],
      queryFn: () => memberApi.getMemberByUserId(userId).then((res) => res.data),
      enabled: !!userId,
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };

  // Create new member
  const createMemberMutation = useMutation({
    mutationFn: ({ userId, memberId }) => memberApi.createMember(userId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      Swal.fire("Success", "Member created successfully", "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Failed to create member";
      Swal.fire("Error", msg, "error");
    },
  });

  // Update member status (Admin only)
  const updateMemberStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => memberApi.updateMemberStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member"] });
      Swal.fire("Success", "Status updated successfully", "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Failed to update status";
      Swal.fire("Error", msg, "error");
    },
  });

  // Renew membership (used on login)
  const renewMembershipMutation = useMutation({
    mutationFn: (userId) => memberApi.renewMembership(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member"] });
      Swal.fire("Success!", "Your membership has been renewed for 1 year.", "success");
    },
    onError: (err) => {
      const msg = err.response?.data?.error || "Failed to renew membership";
      Swal.fire("Error", msg, "error");
    },
  });

  return {
    // Data
    members,
    isLoadingAll,
    errorAll,

    // Hooks
    useMember,

    // Mutations
    createMember: createMemberMutation.mutate,
    isCreatingMember: createMemberMutation.isPending,

    updateMemberStatus: updateMemberStatusMutation.mutate,
    isUpdatingStatus: updateMemberStatusMutation.isPending,

    renewMembership: renewMembershipMutation.mutate,
    isRenewing: renewMembershipMutation.isPending,
  };
};