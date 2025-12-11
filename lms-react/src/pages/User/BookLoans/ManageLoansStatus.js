// src/pages/member/ManageLoansStatus.js
import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { borrowApi } from "../../../api/borrowApi";
import Swal from "sweetalert2";
import { RefreshCw, DollarSign, Undo2, CheckCircle2 } from "lucide-react";

export default function ManageLoansStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load active loans + recalculate fines — only once per visit
  useEffect(() => {
    const loadAndCalculate = async () => {
      if (!user?.id) return;

      try {
        const res = await borrowApi.getMyActiveBorrows(user.id);
        let activeLoans = res.data;

        // Recalculate fines
        for (const loan of activeLoans) {
          await borrowApi.calculateFine(loan.id).catch(() => {});
        }

        // Fetch updated data with fresh fines
        const updatedRes = await borrowApi.getMyActiveBorrows(user.id);
        const loansWithFines = updatedRes.data;

        setLoans(
          loansWithFines.map(loan => ({
            ...loan,
            justReturned: false,
            justPaid: false,
            paidAmount: 0,
          }))
        );
      } catch (err) {
        console.error("Failed to load loans:", err);
        Swal.fire("Error", "Could not load your loans", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadAndCalculate();
  }, [user?.id]);

  // Local state updates
  const markReturned = (id) => {
    setLoans(prev =>
      prev.map(l => (l.id === id ? { ...l, justReturned: true, justPaid: false } : l))
    );
  };

  const markPaid = (id, amount) => {
    setLoans(prev =>
      prev.map(l =>
        l.id === id ? { ...l, justReturned: true, justPaid: true, paidAmount: amount } : l
      )
    );
  };

  // Mutations — fixed to accept borrowId correctly
  const returnMutation = useMutation({
    mutationFn: (borrowId) => borrowApi.returnBook(borrowId),
    onSuccess: (_, borrowId) => {
      markReturned(borrowId);
      queryClient.invalidateQueries(["borrows", "user", user.id]);
      Swal.fire("Returned!", "Book returned successfully", "success");
    },
    onError: (err) => {
      Swal.fire("Error", err.response?.data || "Failed to return book", "error");
    },
  });

  const renewMutation = useMutation({
    mutationFn: (borrowId) => borrowApi.renewBook(borrowId),
    onSuccess: () => {
      queryClient.invalidateQueries(["borrows", "user", user.id]);
      Swal.fire("Renewed!", "Loan extended by 14 days", "success");
    },
    onError: (err) => {
      Swal.fire("Cannot Renew", err.response?.data || "Check conditions", "warning");
    },
  });

  const payFineMutation = useMutation({
    mutationFn: (borrowId) => borrowApi.payFine(borrowId),
    onSuccess: (_, borrowId) => {
      const loan = loans.find(l => l.id === borrowId);
      const fine = loan?.fineAmount || 0;
      markPaid(borrowId, fine);
      queryClient.invalidateQueries(["borrows", "user", user.id]);
      Swal.fire("Paid!", `Fine $${fine.toFixed(2)} cleared`, "success");
    },
    onError: (err) => {
      Swal.fire("Error", err.response?.data || "Payment failed", "error");
    },
  });

  const payAllMutation = useMutation({
    mutationFn: () =>
      Promise.all(
        loans
          .filter(l => (l.fineAmount || 0) > 0 && !l.justReturned)
          .map(l => borrowApi.payFine(l.id))
      ),
    onSuccess: () => {
      loans
        .filter(l => (l.fineAmount || 0) > 0 && !l.justReturned)
        .forEach(l => markPaid(l.id, l.fineAmount || 0));
      queryClient.invalidateQueries(["borrows", "user", user.id]);
      Swal.fire("All Paid!", "All fines cleared", "success");
    },
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading your loans...</div>;
  }

  if (loans.length === 0) {
    return (
      <div className="p-4">
        <h2 className="mb-4">My Current Loans</h2>
        <div className="text-center py-5 text-muted">
          <h4>No active loans</h4>
          <p>You have no books on loan right now.</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const totalFine = loans
    .filter(l => !l.justReturned && (l.fineAmount || 0) > 0)
    .reduce((sum, l) => sum + (l.fineAmount || 0), 0);

  return (
    <div className="p-4">
      <h2 className="mb-4">My Current Loans</h2>

      <div className="list-group mb-4">
        {loans.map(loan => {
          const due = new Date(loan.dueDate);
          const overdue = due < now;
          const hasFine = (loan.fineAmount || 0) > 0;
          const renewals = loan.timesRenew || 0;
          const canRenew = renewals < 2 && !hasFine && !loan.justReturned;
          const canReturn = !hasFine && !loan.justReturned;

          return (
            <div
              key={loan.id}
              className={`list-group-item p-4 border-start-4 ${
                loan.justReturned
                  ? "border-success bg-success bg-opacity-10"
                  : overdue
                  ? "border-danger bg-danger bg-opacity-10"
                  : "border-primary"
              }`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="text-primary mb-2">{loan.book.title}</h5>

                  {loan.justReturned ? (
                    <span className="badge bg-success fs-6">
                      <CheckCircle2 size={16} className="me-1" />
                      {loan.justPaid
                        ? `Fine $${loan.paidAmount.toFixed(2)} paid & returned just now`
                        : "Returned just now"}
                    </span>
                  ) : (
                    <div className="small text-muted">
                      <strong>ID:</strong> {loan.id} |{" "}
                      <strong>Due:</strong>{" "}
                      <span className={overdue ? "text-danger fw-bold" : ""}>
                        {due.toLocaleDateString()}
                      </span>{" "}
                      | <strong>Renewals:</strong> {renewals}/2 |{" "}
                      <strong>Fine:</strong>{" "}
                      <span className={hasFine ? "text-danger fw-bold" : "text-success"}>
                        ${Number(loan.fineAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {!loan.justReturned && (
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => renewMutation.mutate(loan.id)}
                      disabled={!canRenew || renewMutation.isPending}
                    >
                      <RefreshCw size={16} className="me-1" /> Renew
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => returnMutation.mutate(loan.id)}
                      disabled={!canReturn || returnMutation.isPending}
                    >
                      <Undo2 size={16} className="me-1" /> Return
                    </button>
                    {hasFine && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => payFineMutation.mutate(loan.id)}
                        disabled={payFineMutation.isPending}
                      >
                        <DollarSign size={16} className="me-1" /> Pay Fine
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalFine > 0 && (
        <div className="card border-danger shadow">
          <div className="card-body text-center bg-danger bg-opacity-10">
            <h4 className="text-danger mb-3">
              Total Outstanding Fine: <strong>${totalFine.toFixed(2)}</strong>
            </h4>
            <button
              className="btn btn-danger btn-lg"
              onClick={() => payAllMutation.mutate()}
              disabled={payAllMutation.isPending}
            >
              <DollarSign size={20} className="me-2" />
              {payAllMutation.isPending ? "Processing..." : "Pay All Fines"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}