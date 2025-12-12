// src/pages/Admin/Super/EditActiveLoans.js
import React, { useState, useMemo } from "react";
import { useBorrows } from "../../../hooks/useBorrows";
import Swal from "sweetalert2";
import { format, addDays, parseISO } from "date-fns";
import {
  User,
  BookOpen,
  DollarSign,
  Calendar,
  Edit3,
} from "lucide-react";

export default function EditActiveLoans() {
  const {
    activeBorrows: activeLoans = [],
    isLoadingActive: isLoading,
    updateLoanDates,
    isUpdatingDates,
  } = useBorrows();

  const [searchField, setSearchField] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [showFinesOnly, setShowFinesOnly] = useState(false);

  const loansByMember = activeLoans.reduce((acc, loan) => {
    const memberId = loan.member.memberId || `MEM-${String(loan.member.user.id).padStart(4, "0")}`;
    if (!acc[memberId]) {
      acc[memberId] = {
        memberId,
        userId: loan.member.user.id,
        fullName: loan.member.user.fullName,
        loans: [],
      };
    }
    acc[memberId].loans.push(loan);
    return acc;
  }, {});

  const members = Object.values(loansByMember);

  const filteredMembers = useMemo(() => {
    let result = members;

    if (searchValue.trim()) {
      const term = searchValue.toLowerCase().trim();
      result = result
        .map((member) => ({
          ...member,
          loans: member.loans.filter((loan) => {
            switch (searchField) {
              case "memberId":
                return member.memberId.toLowerCase().includes(term);
              case "isbn":
                return loan.book.isbn.toLowerCase().includes(term);
              case "title":
                return loan.book.title.toLowerCase().includes(term);
              default:
                return (
                  member.memberId.toLowerCase().includes(term) ||
                  loan.book.isbn.toLowerCase().includes(term) ||
                  loan.book.title.toLowerCase().includes(term)
                );
            }
          }),
        }))
        .filter((member) => member.loans.length > 0);
    }

    if (showFinesOnly) {
      result = result
        .map((member) => ({
          ...member,
          loans: member.loans.filter((loan) => (loan.fineAmount || 0) > 0),
        }))
        .filter((member) => member.loans.length > 0);
    }

    return result.map((member) => {
      const totalFine = member.loans.reduce((sum, l) => sum + (l.fineAmount || 0), 0);
      return { ...member, totalFine };
    });
  }, [members, searchField, searchValue, showFinesOnly]);

  const handleEdit = async (loan) => {
    const originalDate = parseISO(loan.borrowDate);
    const timePart = {
      hours: originalDate.getHours(),
      minutes: originalDate.getMinutes(),
      seconds: originalDate.getSeconds(),
    };

    const { value: selectedDate } = await Swal.fire({
      title: `Edit Borrow Date — ${loan.book.title}`,
      html: `
        <div class="text-start mb-3">
          <p><strong>Member:</strong> ${loan.member.user.fullName}</p>
          <p><strong>Current Borrow:</strong> ${format(originalDate, "dd MMM yyyy HH:mm")}</p>
          <p><strong>Current Due:</strong> ${format(parseISO(loan.dueDate), "dd MMM yyyy HH:mm")}</p>
          ${loan.fineAmount > 0 ? `<p class="text-danger"><strong>Current Fine:</strong> $${loan.fineAmount.toFixed(2)}</p>` : ""}
        </div>
        <label class="form-label">New Borrow Date</label>
      `,
      input: "date",
      inputValue: format(originalDate, "yyyy-MM-dd"),
      showCancelButton: true,
      confirmButtonText: "Update Dates",
      preConfirm: () => {
        const val = document.querySelector('input[type="date"]').value;
        if (!val) {
          Swal.showValidationMessage("Please select a date");
          return false;
        }
        return val;
      },
    });

    if (!selectedDate) return;

    const newBorrowDate = new Date(selectedDate);
    newBorrowDate.setHours(timePart.hours, timePart.minutes, timePart.seconds);
    const newDueDate = addDays(newBorrowDate, 14);

    updateLoanDates({
      borrowId: loan.id,
      dates: {
        borrowDate: newBorrowDate.toISOString(),
        dueDate: newDueDate.toISOString(),
      },
    });
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading active loans...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 d-flex align-items-center">
        <BookOpen className="me-3" size={28} />
        Edit Active Loans (Super User)
      </h2>

      {/* Search & Filter */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-bold">Search By</label>
              <select className="form-select" value={searchField} onChange={(e) => setSearchField(e.target.value)}>
                <option value="all">All Fields</option>
                <option value="memberId">Member ID</option>
                <option value="isbn">ISBN</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Search Term</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter search term..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <div className="form-check mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="finesOnly"
                  checked={showFinesOnly}
                  onChange={(e) => setShowFinesOnly(e.target.checked)}
                />
                <label className="form-check-label fw-bold" htmlFor="finesOnly">
                  Show Only With Fines
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h4>No active loans found</h4>
        </div>
      ) : (
        <>
          <div className="row g-4">
            {filteredMembers.map((member) => (
              <div key={member.memberId} className="col-12">
                <div className="card shadow-sm">
                  <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <User className="me-2" size={20} />
                      {member.memberId} - {member.fullName}
                    </h5>
                    {member.totalFine > 0 && (
                      <span className="badge bg-danger fs-6">
                        <DollarSign size={16} /> Fine: ${member.totalFine.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>ISBN</th>
                            <th>Title</th>
                            <th>Borrowed</th>
                            <th>Due</th>
                            <th>Fine</th>
                            <th>Renewals</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {member.loans.map((loan) => {
                            const isOverdue = new Date(loan.dueDate) < new Date();

                            return (
                              <tr key={loan.id}>
                                <td>{loan.book.isbn}</td>
                                <td>{loan.book.title}</td>
                                <td>
                                  <Calendar size={14} className="me-1 text-muted" />
                                  {format(parseISO(loan.borrowDate), "dd MMM yyyy HH:mm")}
                                </td>
                                <td className={isOverdue ? "text-danger fw-bold" : ""}>
                                  {format(parseISO(loan.dueDate), "dd MMM yyyy HH:mm")}
                                  {isOverdue && " (Overdue)"}
                                </td>
                                <td className={(loan.fineAmount || 0) > 0 ? "text-danger fw-bold" : ""}>
                                  ${(loan.fineAmount || 0).toFixed(2)}
                                </td>
                                <td>{loan.timesRenew}/2</td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() => handleEdit(loan)}
                                    disabled={isUpdatingDates}
                                    title="Edit borrow date & recalculate fine"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}