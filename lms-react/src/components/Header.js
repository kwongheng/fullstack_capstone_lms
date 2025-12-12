// Header.js
import { useState, useRef, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpenUserMenu(false);
    logout();
    navigate("/", { replace: true }); // redirect to login
  };

  return (
    <div className="header-bar">
      <div className="app-title">Library Management System</div>

      <div style={{ position: "relative" }}>
        <button className="user-name-btn" onClick={() => setOpenUserMenu(!openUserMenu)}>
          {user?.displayName || user?.email?.split("@")[0] || "User"}
        </button>

        {openUserMenu && (
          <div className="user-menu-dropdown" ref={menuRef}>
            <button
              className="menu-item"
              onClick={() => {
                setOpenUserMenu(false);
                navigate("/profile");
              }}
            >
              Profile
            </button>
            <button className="menu-item" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
