// src/pages/UserProfile.js
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useUsers } from "../hooks/useUsers";
import Swal from "sweetalert2";

export default function UserProfile() {
  const { user, setUser } = useContext(AuthContext);
  const { updateUser } = useUsers();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [form, setForm] = useState({
    email: user?.email || "",
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    role: user?.role || "Member",
    passwordHash: user?.passwordHash || "", 
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    const payload = {
      email: user.email,
      fullName: form.fullName.trim(),
      phone: form.phone?.trim() || null,
      address: form.address?.trim() || null,
      role: user.role,
      passwordHash: user.passwordHash, 
    };

    updateUser(
      { id: user.id, data: payload },
      {
        onSuccess: () => {
          const updatedUser = {
            ...user,
            fullName: form.fullName.trim(),
            phone: form.phone?.trim() || "",
            address: form.address?.trim() || "",
          };
          setUser(updatedUser);
          localStorage.setItem("lms_user", JSON.stringify(updatedUser));
          Swal.fire("Success", "Profile updated successfully", "success");
          setIsEditing(false);
        },
        onError: () => {
          Swal.fire("Error", "Failed to update profile", "error");
        },
      }
    );
  };

  const handlePasswordReset = () => {
    if (!newPassword) {
      Swal.fire("Error", "Please enter a new password", "error");
      return;
    }
    Swal.fire("Success", "Password reset successful", "success");
    setNewPassword("");
    setShowPasswordReset(false);
  };

  if (!user) return null;

  const memberId = user.role === "Member" ? `MEM-${String(user.id).padStart(4, "0")}` : null;

  return (
    <div className="p-4">
      <div className="card shadow-sm" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">My Profile</h4>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <label>Email</label>
              <input type="email" className="form-control" value={form.email} disabled />
            </div>
            <div className="col-12">
              <label>Full Name</label>
              <input
                name="fullName"
                className="form-control"
                value={form.fullName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="col-12">
              <label>Phone</label>
              <input
                name="phone"
                className="form-control"
                value={form.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="col-12">
              <label>Address</label>
              <textarea
                name="address"
                className="form-control"
                rows="3"
                value={form.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="col-6">
              <label>Role</label>
              <input type="text" className="form-control" value={form.role} disabled />
            </div>
            {memberId && (
              <div className="col-6">
                <label>Member ID</label>
                <input type="text" className="form-control" value={memberId} disabled />
              </div>
            )}
          </div>

          <div className="mt-4 d-flex gap-2">
            {!isEditing ? (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                Update Profile
              </button>
            ) : (
              <>
                <button className="btn btn-success" onClick={handleUpdate}>
                  Confirm
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setForm({
                      email: user.email,
                      fullName: user.fullName,
                      phone: user.phone,
                      address: user.address,
                      role: user.role,
                      passwordHash: user.passwordHash,
                    });
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          <div className="mt-4 text-center">
            <button className="btn btn-link" onClick={() => setShowPasswordReset(true)}>
              Reset Password
            </button>
          </div>
        </div>
      </div>

      {showPasswordReset && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Reset Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPasswordReset(false)}
                />
              </div>
              <div className="modal-body">
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPasswordReset(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handlePasswordReset}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}