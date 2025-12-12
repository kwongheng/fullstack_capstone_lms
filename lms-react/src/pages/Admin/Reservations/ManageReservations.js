// src/pages/Admin/BookReservations/ManageReservations.js
import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { reservationApi } from "../../../api/reservationApi";
import { useReservations } from "../../../hooks/useReservations"; // ← keep import
import { format, isAfter, subDays } from "date-fns";
import Swal from "sweetalert2";
import {
  Search,
  User,
  BookOpen,
  CheckCircle,
  Trash2,
  AlertCircle,
} from "lucide-react";

export default function ManageReservations() {
  const queryClient = useQueryClient();

  const {
    fulfillReservation,
    cancelReservation,
    isCancelling,
  } = useReservations();

  // Search state
  const [searchField, setSearchField] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  // Admin: Fetch all reservations
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["admin", "reservations", "all"],
    queryFn: () => reservationApi.getAllReservations().then((res) => res.data),
    staleTime: 1000 * 30,
  });

  // Auto-cleanup old expired reservations
  useEffect(() => {
    const cleanupOld = async () => {
      const cutoff = subDays(new Date(), 15);
      const oldOnes = reservations.filter(
        (r) => !r.fulfilled && new Date(r.expiryDate) < cutoff
      );

      if (oldOnes.length > 0) {
        try {
          await Promise.all(
            oldOnes.map((r) => reservationApi.cancelReservation(r.id))
          );
          queryClient.invalidateQueries(["admin", "reservations", "all"]);
        } catch (err) {
          console.warn("Auto-cleanup of old reservations failed", err);
        }
      }
    };

    if (reservations.length > 0) cleanupOld();
  }, [reservations, queryClient]);

  const handleCancel = (id, memberName, bookTitle) => {
    Swal.fire({
      title: "Cancel Reservation?",
      text: `${memberName}'s reservation for "${bookTitle}" will be removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
    }).then((result) => {
      if (result.isConfirmed) {
        cancelReservation(id);
      }
    });
  };

  const handleFulfill = (id, memberName, bookTitle) => {
    Swal.fire({
      title: "Mark as Fulfilled?",
      text: `Confirm ${memberName} has picked up "${bookTitle}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, fulfill",
    }).then((result) => {
      if (result.isConfirmed) {
        fulfillReservation(id);
      }
    });
  };

  const filteredReservations = useMemo(() => {
    if (!searchValue.trim()) return reservations;

    const term = searchValue.toLowerCase().trim();
    return reservations.filter((r) => {
      const memberId =
        r.member?.memberId ||
        `MEM-${String(r.member?.user?.id || "").padStart(4, "0")}`;
      const fullName = r.member?.user?.fullName || "";
      const isbn = r.book?.isbn || "";
      const title = r.book?.title || "";
      const reservedDate = format(new Date(r.reservationDate), "dd MMM yyyy");

      switch (searchField) {
        case "memberId":
          return memberId.toLowerCase().includes(term);
        case "isbn":
          return isbn.toLowerCase().includes(term);
        case "title":
          return title.toLowerCase().includes(term);
        case "reservedDate":
          return reservedDate.includes(term);
        default:
          return (
            memberId.toLowerCase().includes(term) ||
            fullName.toLowerCase().includes(term) ||
            isbn.toLowerCase().includes(term) ||
            title.toLowerCase().includes(term) ||
            reservedDate.includes(term)
          );
      }
    });
  }, [reservations, searchField, searchValue]);

  const stats = useMemo(() => {
    const now = new Date();
    const active = filteredReservations.filter(
      (r) => !r.fulfilled && isAfter(new Date(r.expiryDate), now)
    ).length;
    const expired = filteredReservations.filter(
      (r) => !r.fulfilled && new Date(r.expiryDate) < now
    ).length;
    const fulfilled = filteredReservations.filter((r) => r.fulfilled).length;

    return { total: filteredReservations.length, active, expired, fulfilled };
  }, [filteredReservations]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading reservations...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 d-flex align-items-center">
        <BookOpen className="me-3" size={28} />
        Manage All Reservations (Admin)
      </h2>

      {/* Search Panel */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-bold">
                <Search size={16} className="me-1" />
                Search By
              </label>
              <select
                className="form-select"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="all">All Fields</option>
                <option value="memberId">Member ID</option>
                <option value="isbn">ISBN</option>
                <option value="title">Title</option>
                <option value="reservedDate">Reserved Date</option>
              </select>
            </div>
            <div className="col-md-7">
              <label className="form-label fw-bold">Search Term</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search reservations..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchValue("");
                  setSearchField("all");
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h4>No reservations found</h4>
          {searchValue && <p>Try adjusting your search filters.</p>}
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Member ID</th>
                    <th>Name</th>
                    <th>ISBN</th>
                    <th>Title</th>
                    <th>Reserved</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((r) => {
                    const memberId =
                      r.member?.memberId ||
                      `MEM-${String(r.member?.user?.id || "").padStart(4, "0")}`;
                    const fullName = r.member?.user?.fullName || "Unknown";
                    const isExpired = new Date(r.expiryDate) < new Date();

                    return (
                      <tr
                        key={r.id}
                        className={
                          isExpired && !r.fulfilled
                            ? "text-muted bg-light"
                            : r.fulfilled
                            ? "bg-success bg-opacity-10"
                            : ""
                        }
                      >
                        <td>
                          <User size={16} className="me-1 text-primary" />
                          <strong>{memberId}</strong>
                        </td>
                        <td>{fullName}</td>
                        <td>
                          <code className="small">{r.book?.isbn || "N/A"}</code>
                        </td>
                        <td>
                          <BookOpen size={16} className="me-1 text-success" />
                          {r.book?.title || "Unknown Book"}
                        </td>
                        <td>{format(new Date(r.reservationDate), "dd MMM yyyy HH:mm")}</td>
                        <td>
                          {format(new Date(r.expiryDate), "dd MMM yyyy")}
                          {isExpired && !r.fulfilled && (
                            <span className="badge bg-danger ms-2">Expired</span>
                          )}
                        </td>
                        <td>
                          {r.fulfilled ? (
                            <span className="badge bg-success">
                              <CheckCircle size={14} className="me-1" />
                              Fulfilled
                            </span>
                          ) : isExpired ? (
                            <span className="badge bg-secondary">
                              <AlertCircle size={14} className="me-1" />
                              Expired
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark">Active</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            {!r.fulfilled && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() =>
                                  handleFulfill(r.id, fullName, r.book?.title)
                                }
                                disabled={isCancelling}
                                title="Mark as Fulfilled"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleCancel(r.id, fullName, r.book?.title)
                              }
                              disabled={isCancelling}
                              title="Cancel Reservation"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-footer bg-light">
            <div className="row text-center text-md-start small fw-bold">
              <div className="col-md-3 col-6">
                <strong>{stats.total}</strong> Total
              </div>
              <div className="col-md-3 col-6 text-success">
                <strong>{stats.active}</strong> Active
              </div>
              <div className="col-md-3 col-6 text-danger">
                <strong>{stats.expired}</strong> Expired
              </div>
              <div className="col-md-3 col-6 text-primary">
                <strong>{stats.fulfilled}</strong> Fulfilled
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}