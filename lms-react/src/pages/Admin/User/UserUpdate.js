// src/pages/Admin/User/UserUpdate.js
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUsers } from "../../../hooks/useUsers";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../../api/userApi";

export default function UserUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useUsers();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.getAllUsers().then(r => r.data),
  });

  const userToEdit = selectedUser || users.find(u => u.id === Number(id));

  const handleSearch = () => {
    const found = users.find(
      u => u.fullName.toLowerCase().includes(search.toLowerCase()) ||
           u.email.toLowerCase().includes(search.toLowerCase())
    );
    setSelectedUser(found || null);
  };

  const handleUpdate = () => {
    if (!userToEdit) return;
    updateUser({ id: userToEdit.id, data: userToEdit }, {
      onSuccess: () => {
        setSelectedUser(null);
        setSearch("");
        navigate("/users/list");
      },
    });
  };

  return (
    <div className="p-4">
      <h2>Update User</h2>

      {!userToEdit && (
        <div className="card p-3" style={{ maxWidth: "500px" }}>
          <input
            className="form-control"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="btn btn-primary mt-2" onClick={handleSearch}>
            Search
          </button>
        </div>
      )}

      {userToEdit && (
        <div className="card p-4 mt-3" style={{ maxWidth: "600px" }}>
          <input
            className="form-control mb-3"
            value={userToEdit.email}
            onChange={(e) => setSelectedUser({ ...userToEdit, email: e.target.value })}
          />
          <input
            className="form-control mb-3"
            value={userToEdit.fullName}
            onChange={(e) => setSelectedUser({ ...userToEdit, fullName: e.target.value })}
          />
          <select
            className="form-select mb-3"
            value={userToEdit.role}
            onChange={(e) => setSelectedUser({ ...userToEdit, role: e.target.value })}
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
          <input
            className="form-control mb-3"
            placeholder="Phone"
            value={userToEdit.phone || ""}
            onChange={(e) => setSelectedUser({ ...userToEdit, phone: e.target.value })}
          />
          <textarea
            className="form-control mb-3"
            value={userToEdit.address || ""}
            onChange={(e) => setSelectedUser({ ...userToEdit, address: e.target.value })}
          />
          <button className="btn btn-success me-2" onClick={handleUpdate}>
            Update
          </button>
          <button className="btn btn-secondary" onClick={() => {
            setSelectedUser(null);
            setSearch("");
          }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}