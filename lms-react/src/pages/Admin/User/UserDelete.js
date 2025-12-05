// src/pages/Admin/User/User/UserDelete.js
import { useParams, useNavigate } from "react-router-dom";
import { useUsers } from "../../../hooks/useUsers";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../../api/userApi";
import Swal from "sweetalert2";

export default function UserDelete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteUser } = useUsers();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => userApi.getUserById(id).then(res => res.data),
  });

  if (isLoading) return <div>Loading...</div>;

  const confirmDelete = () => {
    Swal.fire({
      title: "Delete User?",
      html: `<strong>${user.fullName}</strong><br/>${user.email}<br/>Role: ${user.role}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(id, {
          onSuccess: () => navigate("/users/list"),
        });
      }
    });
  };

  return (
    <div className="p-4">
      <h2>Delete User</h2>
      <div className="card p-4">
        <p>Are you sure you want to delete this user?</p>
        <strong>{user.fullName}</strong> ({user.email})<br/>
        Role: {user.role}
        <div className="mt-3">
          <button className="btn btn-danger me-3" onClick={confirmDelete}>
            Delete
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/users/list")}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}