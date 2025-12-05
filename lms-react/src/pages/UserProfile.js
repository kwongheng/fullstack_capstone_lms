// src/pages/UserProfile.js
import { useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthContext";
import { userApi } from "../api/userApi";
import Swal from "sweetalert2";

export default function UserProfile() {
  const { user: currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // Fetch fresh user data from backend
  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile", currentUser?.id],
    queryFn: () => userApi.getUserById(currentUser.id).then((res) => res.data),
    enabled: !!currentUser?.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    address: "",
    role: "",
    passwordHash: "",
  });
  const [phoneError, setPhoneError] = useState("");

  // Sync form when user data loads
  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || "",
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "Member",
        passwordHash: user.passwordHash || "",
      });
    }
  }, [user]);

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

  const updateMutation = useMutation({
    mutationFn: (payload) => userApi.updateUser(currentUser.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile", currentUser.id]);
      queryClient.invalidateQueries(["users"]);
      setIsEditing(false);
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Your profile has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire("Error", err.response?.data || "Failed to update profile", "error");
    },
  });

  const handleSave = () => {
    if (!form.fullName.trim()) {
      Swal.fire("Required", "Full Name is required", "warning");
      return;
    }
    if (phoneError) {
      Swal.fire("Invalid Phone", phoneError, "warning");
      return;
    }

    const payload = {
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      role: form.role,
      passwordHash: form.passwordHash,
    };

    updateMutation.mutate(payload);
  };

  const openChangePasswordPopup = () => {
    Swal.fire({
      title: "Change Password",
      html: `
        <input type="password" id="new-password" class="swal2-input" placeholder="New password" autocomplete="new-password">
        <input type="password" id="confirm-password" class="swal2-input" placeholder="Confirm new password" autocomplete="new-password">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Change Password",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const newPass = document.getElementById("new-password").value;
        const confirmPass = document.getElementById("confirm-password").value;

        if (!newPass || !confirmPass) {
          Swal.showValidationMessage("Both fields are required");
          return false;
        }
        if (newPass !== confirmPass) {
          Swal.showValidationMessage("Passwords do not match");
          return false;
        }
        if (newPass.length < 6) {
          Swal.showValidationMessage("Password must be at least 6 characters");
          return false;
        }
        return newPass;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Stub — replace with real API call when ready
        Swal.fire({
          icon: "success",
          title: "Password Changed!",
          text: "Your password has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="p-5 text-center">Unable to load profile.</div>;
  }

  const memberId = user.role === "Member" ? `MEM-${String(user.id).padStart(4, "0")}` : null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                My Profile
              </h3>
              {!isEditing ? (
                <button className="btn btn-light btn-sm" onClick={() => setIsEditing(true)}>
                  <i className="bi bi-pencil"></i> Edit Profile
                </button>
              ) : (
                <div>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Saving..." : "Confirm"}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setIsEditing(false);
                      setPhoneError("");
                      if (user) {
                        setForm({
                          email: user.email || "",
                          fullName: user.fullName || "",
                          phone: user.phone || "",
                          address: user.address || "",
                          role: user.role || "Member",
                          passwordHash: user.passwordHash || "",
                        });
                      }
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="card-body p-5">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Email</label>
                  <input className="form-control" value={form.email} disabled />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Full Name *</label>
                  <input
                    name="fullName"
                    className="form-control"
                    value={form.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Phone</label>
                  <input
                    name="phone"
                    className={`form-control ${phoneError ? "is-invalid" : ""}`}
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. 81234567"
                  />
                  {phoneError && <div className="invalid-feedback">{phoneError}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Role</label>
                  <div className="input-group">
                    <input className="form-control" value={form.role} disabled />
                    <span className="input-group-text">
                      <span className={`badge ${form.role === "Admin" ? "bg-danger" : "bg-primary"}`}>
                        {form.role}
                      </span>
                    </span>
                  </div>
                </div>

                {memberId && (
                  <div className="col-12">
                    <label className="form-label fw-bold">Member ID</label>
                    <input className="form-control" value={memberId} disabled />
                  </div>
                )}

                <div className="col-12">
                  <label className="form-label fw-bold">Address</label>
                  <textarea
                    name="address"
                    className="form-control"
                    rows="4"
                    value={form.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your address..."
                  />
                </div>
              </div>

              <hr className="my-5" />

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-outline-primary px-5"
                  onClick={openChangePasswordPopup}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}