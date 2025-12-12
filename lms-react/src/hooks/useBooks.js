// src/hooks/useBooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookApi } from "../api/bookApi";
import Swal from "sweetalert2";

export const useBooks = (searchParams = {}) => {
  const queryClient = useQueryClient();

  // Generate a stable query key based on search params
  const searchQueryKey = ["books", searchParams];

  const {
    data: books = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: searchQueryKey,
    queryFn: async () => {
      // If no search params → get all books
      if (Object.keys(searchParams).length === 0) {
        const res = await bookApi.getAll();
        return res.data;
      }
      const res = await bookApi.search(searchParams);
      return res.data;
    },
    keepPreviousData: true, // smooth UX when searching
  });

  const createMutation = useMutation({
    mutationFn: bookApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      Swal.fire("Success!", "Book added successfully", "success");
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to add book";
      Swal.fire("Error", msg, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => bookApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      Swal.fire("Success!", "Book updated successfully", "success");
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Failed to update book";
      Swal.fire("Error", msg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bookApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      Swal.fire("Deleted!", "Book removed", "success");
    },
  });

  return {
    books,
    isLoading,
    isError,
    error,
    createBook: createMutation.mutate,
    updateBook: updateMutation.mutate,
    deleteBook: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};