// src/pages/Login.js
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { memberApi } from "../api/memberApi";
import { borrowApi } from "../api/borrowApi";
import Swal from "sweetalert2";

export default function Login() {
  const { login, logout } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await login(email, password);

      const user = JSON.parse(localStorage.getItem("lms_user"));
      if (!user?.id) {
        navigate("/dashboard");
        return;
      }

      // Check membership status first
      const response = await memberApi.getMemberByUserId(user.id);
      const member = response.data;

      // 1. Suspended → block completely
      if (member?.status === "Suspended") {
        await Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Your membership is suspended. Please contact the administrator.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          confirmButtonText: "OK",
        });
        logout();
        return;
      }

      // 2. Calculate expiration (1 year from joinDate)
      const joinDate = new Date(member.joinDate);
      const expirationDate = new Date(joinDate);
      expirationDate.setFullYear(joinDate.getFullYear() + 1);
      const today = new Date();
      const daysLeft = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

      const isExpired = today > expirationDate || member.status === "Expired";
      const isAlmostExpired = daysLeft <= 60 && daysLeft > 0 && !isExpired;

      // 3. EXPIRED: MUST renew
      if (isExpired) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Membership Expired",
          text: "Your membership has expired. You must renew to continue.",
          showCancelButton: true,
          confirmButtonText: "Renew Now",
          cancelButtonText: "Cancel",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        if (result.isConfirmed) {
          try {
            await memberApi.renewMembership(user.id);
            await Swal.fire({
              icon: "success",
              title: "Renewed!",
              text: "Your membership has been renewed. Welcome back!",
              timer: 2000,
              showConfirmButton: false,
            });
          } catch {
            await Swal.fire("Error", "Renewal failed. Please try again.", "error");
            logout();
            return;
          }
        } else {
          await Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Your membership has expired. Please renew to continue.",
            confirmButtonText: "OK",
          });
          logout();
          return;
        }
      }

      // 4. ALMOST EXPIRING: optional reminder
      if (isAlmostExpired) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Membership Expiring Soon",
          text: `Your membership expires in ${daysLeft} day(s). Renew now?`,
          showCancelButton: true,
          confirmButtonText: "Yes, Renew",
          cancelButtonText: "No, Later",
        });

        if (result.isConfirmed) {
          try {
            await memberApi.renewMembership(user.id);
            await Swal.fire({
              icon: "success",
              title: "Renewed!",
              text: "Thank you! Your membership is now active for another year.",
              timer: 2000,
              showConfirmButton: false,
            });
          } catch {
            await Swal.fire("Error", "Failed to renew membership.", "error");
          }
        }
      }

      // 5. NEW: Check for overdue books (only if member exists)
      if (member) {
        try {
          const borrowsRes = await borrowApi.getMyActiveBorrows(user.id);
          const activeBorrows = borrowsRes.data || [];

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const overdueBooks = activeBorrows.filter((loan) => {
            const due = new Date(loan.dueDate);
            due.setHours(0, 0, 0, 0);
            return due < today;
          });

          if (overdueBooks.length > 0) {
            await Swal.fire({
              icon: "warning",
              title: "Overdue Books",
              text: `You have ${overdueBooks.length} book(s) overdue. Please return them as soon as possible to avoid fines.`,
              confirmButtonText: "OK",
            });
          }
        } catch (err) {
          // Silently fail if borrow check fails — don't block login
          console.error("Failed to check overdue books:", err);
        }
      }

      // 6. All checks passed → go to dashboard
      navigate("/dashboard");
    } catch {
      // Login failed → error already shown by AuthContext
    }
  };

  return (
    <div className="login-wrapper d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "420px" }}>
        <h3 className="text-center mb-4">Library Management System</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password (any for now)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
        <p className="mt-3 text-center text-muted">
          <Link to="/create-account">Register new account</Link>
        </p>
      </div>
    </div>
  );
}