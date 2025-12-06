// src/pages/Admin/BookLoans/ActiveLoans.js
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowApi } from "../../../api/borrowApi";
import Swal from "sweetalert2";
import { format } from "date-fns";
import {
  RefreshCw,
  Undo2,
  User,
  BookOpen,
  DollarSign,
  Search,
  Filter,
} from "lucide-react";

export default function ActiveLoans() {
  const queryClient = useQueryClient();

  const [searchField, setSearchField] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [showFinesOnly, setShowFinesOnly] = useState(false);

  const { data: activeLoans = [], isLoading } = useQuery({
    queryKey: ["admin", "active-loans"],
    queryFn: () => borrowApi.getActiveBorrows().then(res => res.data),
    staleTime: 1000 * 30,
  });

  // Group by member
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

  let members = Object.values(loansByMember);

  // Apply filters
  const filteredMembers = useMemo(() => {
    let filtered = members;

    if (searchValue.trim()) {
      const term = searchValue.toLowerCase().trim();
      filtered = filtered
        .map(member => ({
          ...member,
          loans: member.loans.filter(loan => {
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
        .filter(member => member.loans.length > 0);
    }

    if (showFinesOnly) {
      filtered = filtered
        .map(member => ({
          ...member,
          loans: member.loans.filter(loan => (loan.fineAmount || 0) > 0),
        }))
        .filter(member => member.loans.length > 0);
    }

    return filtered;
  }, [members, searchField, searchValue, showFinesOnly]);

  const returnMutation = useMutation({
    mutationFn: borrowApi.returnBook,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "active-loans"]);
      Swal.fire("Returned", "Book returned successfully", "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Cannot return book";
      Swal.fire("Error", msg, "error");
    },
  });

  const renewMutation = useMutation({
    mutationFn: borrowApi.renewBook,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "active-loans"]);
      Swal.fire("Renewed", "Loan extended by 14 days", "success");
    },
    onError: (err) => {
      Swal.fire("Cannot Renew", err.response?.data || "Check conditions", "warning");
    },
  });

  const handleReturn = (borrowId) => {
    Swal.fire({
      title: "Return Book?",
      text: "This will return the book for the member.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, return it",
    }).then(result => {
      if (result.isConfirmed) {
        returnMutation.mutate(borrowId);
      }
    });
  };

  const handleRenew = (borrowId) => {
    renewMutation.mutate(borrowId);
  };

  if (isLoading) return <div className="p-4 text-center">Loading active loans...</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4 d-flex align-items-center">
        <BookOpen className="me-3" size={28} />
        Active Loans (Admin View)
      </h2>

      {/* Search & Filter Panel */}
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
                  <Filter size={16} className="me-1" />
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
            {filteredMembers.map(member => {
              const totalFine = member.loans.reduce((sum, l) => sum + (l.fineAmount || 0), 0);

              return (
                <div key={member.memberId} className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <User className="me-2" size={20} />
                        {member.memberId} - {member.fullName}
                      </h5>
                      {totalFine > 0 && (
                        <span className="badge bg-danger fs-6">
                          <DollarSign size={16} /> Fine: ${totalFine.toFixed(2)}
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
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {member.loans.map(loan => {
                              const isOverdue = new Date(loan.dueDate) < new Date();
                              const canRenew = loan.timesRenew < 2 && !isOverdue && (loan.fineAmount || 0) === 0;
                              const canReturn = (loan.fineAmount || 0) === 0;

                              return (
                                <tr key={loan.id}>
                                  <td>{loan.book.isbn}</td>
                                  <td>{loan.book.title}</td>
                                  <td>{format(new Date(loan.borrowDate), "dd MMM yyyy")}</td>
                                  <td className={isOverdue ? "text-danger fw-bold" : ""}>
                                    {format(new Date(loan.dueDate), "dd MMM yyyy")}
                                    {isOverdue && " (Overdue)"}
                                  </td>
                                  <td className={(loan.fineAmount || 0) > 0 ? "text-danger fw-bold" : ""}>
                                    ${(loan.fineAmount || 0).toFixed(2)}
                                  </td>
                                  <td>{loan.timesRenew}/2</td>
                                  <td>
                                    <div className="btn-group" role="group">
                                      <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleRenew(loan.id)}
                                        disabled={!canRenew}
                                        title="Renew (+14 days)"
                                      >
                                        <RefreshCw size={14} />
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleReturn(loan.id)}
                                        disabled={!canReturn}
                                        title="Return Book"
                                      >
                                        <Undo2 size={14} />
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
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Footer */}
          <div className="mt-5 p-4 bg-light border rounded shadow-sm">
            <div className="d-flex justify-content-between align-items-center text-muted small fw-bold">
              <span>
                {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""} with active loans
              </span>
              <span>
                Total active books borrowed:{" "}
                <strong className="text-primary fs-5">
                  {filteredMembers.reduce((sum, m) => sum + m.loans.length, 0)}
                </strong>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}