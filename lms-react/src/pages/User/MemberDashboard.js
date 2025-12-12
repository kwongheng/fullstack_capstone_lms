// src/pages/User/MemberDashboard.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  BookOpen, 
  Calendar,  
  AlertCircle,
  CheckCircle2 
} from "lucide-react";

export default function MemberDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-4 p-md-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary mb-3">
          Welcome to Library Management System
        </h1>
        <p className="lead text-muted">
          Hello <strong>{user?.fullName || user?.email}</strong>, we're glad to have you back!
        </p>
      </div>

      <div className="row g-4">
        {/* My Loans Section */}
        <div className="col-12">
          <div className="card border-primary shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <BookOpen className="me-2" size={20} />
                My Loans
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <Link to="/member/borrow-books" className="text-decoration-none fw-bold text-primary">
                    Borrow Books
                  </Link>
                  <p className="mb-0 text-muted small ms-4">
                    Add books to cart and checkout. Due date is 14 days from checkout.
                  </p>
                </li>
                <li className="list-group-item">
                  <Link to="/member/manage-loans" className="text-decoration-none fw-bold text-primary">
                    Manage Status
                  </Link>
                  <p className="mb-0 text-muted small ms-4">
                    View current loans, renew (max 2 times), return books, and pay fines.
                  </p>
                </li>
                <li className="list-group-item">
                  <Link to="/member/loan-history" className="text-decoration-none fw-bold text-primary">
                    View History
                  </Link>
                  <p className="mb-0 text-muted small ms-4">
                    View all past loans (excluding active loans).
                  </p>
                </li>
              </ul>

              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="fw-bold text-danger">
                  <AlertCircle className="me-2" size={18} />
                  Important Loan Rules
                </h6>
                <ul className="small text-muted mb-0">
                  <li>Maximum active loans: <strong>3 books</strong></li>
                  <li>Renew allowed: <strong>maximum 2 times</strong> before due date</li>
                  <li>A book that is reserved by others cannot be borrowed</li>
                  <li>Fine starts 1 day after due date: <strong>$0.50 per day</strong></li>
                  <li>Maximum fine per book: <strong>$20.00</strong></li>
                  <li className="text-danger fw-bold">
                    If total fines ≥ $10.00 → <strong>borrowing is blocked</strong> until paid
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations Section */}
        <div className="col-12">
          <div className="card border-success shadow-sm h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <Calendar className="me-2" size={20} />
                My Reservations
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <Link to="/member/manage-reservations" className="text-decoration-none fw-bold text-success">
                    Manage Reservations
                  </Link>
                  <p className="mb-0 text-muted small ms-4">
                    Reserve books that are currently unavailable (up to 14 days hold).
                  </p>
                </li>
              </ul>

              <div className="mt-3 p-3 bg-light rounded small">
                <p className="mb-1">
                  <CheckCircle2 className="me-2 text-success" size={16} />
                  Reservation automatically cancels after 14 days
                </p>
                <p className="mb-0">
                  You can manually cancel your reservation anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <p className="text-muted">
          Need help? Contact the library staff or visit the help desk.
        </p>
      </div>
    </div>
  );
}