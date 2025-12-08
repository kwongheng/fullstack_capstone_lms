// src/pages/Login.js
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { memberApi } from "../api/memberApi";
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

      // Fetch member data: status + joinDate
      const response = await memberApi.getMemberByUserId(user.id);
      const member = response.data;

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

      // Calculate expiration date: 1 year from joinDate
      const joinDate = new Date(member.joinDate);
      const expirationDate = new Date(joinDate);
      expirationDate.setFullYear(joinDate.getFullYear() + 1);

      const today = new Date();
      const daysLeft = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

      const isExpired = today > expirationDate;
      const isAlmostExpired = daysLeft <= 60 && daysLeft > 0;

      if (member.status === "Expired" || isExpired || isAlmostExpired) {
        const result = await Swal.fire({
          icon: "warning",
          title: isExpired || member.status === "Expired" 
            ? "Membership Expired" 
            : "Membership Expiring Soon",
          text: isExpired || member.status === "Expired"
            ? "Your membership has expired. Would you like to renew it now?"
            : `Your membership expires in ${daysLeft} day(s). Renew now?`,
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
              text: "Your membership has been renewed for 1 year.",
              timer: 2000,
              showConfirmButton: false,
            });
          } catch (err) {
            await Swal.fire("Error", "Failed to renew membership.", "error");
          }
        }
      }

      navigate("/dashboard");

    } catch {
      // Login failed — error already shown by AuthContext
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