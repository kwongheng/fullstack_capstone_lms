// UserMenu.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserMenu() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const logout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <div className="user-menu shadow-sm">
      <div className="menu-item" onClick={() => navigate("/profile")}>Profile</div>
      <div className="menu-item" onClick={logout}>Logout</div>
    </div>
  );
}