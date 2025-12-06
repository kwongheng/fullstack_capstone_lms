// src/pages/Admin/BookLoans/ViewLoansHistory.js
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { borrowApi } from "../../../api/borrowApi";
import { format } from "date-fns";
import {
  History,
  Search,
  User,
  BookOpen,
  RefreshCw,
} from "lucide-react";

export default function ViewLoansHistory() {
  const [searchField, setSearchField] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  const { data: allBorrows = [], isLoading } = useQuery({
    queryKey: ["admin", "all-borrows"],
    queryFn: () => borrowApi.getAllBorrows().then((res) => res.data),
    staleTime: 1000 * 60,
  });

  // CRITICAL FIX: Returned loans are those with isReturned === null OR true
  // Active loans have isReturned === false
  const returnedLoans = useMemo(() => {
    return allBorrows.filter(
      (loan) => loan.isReturned !== false // This captures null and true
    );
  }, [allBorrows]);

  const enrichedHistory = useMemo(() => {
    return returnedLoans.map((loan) => ({
      id: loan.id,
      memberId:
        loan.member?.memberId ||
        `MEM-${String(loan.member?.user?.id || "").padStart(4, "0")}`,
      fullName: loan.member?.user?.fullName || "Unknown Member",
      isbn: loan.book?.isbn || "N/A",
      title: loan.book?.title || "Unknown Title",
      dateBorrowed: loan.borrowDate,
      dateReturned: loan.returnDate || loan.returnedAt || "Not recorded", // fallback
      renews: loan.timesRenew || 0,
    }));
  }, [returnedLoans]);

  const filteredHistory = useMemo(() => {
    if (!searchValue.trim()) return enrichedHistory;

    const term = searchValue.toLowerCase().trim();
    return enrichedHistory.filter((loan) => {
      switch (searchField) {
        case "memberId":
          return loan.memberId.toLowerCase().includes(term);
        case "isbn":
          return loan.isbn.toLowerCase().includes(term);
        case "title":
          return loan.title.toLowerCase().includes(term);
        default:
          return (
            loan.memberId.toLowerCase().includes(term) ||
            loan.fullName.toLowerCase().includes(term) ||
            loan.isbn.toLowerCase().includes(term) ||
            loan.title.toLowerCase().includes(term)
          );
      }
    });
  }, [enrichedHistory, searchField, searchValue]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading loan history...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 d-flex align-items-center">
        <History className="me-3" size={28} />
        All Loans History (Admin View)
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
              </select>
            </div>
            <div className="col-md-9">
              <label className="form-label fw-bold">Search Term</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by member, book title, ISBN..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h4>
            {searchValue
              ? "No matching returned loans found"
              : "No returned loans in history yet"}
          </h4>
          {searchValue && <p>Try different keywords or clear the search.</p>}
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
                    <th>Borrowed</th>
                    <th>Returned</th>
                    <th>Renewals</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((loan) => {
                    const borrowDate = new Date(loan.dateBorrowed);
                    const returnDate = new Date(loan.dateReturned);
                    const days = Math.ceil(
                      (returnDate - borrowDate) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr key={loan.id}>
                        <td>
                          <User size={16} className="me-1 text-primary" />
                          <strong>{loan.memberId}</strong>
                        </td>
                        <td>{loan.fullName}</td>
                        <td>
                          <code className="small">{loan.isbn}</code>
                        </td>
                        <td>
                          <BookOpen size={16} className="me-1 text-success" />
                          {loan.title}
                        </td>
                        <td>{format(borrowDate, "dd MMM yyyy")}</td>
                        <td>{format(returnDate, "dd MMM yyyy HH:mm")}</td>
                        <td>
                          <RefreshCw size={14} className="me-1" />
                          {loan.renews}/2
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {days} day{days !== 1 ? "s" : ""}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-footer text-muted small d-flex justify-content-between">
            <span>
              Total Returned Loans: {enrichedHistory.length}
            </span>
            <span>
              Showing {filteredHistory.length} record{filteredHistory.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}