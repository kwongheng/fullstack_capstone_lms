// src/pages/Admin/Super/EditUsers.js
import React, { useState, useMemo } from "react";
import { useUsers } from "../../../hooks/useUsers";
import { useMembers } from "../../../hooks/useMembers";
import { format, parseISO, isAfter, startOfDay } from "date-fns";
import Swal from "sweetalert2";
import { User, Calendar, Search, Edit3 } from "lucide-react";

export default function EditUsers() {
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { members = [], isLoading: isLoadingMembers, updateJoinDate, isUpdatingJoinDate } = useMembers();

  const [searchField, setSearchField] = useState("email");
  const [searchValue, setSearchValue] = useState("");
  const [queryValue, setQueryValue] = useState("");

  // Combine user + member data
  const usersWithMembership = useMemo(() => {
    return users
      .filter((u) => u.role === "Member")
      .map((user) => {
        const member = members.find((m) => m.user.id === user.id);
        return {
          ...user,
          memberId: member?.memberId || `MEM-${String(user.id).padStart(4, "0")}`,
          joinDate: member?.joinDate || null,
          status: member?.status || "Unknown",
        };
      });
  }, [users, members]);

  // Filtering
  const filteredUsers = useMemo(() => {
    if (!queryValue.trim()) return usersWithMembership;

    const term = queryValue.toLowerCase().trim();
    return usersWithMembership.filter((user) => {
      switch (searchField) {
        case "email":
          return user.email.toLowerCase().includes(term);
        case "fullName":
          return (user.fullName || "").toLowerCase().includes(term);
        case "memberId":
          return user.memberId.toLowerCase().includes(term);
        default:
          return true;
      }
    });
  }, [usersWithMembership, queryValue, searchField]);

  const handleEditJoinDate = async (user) => {
    const currentJoinDate = user.joinDate ? parseISO(user.joinDate) : new Date();
    const today = startOfDay(new Date());

    const { value: selectedDate } = await Swal.fire({
      title: `Edit Join Date — ${user.fullName || user.email}`,
      html: `
        <div class="text-start mb-3">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Member ID:</strong> ${user.memberId}</p>
          <p><strong>Current Join Date:</strong> ${
            user.joinDate ? format(currentJoinDate, "dd MMM yyyy") : "Not set"
          }</p>
        </div>
        <label class="form-label">New Join Date (cannot be in the future)</label>
      `,
      input: "date",
      inputValue: user.joinDate ? format(currentJoinDate, "yyyy-MM-dd") : format(today, "yyyy-MM-dd"),
      showCancelButton: true,
      confirmButtonText: "Update Join Date",
      preConfirm: () => {
        const val = document.querySelector('input[type="date"]').value;
        if (!val) {
          Swal.showValidationMessage("Please select a date");
          return false;
        }
        if (isAfter(new Date(val), today)) {
          Swal.showValidationMessage("Join date cannot be in the future");
          return false;
        }
        return val;
      },
    });

    if (!selectedDate) return;

    updateJoinDate({
      userId: user.id,
      dateString: selectedDate,
    });
  };

  if (isLoadingUsers || isLoadingMembers) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 d-flex align-items-center">
        <User className="me-3" size={28} />
        Edit Member Join Dates (Super User)
      </h2>

      {/* Search Panel */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-bold">
                <Search size={16} className="me-1" />
                Search By
              </label>
              <select
                className="form-select"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="email">Email</option>
                <option value="fullName">Full Name</option>
                <option value="memberId">Member ID</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Search Term</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search members..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={() => setQueryValue(searchValue)}>
                  Search
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearchValue("");
                    setQueryValue("");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h4>No members found</h4>
          {queryValue && <p>Try adjusting your search.</p>}
        </div>
      ) : (
        <div className="row g-4">
          {filteredUsers.map((user) => {
            const joinDate = user.joinDate ? parseISO(user.joinDate) : null;

            return (
              <div key={user.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm hover-shadow">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title text-primary mb-1">
                          {user.fullName || "No Name"}
                        </h5>
                        <p className="text-muted small mb-1">
                          <strong>Email:</strong> {user.email}
                        </p>
                        <p className="text-muted small mb-2">
                          <strong>Member ID:</strong> {user.memberId}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          user.status === "Active"
                            ? "bg-success"
                            : user.status === "Suspended"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-top">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <strong>Join Date:</strong>
                          <div className="mt-1">
                            <Calendar size={16} className="text-muted me-1" />
                            {joinDate ? format(joinDate, "dd MMM yyyy") : "Not set"}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleEditJoinDate(user)}
                          disabled={isUpdatingJoinDate}
                          title="Edit join date (past dates only)"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}