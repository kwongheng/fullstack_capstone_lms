// src/components/Sidebar.js
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState({
    loans: true, // open by default for better UX
    reservations: false,
  });

  // Close all menus when user changes (login/logout)
  useEffect(() => {
    setOpenMenu({ loans: true, reservations: false });
  }, [user]);

  const toggle = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Better active detection for nested routes
  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  const isAdmin = user?.role?.toLowerCase() === "admin";

  // ====================== MEMBER (REGULAR USER) MENU ======================
  if (!isAdmin) {
    return (
      <div className="sidebar">
        {/* My Book Loans */}
        <div className="sidebar-title" onClick={() => toggle("loans")}>
          <span>My Book Loans</span>
          <span className={`arrow ${openMenu.loans ? "down" : ""}`} />
        </div>
        <div className={`submenu ${openMenu.loans ? "open" : ""}`}>
          <Link to="/member/loans/borrow" className={isActive("/member/loans/borrow") ? "active" : ""}>
            Borrow Books
          </Link>
          <Link to="/member/loans/status" className={isActive("/member/loans/status") ? "active" : ""}>
            Manage Status
          </Link>
          <Link to="/member/loans/history" className={isActive("/member/loans/history") ? "active" : ""}>
            View History
          </Link>
        </div>

        {/* My Reservations */}
        <div className="sidebar-title" onClick={() => toggle("reservations")}>
          <span>My Reservations</span>
          <span className={`arrow ${openMenu.reservations ? "down" : ""}`} />
        </div>
        <div className={`submenu ${openMenu.reservations ? "open" : ""}`}>
          <Link to="/member/reservations/make" className={isActive("/member/reservations/make") ? "active" : ""}>
            Make Reservations
          </Link>
          <Link to="/member/reservations/manage" className={isActive("/member/reservations/manage") ? "active" : ""}>
            Manage Reservations
          </Link>
        </div>
      </div>
    );
  }

  // ====================== ADMIN MENU (unchanged – you can keep or simplify later) ======================
  return (
    <div className="sidebar">
      {/* Keep your existing full admin menu here if you still need it */}
      <div className="sidebar-title">
        <span>Admin Dashboard</span>
      </div>
      <div className="submenu open">
        <Link to="/admin/users/manage">Manage Users</Link>
        <Link to="/admin/books/manage">Manage Books</Link>
        <Link to="/admin/loans/current">Active Loans</Link>
        <Link to="/admin/loans/history">Loan History</Link>
        <Link to="/admin/reservations/list">All Reservations</Link>
      </div>
    </div>
  );
}
