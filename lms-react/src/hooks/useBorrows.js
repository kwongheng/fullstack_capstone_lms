// src/hooks/useBorrows.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowApi } from "../api/borrowApi";
import Swal from "sweetalert2";
import { calculateFineAmount } from "../utils/fineCalculator";

export const useBorrows = (currentUserId = null) => {
  const queryClient = useQueryClient();

  // Admin: All borrows
  const {
    data: allBorrows = [],
    isLoading: isLoadingAll,
  } = useQuery({
    queryKey: ["borrows"],
    queryFn: () => borrowApi.getAllBorrows().then((res) => res.data),
    staleTime: 1000 * 60,
  });

  // Admin: Active borrows — NOW WITH AUTO FINE CALCULATION
  const {
    data: activeBorrowsRaw = [],
    isLoading: isLoadingActive,
  } = useQuery({
    queryKey: ["borrows", "active"],
    queryFn: () => borrowApi.getActiveBorrows().then((res) => res.data),
    staleTime: 1000 * 30,
  });

  const activeBorrows = activeBorrowsRaw.map(loan => ({
    ...loan,
    fineAmount: calculateFineAmount(loan.dueDate),
  }));

  // Member: My active borrows — already had fine calculation
  const {
    data: myActiveBorrowsRaw = [],
    isLoading: isLoadingMyActive,
    refetch: refetchMyActive,
  } = useQuery({
    queryKey: ["borrows", "user", currentUserId, "active"],
    queryFn: () => borrowApi.getMyActiveBorrows(currentUserId).then((res) => res.data),
    enabled: !!currentUserId,
    staleTime: 1000 * 30,
  });

  const myActiveBorrows = myActiveBorrowsRaw.map(loan => ({
    ...loan,
    fineAmount: calculateFineAmount(loan.dueDate),
  }));

  // Member: Summary — also fine-calculated
  const {
    data: myBorrowSummaryRaw = [],
    isLoading: isLoadingSummary,
  } = useQuery({
    queryKey: ["borrows", "user", currentUserId, "summary"],
    queryFn: () => borrowApi.getMyBorrowSummary(currentUserId).then((res) => res.data),
    enabled: !!currentUserId,
    staleTime: 1000 * 60,
  });

  const myBorrowSummary = myBorrowSummaryRaw.map(item => ({
    ...item,
    fineAmount: item.dueDate ? calculateFineAmount(item.dueDate) : 0,
  }));

  // Mutations — unchanged
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
      const msg = err.response?.data || "Failed to borrow book";
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

  const payFineMutation = useMutation({
    mutationFn: borrowApi.payFine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      if (currentUserId) {
        queryClient.invalidateQueries(["borrows", "user", currentUserId]);
      }
      Swal.fire("Paid!", "Fine cleared", "success");
    },
    onError: () => Swal.fire("Error", "Payment failed", "error"),
  });

  return {
    allBorrows,
    activeBorrows,           // ← NOW HAS CORRECT fineAmount
    isLoadingAll,
    isLoadingActive,

    myActiveBorrows,
    myBorrowSummary,
    isLoadingMyActive,
    isLoadingSummary,
    refetchMyActive,

    borrowBook: borrowMutation.mutate,
    returnBook: returnMutation.mutate,
    renewBook: renewMutation.mutate,
    payFine: payFineMutation.mutate,

    isBorrowing: borrowMutation.isPending,
    isReturning: returnMutation.isPending,
    isRenewing: renewMutation.isPending,
    isPayingFine: payFineMutation.isPending,
  };
};