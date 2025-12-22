// src/hooks/useUsers.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/userApi";
import Swal from "sweetalert2";

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.getAllUsers().then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      Swal.fire("Success", "User created!", "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Failed to create user";
      Swal.fire("Error", msg, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      Swal.fire("Success", "User updated!", "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Failed to update user";
      Swal.fire("Error", msg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      Swal.fire("Success", "User deleted successfully", "success");
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.response?.data || "Failed to delete user";

      Swal.fire({
        icon: "error",
        title: "Cannot Delete User",
        text: message,
        confirmButtonText: "OK",
      });
    },
  });

  return {
    users,
    isLoading,
    createUser: createMutation.mutate,
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
  };
};
