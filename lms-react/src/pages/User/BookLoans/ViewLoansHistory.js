// src/pages/User/BookLoans/ViewLoansHistory.js
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { borrowApi } from "../../../api/borrowApi";
import { format } from "date-fns";
import { History, BookOpen, DollarSign, CheckCircle2 } from "lucide-react";

export default function ViewLoansHistory() {
  const { user } = useAuth();

  const { data: allBorrows = [], isLoading } = useQuery({
    queryKey: ["borrows", "user", user?.id, "all"],
    queryFn: () => borrowApi.getMyBorrowSummary(user.id).then(res => res.data),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  // Filter returned loans (isReturned === true OR isReturned === null)
  const history = allBorrows.filter(borrow => borrow.isReturned === true || borrow.isReturned === null);

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;
  if (history.length === 0) {
    return (
      <div className="p-4 text-center py-5">
        <h3>No Loan History</h3>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 d-flex align-items-center">
        <History className="me-2" /> My Loan History
      </h2>
      <div className="list-group">
        {history.map(loan => (
          <div key={loan.id} className="list-group-item p-4 border-start-4 border-success bg-success bg-opacity-10">
            <div className="d-flex justify-content-between">
              <div>
                <h5 className="text-primary">
                  <BookOpen className="me-2" /> {loan.bookTitle}
                </h5>
                <small className="text-muted">
                  Borrowed: {format(new Date(loan.borrowDate || loan.dueDate), "dd MMM yyyy")} | 
                  Due: {format(new Date(loan.dueDate), "dd MMM yyyy")}
                  {loan.returnDate && ` | Returned: ${format(new Date(loan.returnDate), "dd MMM yyyy HH:mm")}`}
                </small>
                {loan.fineAmount > 0 && (
                  <div className="mt-2 text-danger">
                    <DollarSign size={16} /> Fine Paid: ${loan.fineAmount.toFixed(2)}
                  </div>
                )}
              </div>
              <span className="badge bg-success">Returned</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}