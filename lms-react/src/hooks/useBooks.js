// src/hooks/useBooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookApi } from "../api/bookApi";
import Swal from "sweetalert2";

export const useBooks = () => {
  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: () => bookApi.getAll().then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: bookApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      Swal.fire("Success!", "Book added successfully", "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Failed to add book";
      Swal.fire("Error", msg, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => bookApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      Swal.fire("Success!", "Book updated successfully", "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Failed to update book";
      Swal.fire("Error", msg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bookApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      Swal.fire("Deleted!", "Book removed", "success");
    },
  });

  return {
    books,
    isLoading,
    createBook: createMutation.mutate,
    updateBook: updateMutation.mutate,
    deleteBook: deleteMutation.mutate,
  };
};