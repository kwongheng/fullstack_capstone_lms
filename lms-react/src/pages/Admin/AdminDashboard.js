// src/pages/Admin/AdminDashboard.js
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Shield, CheckCircle2 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-4 p-md-5 min-vh-100">
      <div className="text-center mb-5">
        <div className="d-flex justify-content-center align-items-center mb-4">
          <Shield size={64} className="text-primary me-3" />
          <h1 className="display-4 fw-bold text-primary">
            Admin Dashboard
          </h1>
        </div>
        <h2 className="display-6 text-dark">
          Welcome to Library Management System
        </h2>
        <p className="lead text-muted mt-3">
          Hello <strong className="text-primary">{user?.fullName || user?.email}</strong>,<br />
          You are logged in as <span className="badge bg-danger fs-6">ADMINISTRATOR</span>
        </p>
      </div>

      <div className="row g-4 justify-content-center mt-4">
        <div className="col-md-8">
          <div className="card shadow-lg border-0">
            <div className="card-body text-center py-5">
              <h4 className="text-success">
                <CheckCircle2 size={48} className="mb-3" />
                <br />
                System Status: <strong>ONLINE</strong>
              </h4>
              <p className="text-muted">
                All features are available. Use the sidebar to manage users, books, loans, and reservations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <p className="text-muted small">
          Library Management System © 2025 • Admin Portal
        </p>
      </div>
    </div>
  );
}