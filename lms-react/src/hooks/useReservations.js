// src/hooks/useReservations.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationApi } from "../api/reservationApi";
import Swal from "sweetalert2";

export const useReservations = () => {
  const queryClient = useQueryClient();

  const { data: allReservations = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => reservationApi.getAllReservations().then((res) => res.data),
  });

  const { data: activeReservations = [], isLoading: isLoadingActive } = useQuery({
    queryKey: ["reservations", "active"],
    queryFn: () => reservationApi.getActiveReservations().then((res) => res.data),
  });

  const reserveMutation = useMutation({
    mutationFn: ({ memberUserId, bookId }) =>
      reservationApi.reserveBook(memberUserId, bookId),
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations"]);
      queryClient.invalidateQueries(["books"]);
      Swal.fire("Reserved!", "Book has been reserved for you", "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Cannot reserve this book";
      Swal.fire("Failed", msg, "error");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: reservationApi.cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations"]);
      queryClient.invalidateQueries(["books"]);
      Swal.fire("Cancelled", "Reservation cancelled", "info");
    },
  });

  const fulfillMutation = useMutation({
    mutationFn: reservationApi.fulfillReservation,
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations"]);
      queryClient.invalidateQueries(["borrows"]);
      queryClient.invalidateQueries(["books"]);
      Swal.fire("Fulfilled", "Reservation marked as fulfilled", "success");
    },
  });

  return {
    allReservations,
    activeReservations,
    isLoadingAll,
    isLoadingActive,

    reserveBook: reserveMutation.mutate,
    cancelReservation: cancelMutation.mutate,
    fulfillReservation: fulfillMutation.mutate,

    isReserving: reserveMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
};