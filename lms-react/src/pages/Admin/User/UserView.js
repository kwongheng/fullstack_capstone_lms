// src/pages/Admin/User/UserView.js
import { useUsers } from "../../../hooks/useUsers";
import { Link } from "react-router-dom";

export default function UserView() {
  const { users, isLoading } = useUsers();

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div className="p-4">
      <h2>All Users</h2>
      <Link to="/users/create" className="btn btn-primary mb-3">+ Add User</Link>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Member ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.fullName}</td>
              <td>{u.role}</td>
              <td>{u.role === "Member" ? `MEM-${String(u.id).padStart(4, "0")}` : "-"}</td>
              <td>
                <Link to={`/users/update/${u.id}`} className="btn btn-sm btn-warning me-2">
                  Edit
                </Link>
                <Link to={`/users/delete/${u.id}`} className="btn btn-sm btn-danger">
                  Delete
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}