// src/pages/Login.js
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { memberApi } from "../api/memberApi";        // ← only new import
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

      // ← Simple, direct, synchronous-style check (no hooks inside function)
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

      navigate("/dashboard");
    } catch {
      // Login already failed → error shown by AuthContext
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