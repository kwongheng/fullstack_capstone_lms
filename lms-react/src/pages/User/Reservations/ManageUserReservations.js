// src/pages/User/Reservations/ManageUserReservations.js
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { reservationApi } from "../../../api/reservationApi";
import Swal from "sweetalert2";
import { X } from "lucide-react";
import { format } from "date-fns";

export default function ManageUserReservations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["reservations", "user", user?.id, "active"],
    queryFn: () => 
      reservationApi.getActiveReservations().then(res => 
        res.data.filter(r => r.member.user.id === user.id)
      ),
    enabled: !!user?.id,
    staleTime: 1000 * 30,
  });

  const cancelMutation = useMutation({
    mutationFn: reservationApi.cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations", "user", user.id]);
      Swal.fire("Cancelled", "Reservation cancelled successfully", "success");
    },
    onError: () => {
      Swal.fire("Error", "Failed to cancel reservation", "error");
    },
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading your reservations...</div>;
  }

  if (reservations.length === 0) {
    return (
      <div className="p-4 text-center py-5">
        <h3>No Active Reservations</h3>
        <p>You have no current reservations.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Manage Reservations</h2>

      <div className="list-group mb-4">
        {reservations.map(resv => (
          <div key={resv.id} className="list-group-item p-4 border-start-4 border-primary">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="text-primary mb-2">
                  {resv.book.title}
                </h5>
                <div className="small text-muted">
                  <strong>Reserved:</strong> {format(new Date(resv.reservationDate), "dd MMM yyyy HH:mm")} | 
                  <strong>Expires:</strong> {format(new Date(resv.expiryDate), "dd MMM yyyy")}
                </div>
              </div>

              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  Swal.fire({
                    title: "Cancel Reservation?",
                    text: "This action cannot be undone.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, cancel",
                  }).then(result => {
                    if (result.isConfirmed) {
                      cancelMutation.mutate(resv.id);
                    }
                  });
                }}
                disabled={cancelMutation.isPending}
              >
                <X size={16} className="me-1" />
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}