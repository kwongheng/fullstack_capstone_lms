// src/pages/Admin/User/UserAdd.js
import { useState } from "react";
import { useUsers } from "../../../hooks/useUsers";
import Swal from "sweetalert2";

export default function UserAdd() {
  const { createUser, isCreating } = useUsers();
  const [form, setForm] = useState({
    email: "",
    passwordHash: crypto.randomUUID().replace(/-/g, "").slice(0, 25),
    fullName: "",
    phone: "",
    address: "",
    role: "Member",
  });

  const handleSubmit = () => {
    if (!form.email || !form.fullName) {
      Swal.fire("Error", "Email and Full Name are required", "error");
      return;
    }
    if (form.phone && (isNaN(form.phone) || form.phone.startsWith("0"))) {
      Swal.fire("Error", "Phone must be digits and not start with 0", "error");
      return;
    }

    createUser(form, {
      onSuccess: () => {
        setForm({
          email: "",
          passwordHash: crypto.randomUUID().replace(/-/g, "").slice(0, 25),
          fullName: "",
          phone: "",
          address: "",
          role: "Member",
        });
      },
    });
  };

  return (
    <div className="p-4">
      <h2>Add New User</h2>
      <div className="card p-4 mt-3" style={{ maxWidth: "600px" }}>
        <input
          className="form-control mb-3"
          placeholder="Email *"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="form-control mb-3"
          placeholder="Full Name *"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <input
          className="form-control mb-3"
          value={form.passwordHash}
          readOnly
          style={{ background: "#f0f0f0" }}
        />
        <select
          className="form-select mb-3"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="Member">Member</option>
          <option value="Admin">Admin</option>
        </select>
        <input
          className="form-control mb-3"
          placeholder="Phone (digits only, no leading 0)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <textarea
          className="form-control mb-3"
          placeholder="Address (optional)"
          rows="3"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <button
          className="btn btn-success"
          onClick={handleSubmit}
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create User"}
        </button>
      </div>
    </div>
  );
}