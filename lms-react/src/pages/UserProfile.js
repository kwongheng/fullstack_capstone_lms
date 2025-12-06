// src/pages/UserProfile.js
import { useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthContext";
import { userApi } from "../api/userApi";
import { useMembers } from "../hooks/useMembers";
import { format, addYears, parseISO } from "date-fns";
import Swal from "sweetalert2";

export default function UserProfile() {
  const { user: currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // Load user profile
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["userProfile", currentUser?.id],
    queryFn: () => userApi.getUserById(currentUser.id).then(res => res.data),
    enabled: !!currentUser?.id,
  });

  // Load member data from /api/members/{id}
  const { useMember } = useMembers();
  const memberQuery = useMember(currentUser?.id);
  const member = memberQuery.data;
  const isLoadingMember = memberQuery.isLoading;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "" });
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "phone") {
      setPhoneError(
        value && (value.startsWith("0") || !/^\d+$/.test(value))
          ? "Invalid phone"
          : ""
      );
    }
  };

  const updateMutation = useMutation({
    mutationFn: payload => userApi.updateUser(currentUser.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile", currentUser.id]);
      setIsEditing(false);
      Swal.fire("Success", "Profile updated", "success");
    },
  });

  const handleSave = () => {
    if (!form.fullName.trim()) return Swal.fire("Error", "Full Name required", "warning");
    if (phoneError) return Swal.fire("Invalid", phoneError, "warning");
    updateMutation.mutate({
      fullName: form.fullName.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    });
  };

  if (loadingUser || isLoadingMember) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  if (!user) return <div className="p-5 text-center">Profile not found</div>;

  const memberId = user.role === "Member" ? `MEM-${String(user.id).padStart(4, "0")}` : null;

  // DEBUG: Remove this in production
  console.log("Member data from /api/members/12:", member);

  const joinDateRaw = member?.joinDate;
  const joinDate = joinDateRaw ? parseISO(joinDateRaw) : null;
  const expiryDate = joinDate ? addYears(joinDate, 1) : null;
  const status = member?.status || "Active";
  const statusColor = status === "Active" ? "bg-success" : status === "Suspended" ? "bg-danger" : "bg-secondary";

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-xl-6 col-lg-7 col-md-8">
          <div className="card shadow-sm border-0">

            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 fw-bold">My Profile</h5>
              {!isEditing ? (
                <button className="btn btn-light btn-sm" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              ) : (
                <div>
                  <button className="btn btn-success btn-sm me-2" onClick={handleSave}>
                    Save
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setIsEditing(false);
                      setPhoneError("");
                      setForm({
                        fullName: user.fullName || "",
                        phone: user.phone || "",
                        address: user.address || "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="card-body p-0">

              {/* Membership Row */}
              {user.role === "Member" && (
                <div className="border-bottom px-4 py-3 bg-light">
                  <div className="row small text-muted g-3">
                    <div className="col">Member ID</div>
                    <div className="col">Date Joined</div>
                    <div className="col">Expires On</div>
                    <div className="col">Status</div>
                  </div>
                  <div className="row fw-bold small g-3">
                    <div className="col text-primary">{memberId}</div>
                    <div className="col text-success">
                      {joinDate ? format(joinDate, "dd MMM yyyy") : "—"}
                    </div>
                    <div className="col text-warning">
                      {expiryDate ? format(expiryDate, "dd MMM yyyy") : "—"}
                    </div>
                    <div className="col">
                      <span className={`badge ${statusColor} px-2 py-1`}>
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4">
                <table className="table table-borderless table-sm mb-0 small">
                  <tbody>
                    <tr>
                      <td className="text-muted pe-3" style={{ width: "120px" }}>Full Name *</td>
                      <td>
                        <input name="fullName" className="form-control form-control-sm" value={form.fullName} onChange={handleChange} disabled={!isEditing} />
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Email</td>
                      <td><span className="text-dark">{user.email}</span></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Phone</td>
                      <td>
                        <input name="phone" className={`form-control form-control-sm ${phoneError ? "is-invalid" : ""}`} value={form.phone} onChange={handleChange} disabled={!isEditing} />
                        {phoneError && <div className="text-danger small mt-1">{phoneError}</div>}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted align-top">Address</td>
                      <td>
                        <textarea name="address" className="form-control form-control-sm" rows={2} value={form.address} onChange={handleChange} disabled={!isEditing} />
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Account Type</td>
                      <td>
                        <span className={`badge ${user.role === "Admin" ? "bg-danger" : "bg-primary"} px-3 py-1`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <hr className="my-4" />
                <div className="text-center">
                  <button className="btn btn-outline-primary btn-sm px-5" onClick={() => {
                    Swal.fire("Info", "Password change not implemented", "info");
                  }}>
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}