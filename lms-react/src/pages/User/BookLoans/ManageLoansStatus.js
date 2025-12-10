// src/pages/member/ManageLoansStatus.js
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { useBorrows } from "../../../hooks/useBorrows";
import Swal from "sweetalert2";
import { RefreshCw, DollarSign, Undo2, CheckCircle2 } from "lucide-react";

export default function ManageLoansStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    myActiveBorrows: loans = [],
    isLoadingMyActive: isLoading,
    returnBook,
    renewBook,
    payFine,
    isReturning,
    isRenewing,
    isPayingFine,
  } = useBorrows(user?.id);

  // State to hold completed (returned/paid) loans for display until navigation/refresh
  const [completedLoans, setCompletedLoans] = useState([]);

  const addCompletedLoan = (loan, actionType) => {
    const completed = { ...loan, justAction: actionType };
    setCompletedLoans(prev => [...prev, completed]);
  };

  const handleReturn = async (loan) => {
    addCompletedLoan(loan, "returned");
    await returnBook(loan.id);
  };

  const handlePayFine = async (loan) => {
    addCompletedLoan(loan, "paidAndReturned");
    await payFine(loan.id);
    await returnBook(loan.id); // Same effect as Return
  };

  const payAllMutation = useMutation({
    mutationFn: async () => {
      const loansWithFine = loans.filter(l => (l.fineAmount || 0) > 0);
      for (const loan of loansWithFine) {
        addCompletedLoan(loan, "paidAndReturned");
        await payFine(loan.id);
        await returnBook(loan.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["borrows", "user", user?.id]);
      Swal.fire("Success", "All fines paid and books returned!", "success");
    },
    onError: () => {
      Swal.fire("Error", "Some actions failed.", "error");
    },
  });

  const hasAnyUnpaidFine = loans.some(
    loan => (loan.fineAmount || 0) > 0
  );

  const totalFine = loans
    .filter(l => (l.fineAmount || 0) > 0)
    .reduce((sum, l) => sum + (l.fineAmount || 0), 0);

  // Display list: active loans + completed ones
  const displayLoans = [...loans, ...completedLoans];

  if (isLoading) {
    return <div className="p-4 text-center">Loading your loans...</div>;
  }

  if (displayLoans.length === 0) {
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

  return (
    <div className="p-4">
      <h2 className="mb-4">My Current Loans</h2>

      {hasAnyUnpaidFine && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <strong>Warning:</strong> You have unpaid fines. 
          Please pay all fines before renewing any books. Paying a fine will also return the book.
        </div>
      )}

      <div className="list-group mb-4">
        {displayLoans.map(loan => {
          const due = new Date(loan.dueDate);
          const overdue = due < now;
          const hasFine = (loan.fineAmount || 0) > 0;
          const renewals = loan.timesRenew || 0;
          const action = loan.justAction;

          const canRenew = !hasAnyUnpaidFine && renewals < 2;
          const canReturn = !hasFine;

          return (
            <div
              key={loan.id}
              className={`list-group-item p-4 border-start-4 ${
                action
                  ? "border-success bg-success bg-opacity-10"
                  : overdue
                  ? "border-danger bg-danger bg-opacity-10"
                  : "border-primary"
              }`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="text-primary mb-2">{loan.book.title}</h5>

                  {action ? (
                    <span className="badge bg-success fs-6">
                      <CheckCircle2 size={16} className="me-1" />
                      {action === "paidAndReturned"
                        ? `Fine $${(loan.fineAmount || 0).toFixed(2)} paid & returned`
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

                {!action && (
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => renewBook(loan.id)}
                      disabled={!canRenew || isRenewing}
                      title={!canRenew ? "Pay all fines first to renew" : ""}
                    >
                      <RefreshCw size={16} className="me-1" /> Renew
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleReturn(loan)}
                      disabled={!canReturn || isReturning}
                    >
                      <Undo2 size={16} className="me-1" /> Return
                    </button>

                    {hasFine && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handlePayFine(loan)}
                        disabled={isPayingFine}
                      >
                        <DollarSign size={16} className="me-1" /> Pay Fine & Return
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
              {payAllMutation.isPending ? "Processing..." : "Pay All Fines & Return"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}