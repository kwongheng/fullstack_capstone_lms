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

  // Get single member by user ID (for UserProfile page)
  const useMember = (userId) => {
    return useQuery({
      queryKey: ["member", userId],
      queryFn: () => memberApi.getMemberByUserId(userId).then((res) => res.data),
      enabled: !!userId,
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };

  // Create new member (Admin action)
  const createMemberMutation = useMutation({
    mutationFn: ({ userId, memberId }) => memberApi.createMember(userId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries(["members"]);
      queryClient.invalidateQueries(["userProfile"]);
      Swal.fire("Success", "Member created successfully", "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Failed to create member";
      Swal.fire("Error", msg, "error");
    },
  });

  return {
    // All members
    members,
    isLoadingAll,
    errorAll,

    // Single member hook
    useMember,

    // Mutations
    createMember: createMemberMutation.mutate,
    isCreatingMember: createMemberMutation.isPending,
  };
};
