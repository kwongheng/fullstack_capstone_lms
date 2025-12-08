// src/pages/Admin/User/ManageUsers.js
import { useState } from "react";
import { useUsers } from "../../../hooks/useUsers";
import { useMembers } from "../../../hooks/useMembers";
import { userApi } from "../../../api/userApi";
import { format, addYears, parseISO } from "date-fns";
import Swal from "sweetalert2";

export default function ManageUsers() {
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers();
  const { members = [], updateMemberStatus } = useMembers();

  const [modal, setModal] = useState({ open: false, mode: "", user: null });

  const openModal = (mode, user = null) => setModal({ open: true, mode, user });
  const closeModal = () => setModal({ open: false, mode: "", user: null });

  const handleSubmit = async (formData) => {
    const payload = {
      email: formData.email?.trim(),
      fullName: formData.fullName?.trim(),
      phone: formData.phone?.trim() || null,
      address: formData.address?.trim() || null,
      role: formData.role,
      passwordHash: formData.passwordHash,
      ...(formData.status && formData.role === "Member" && { status: formData.status }),
    };

    if (modal.mode === "add") {
      try {
        const res = await userApi.checkEmailAvailability(payload.email, null);
        if (!res.data.available) {
          Swal.fire("Error", "Email is already registered", "error");
          return;
        }
      } catch (err) {
        console.warn("Email check failed");
      }
      createUser(payload);
    } else if (modal.mode === "edit") {
      updateUser({ id: modal.user.id, data: payload });

      // NEW: Update member status if changed
      if (formData.role === "Member" && formData.status) {
        const currentMember = members.find((m) => m.userId === modal.user.id);
        if (currentMember && formData.status !== currentMember.status) {
          updateMemberStatus({ userId: modal.user.id, status: formData.status });
        }
      }
    }

    closeModal();
  };

  const handleDelete = () => {
    deleteUser(modal.user.id);
    closeModal();
  };

  if (isLoading) return <div className="p-4">Loading users...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Users</h2>
        <button className="btn btn-success" onClick={() => openModal("add")}>
          + Add User
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Member ID</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const member = members.find((m) => m.userId === u.id);
              const status = u.role === "Member" ? (member?.status || "Active") : "—";
              const badgeColor =
                status === "Active"
                  ? "bg-success"
                  : status === "Suspended"
                  ? "bg-danger"
                  : "bg-warning text-dark";

              return (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.fullName || "—"}</td>
                  <td>
                    <span className={`badge ${u.role === "Admin" ? "bg-danger" : "bg-primary"}`}>{u.role}</span>
                  </td>
                  <td>{u.role === "Member" ? `MEM-${String(u.id).padStart(4, "0")}` : "—"}</td>
                  <td>
                    {u.role === "Member" ? (
                      <span className={`badge ${badgeColor} px-2 py-1`}>{status}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="text-center">
                    <button className="btn btn-info btn-sm me-2" onClick={() => openModal("view", u)}>View</button>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => openModal("edit", u)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => openModal("delete", u)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modal.mode === "add" && "Add New User"}
                  {modal.mode === "edit" && "Edit User"}
                  {modal.mode === "view" && "User Details"}
                  {modal.mode === "delete" && "Delete User"}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal} />
              </div>

              <div className="modal-body">
                {(modal.mode === "add" || modal.mode === "edit") && (
                  <UserForm
                    user={modal.user}
                    member={members.find((m) => m.userId === modal.user?.id)}
                    isAdd={modal.mode === "add"}
                    onSubmit={handleSubmit}
                    onCancel={closeModal}
                  />
                )}

                {modal.mode === "view" && modal.user && (() => {
                  const member = members.find((m) => m.userId === modal.user.id);
                  const joinDate = member?.joinDate ? parseISO(member.joinDate) : null;
                  const expiryDate = joinDate ? addYears(joinDate, 1) : null;
                  const status = member?.status || "Active";

                  return (
                    <div className="row g-3">
                      <div className="col-6"><strong>Email:</strong> {modal.user.email}</div>
                      <div className="col-6"><strong>Name:</strong> {modal.user.fullName || "—"}</div>
                      <div className="col-6">
                        <strong>Role:</strong>
                        <span className={`badge ${modal.user.role === "Admin" ? "bg-danger" : "bg-primary"}`}>
                          {modal.user.role}
                        </span>
                      </div>
                      <div className="col-6"><strong>Phone:</strong> {modal.user.phone || "—"}</div>
                      <div className="col-12"><strong>Address:</strong> {modal.user.address || "—"}</div>

                      {modal.user.role === "Member" && (
                        <>
                          <div className="col-12"><strong>Member ID:</strong> MEM-{String(modal.user.id).padStart(4, "0")}</div>
                          <div className="col-6"><strong>Join Date:</strong> {joinDate ? format(joinDate, "dd MMM yyyy") : "—"}</div>
                          <div className="col-6"><strong>Expires On:</strong> {expiryDate ? format(expiryDate, "dd MMM yyyy") : "—"}</div>
                          <div className="col-12">
                            <strong>Status:</strong>
                            <span className={`badge ${status === "Active" ? "bg-success" : status === "Suspended" ? "bg-danger" : "bg-warning text-dark"} px-3 py-2`}>
                              {status}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

                {modal.mode === "delete" && modal.user && (
                  <div className="alert alert-danger">
                    <p className="mb-0">
                      Permanently delete <strong>{modal.user.fullName}</strong> ({modal.user.email})?
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  {modal.mode === "delete" ? "Cancel" : "Close"}
                </button>
                {modal.mode === "delete" && (
                  <button type="button" className="btn btn-danger" onClick={handleDelete}>
                    Delete User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// UserForm — unchanged
function UserForm({ user, member, isAdd, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    email: user?.email || "",
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    role: user?.role || "Member",
    status: member?.status || "Active",
    passwordHash: isAdd ? crypto.randomUUID().replace(/-/g, "").slice(0, 25) : user?.passwordHash || "",
  });

  const [phoneError, setPhoneError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "phone") {
      if (value && (value.startsWith("0") || !/^\d+$/.test(value))) {
        setPhoneError("Phone must contain only digits and cannot start with 0");
      } else {
        setPhoneError("");
      }
    }
  };

  const handleSubmitForm = () => {
    if (!form.email || !form.fullName) {
      Swal.fire("Error", "Email and Full Name are required", "error");
      return;
    }
    if (phoneError) {
      Swal.fire("Error", phoneError, "error");
      return;
    }
    onSubmit(form);
  };

  const joinDate = member?.joinDate ? parseISO(member.joinDate) : null;

  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Email {isAdd && "*"}</label>
        <input name="email" className="form-control" value={form.email} onChange={handleChange} disabled={!isAdd} />
      </div>

      <div className="mb-3">
        <label className="form-label">Full Name *</label>
        <input name="fullName" className="form-control" value={form.fullName} onChange={handleChange} />
      </div>

      <div className="mb-3">
        <label className="form-label">Phone</label>
        <input
          name="phone"
          className={`form-control ${phoneError ? "is-invalid" : ""}`}
          value={form.phone}
          onChange={handleChange}
          placeholder="e.g. 81234567"
        />
        {phoneError && <div className="invalid-feedback">{phoneError}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Address</label>
        <textarea name="address" className="form-control" rows={3} value={form.address} onChange={handleChange} />
      </div>

      <div className="mb-3">
        <label className="form-label">Role</label>
        <select name="role" className="form-select" value={form.role} onChange={handleChange} disabled={!isAdd}>
          <option value="Member">Member</option>
          <option value="Admin">Admin</option>
        </select>
        {!isAdd && <small className="text-muted">Role can only be set during creation</small>}
      </div>

      {/* Join Date — read-only */}
      {!isAdd && form.role === "Member" && (
        <div className="mb-3">
          <label className="form-label">Join Date</label>
          <input
            className="form-control"
            value={joinDate ? format(joinDate, "dd MMM yyyy") : "—"}
            readOnly
            style={{ backgroundColor: "#f8f9fa" }}
          />
        </div>
      )}

      {/* Status — editable */}
      {!isAdd && form.role === "Member" && (
        <div className="mb-3">
          <label className="form-label">Membership Status</label>
          <select name="status" className="form-select" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      )}

      {isAdd && (
        <div className="mb-3">
          <label className="form-label">Temporary Password (auto-generated)</label>
          <input
            className="form-control"
            value={form.passwordHash}
            readOnly
            style={{ backgroundColor: "#f8f9fa" }}
          />
          <small className="text-muted">User must change this on first login</small>
        </div>
      )}

      <div className="d-flex gap-2 mt-4">
        <button type="button" className="btn btn-primary" onClick={handleSubmitForm}>
          {isAdd ? "Create User" : "Update User"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}