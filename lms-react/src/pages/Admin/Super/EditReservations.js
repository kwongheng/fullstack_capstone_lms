// src/pages/Admin/Super/EditReservations.js
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { reservationApi } from "../../../api/reservationApi";
import { useReservations } from "../../../hooks/useReservations";
import { format, parseISO, isAfter, startOfDay } from "date-fns";
import Swal from "sweetalert2";
import { Search, User, BookOpen, Edit3, Calendar } from "lucide-react";

export default function EditReservations() {
  const { updateReservationDate, isUpdatingReservationDate } = useReservations();

  const [searchValue, setSearchValue] = useState("");

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["admin", "reservations", "all"],
    queryFn: () => reservationApi.getAllReservations().then((res) => res.data),
    staleTime: 1000 * 30,
  });

  const filteredReservations = useMemo(() => {
    if (!searchValue.trim()) return reservations;
    const term = searchValue.toLowerCase().trim();
    return reservations.filter((r) => {
      const memberName = r.member?.user?.fullName || "";
      const memberId = r.member?.memberId || "";
      const bookTitle = r.book?.title || "";
      const isbn = r.book?.isbn || "";
      return [memberName, memberId, bookTitle, isbn].some((field) =>
        field.toLowerCase().includes(term)
      );
    });
  }, [reservations, searchValue]);

  const handleEdit = async (r) => {
    const currentReservationDate = parseISO(r.reservationDate);
    const today = startOfDay(new Date());

    const { value: selectedDate } = await Swal.fire({
      title: `Edit Reservation Date — ${r.book.title}`,
      html: `
        <div class="text-start mb-3">
          <p><strong>Member:</strong> ${r.member.user.fullName}</p>
          <p><strong>Book:</strong> ${r.book.title} (${r.book.isbn})</p>
          <p><strong>Current Reservation:</strong> ${format(currentReservationDate, "dd MMM yyyy")}</p>
          <p><strong>Current Expiry:</strong> ${format(parseISO(r.expiryDate), "dd MMM yyyy")}</p>
        </div>
        <label class="form-label">New Reservation Date (today or past only)</label>
      `,
      input: "date",
      inputValue: format(currentReservationDate, "yyyy-MM-dd"),
      showCancelButton: true,
      confirmButtonText: "Update & Recalculate Expiry",
      preConfirm: () => {
        const val = document.querySelector('input[type="date"]').value;
        if (!val) {
          Swal.showValidationMessage("Please select a date");
          return false;
        }
        if (isAfter(new Date(val), today)) {
          Swal.showValidationMessage("Reservation date cannot be in the future");
          return false;
        }
        return val;
      },
    });

    if (!selectedDate) return;

    updateReservationDate({
      reservationId: r.id,
      data: { reservationDate: selectedDate },
    });
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading reservations...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 d-flex align-items-center">
        <BookOpen className="me-3" size={28} />
        Edit Reservations (Super User)
      </h2>

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">
                <Search size={16} className="me-1" /> Search
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by member name, ID, book title, or ISBN..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Member</th>
                  <th>Book</th>
                  <th>Reserved</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No reservations found
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((r) => {
                    const isExpired = new Date(r.expiryDate) < new Date();
                    return (
                      <tr key={r.id}>
                        <td>
                          <User size={16} className="me-1 text-primary" />
                          {r.member.user.fullName}
                          <br />
                          <small className="text-muted">{r.member.memberId}</small>
                        </td>
                        <td>
                          <strong>{r.book.title}</strong>
                          <br />
                          <small className="text-muted">{r.book.isbn}</small>
                        </td>
                        <td>{format(parseISO(r.reservationDate), "dd MMM yyyy")}</td>
                        <td>
                          <Calendar size={14} className="me-1 text-muted" />
                          {format(parseISO(r.expiryDate), "dd MMM yyyy")}
                          {isExpired && <span className="text-danger ms-2">(Expired)</span>}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              r.fulfilled
                                ? "bg-success"
                                : isExpired
                                ? "bg-secondary"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {r.fulfilled ? "Fulfilled" : isExpired ? "Expired" : "Active"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(r)}
                            disabled={isUpdatingReservationDate}
                            title="Edit reservation date (today or past only)"
                          >
                            <Edit3 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}