// src/pages/CreateAccount.js
import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { userApi } from "../api/userApi";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";

export default function CreateAccount() {
  const { createUser } = useUsers();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear previous errors when typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Live phone validation
    if (name === "phone") {
      if (value && (value.startsWith("0") || !/^\d+$/.test(value))) {
        setErrors((prev) => ({
          ...prev,
          phone: "Phone must contain only digits and cannot start with 0",
        }));
      } else {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.email?.trim()) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    if (!form.fullName?.trim()) newErrors.fullName = "Full Name is required";

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (form.phone && (form.phone.startsWith("0") || !/^\d+$/.test(form.phone))) {
      newErrors.phone = "Phone must contain only digits and cannot start with 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check email availability
    try {
      const res = await userApi.checkEmailAvailability(form.email.trim());
      if (!res.data.available) {
        setErrors({ email: "Email is already registered" });
        Swal.fire("Error", "Email is already registered", "error");
        return;
      }
    } catch (err) {
      Swal.fire("Error", "Unable to check email availability", "error");
      return;
    }

    // Final payload
    const payload = {
      email: form.email.trim(),
      passwordHash: form.password, // backend will hash it
      fullName: form.fullName.trim(),
      phone: form.phone?.trim() || null,
      address: form.address?.trim() || null,
      role: "Member",
    };

    createUser(payload, {
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: "Account Created!",
          text: "New user created. Please log in to the system.",
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/");
        });
      },
      onError: () => {
        Swal.fire("Error", "Failed to create account", "error");
      },
    });
  };

  return (
    <div className="login-wrapper d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: "500px", width: "100%" }}>
        <h3 className="text-center mb-4">Register New Member</h3>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              value={form.password}
              onChange={handleChange}
              placeholder="Choose a strong password"
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="fullName"
              className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
              value={form.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="text"
              name="phone"
              className={`form-control ${errors.phone ? "is-invalid" : ""}`}
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 81234567"
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>

          {/* Address */}
          <div className="mb-3">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-control"
              rows="3"
              value={form.address}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <button type="submit" className="btn btn-success w-100 mb-3">
            Create Account
          </button>
        </form>

        <p className="text-center text-muted">
          Already have an account? <Link to="/">Log in here</Link>
        </p>
      </div>
    </div>
  );
}