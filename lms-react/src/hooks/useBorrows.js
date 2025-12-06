// src/hooks/useBorrows.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowApi } from "../api/borrowApi";
import Swal from "sweetalert2";

export const useBorrows = (currentUserId = null) => {
  const queryClient = useQueryClient();

  // Admin: All borrows
  const {
    data: allBorrows = [],
    isLoading: isLoadingAll,
  } = useQuery({
    queryKey: ["borrows"],
    queryFn: () => borrowApi.getAllBorrows().then((res) => res.data),
    staleTime: 1000 * 60, // 1 min
  });

  // Admin: Only active borrows
  const {
    data: activeBorrows = [],
    isLoading: isLoadingActive,
  } = useQuery({
    queryKey: ["borrows", "active"],
    queryFn: () => borrowApi.getActiveBorrows().then((res) => res.data),
    staleTime: 1000 * 30,
  });

  // Member: My current active borrows
  const {
    data: myActiveBorrows = [],
    isLoading: isLoadingMyActive,
    refetch: refetchMyActive,
  } = useQuery({
    queryKey: ["borrows", "user", currentUserId, "active"],
    queryFn: () => borrowApi.getMyActiveBorrows(currentUserId).then((res) => res.data),
    enabled: !!currentUserId,
    staleTime: 1000 * 30,
  });

  // Member: My full borrow history summary (lighter payload)
  const {
    data: myBorrowSummary = [],
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["borrows", "user", currentUserId, "summary"],
    queryFn: () => borrowApi.getMyBorrowSummary(currentUserId).then((res) => res.data),
    enabled: !!currentUserId,
    staleTime: 1000 * 60,
  });

  const borrowMutation = useMutation({
    mutationFn: ({ memberUserId, bookId }) =>
      borrowApi.borrowBook(memberUserId, bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      if (currentUserId) {
        queryClient.invalidateQueries(["borrows", "user", currentUserId]);
      }
      Swal.fire("Success!", "Book borrowed successfully", "success");
    },
    onError: (err) => {
      const msg = err.response?.data || err.message || "Failed to borrow book";
      Swal.fire("Error", msg, "error");
    },
  });

  const returnMutation = useMutation({
    mutationFn: borrowApi.returnBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      if (currentUserId) {
        queryClient.invalidateQueries(["borrows", "user", currentUserId]);
      }
      Swal.fire("Returned", "Book returned successfully", "success");
    },
    onError: () => Swal.fire("Error", "Failed to return book", "error"),
  });

  const renewMutation = useMutation({
    mutationFn: borrowApi.renewBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      if (currentUserId) {
        queryClient.invalidateQueries(["borrows", "user", currentUserId]);
      }
      Swal.fire("Renewed!", "Loan extended by 14 days", "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Cannot renew book";
      Swal.fire("Cannot Renew", msg, "warning");
    },
  });

  const calculateFineMutation = useMutation({
    mutationFn: borrowApi.calculateFine,
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["borrows", "user", currentUserId, "active"],
        (old) => old?.map((b) => (b.id === data.id ? data : b)) || []
      );
      queryClient.setQueryData(
        ["borrows", "user", currentUserId, "summary"],
        (old) => old?.map((b) => (b.id === data.id ? { ...b, fineAmount: data.fineAmount } : b)) || []
      );
    },
  });

  const payFineMutation = useMutation({
    mutationFn: borrowApi.payFine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      if (currentUserId) {
        queryClient.invalidateQueries(["borrows", "user", currentUserId]);
      }
      Swal.fire("Paid!", "Fine cleared and book returned", "success");
    },
    onError: () => Swal.fire("Error", "Failed to process payment", "error"),
  });

  return {
    // Admin data
    allBorrows,
    activeBorrows,
    isLoadingAll,
    isLoadingActive,

    // Member data
    myActiveBorrows,
    myBorrowSummary,
    isLoadingMyActive,
    isLoadingSummary,
    refetchMyActive,
    refetchSummary,

    // Mutations
    borrowBook: borrowMutation.mutate,
    returnBook: returnMutation.mutate,
    renewBook: renewMutation.mutate,
    calculateFine: calculateFineMutation.mutate,
    payFine: payFineMutation.mutate,

    // Loading states
    isBorrowing: borrowMutation.isPending,
    isReturning: returnMutation.isPending,
    isRenewing: renewMutation.isPending,
    isPayingFine: payFineMutation.isPending,
  };
};