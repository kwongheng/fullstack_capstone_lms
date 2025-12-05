// src/components/Sidebar.js
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState({
    users: false,
    books: false,
    loans: false,
    reservations: false,
  });

  useEffect(() => {
    setOpenMenu({ users: false, books: false, loans: false, reservations: false });
  }, [user]);

  const toggle = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path) => location.pathname.includes(path);

  if (!user) return null;
  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <div className="sidebar">
      {/* ====================== ADMIN MENU ====================== */}
      {isAdmin && (
        <>
          {/* Users */}
          <div className="sidebar-title" onClick={() => toggle("users")}>
            <span>Users</span>
            <span className={`arrow ${openMenu.users ? "down" : ""}`} />
          </div>
          <div className={`submenu ${openMenu.users ? "open" : ""}`}>
            <Link to="/users/manage" className={isActive("/users/manage") ? "active" : ""}>Manage Users</Link>
          </div>

          {/* Books */}
          <div className="sidebar-title" onClick={() => toggle("books")}>
            <span>Books</span>
            <span className={`arrow ${openMenu.books ? "down" : ""}`} />
          </div>
          <div className={`submenu ${openMenu.books ? "open" : ""}`}>
            <Link to="/books/manage">Manage Books</Link>
          </div>

          {/* Book Loans */}
          <div className="sidebar-title" onClick={() => toggle("loans")}>
            <span>Book Loans</span>
            <span className={`arrow ${openMenu.loans ? "down" : ""}`} />
          </div>
          <div className={`submenu ${openMenu.loans ? "open" : ""}`}>
            <Link to="/loans/current" className={isActive("/loans/current") ? "active" : ""}>View Active Loans</Link>
            <Link to="/loans/history" className={isActive("/loans/history") ? "active" : ""}>View Loan History</Link>
            <Link to="/loans/update/1" className={isActive("/loans/update") ? "active" : ""}>Update Loan</Link>
          </div>

          {/* Reservations */}
          <div className="sidebar-title" onClick={() => toggle("reservations")}>
            <span>Reservations</span>
            <span className={`arrow ${openMenu.reservations ? "down" : ""}`} />
          </div>
          <div className={`submenu ${openMenu.reservations ? "open" : ""}`}>
            <Link to="/reservations/list" className={isActive("/reservations/list") ? "active" : ""}>View Reservations</Link>
            <Link to="/reservations/update" className={isActive("/reservations/update") ? "active" : ""}>Update Reservation</Link>
            <Link to="/reservations/delete" className={isActive("/reservations/delete") ? "active" : ""}>Cancel Reservation</Link>
          </div>
        </>
      )}

      {/* ====================== REGULAR USER MENU ====================== */}
      {!isAdmin && user && (
        <>
          <div className="sidebar-title" onClick={() => toggle("loans")}>
            <span>My Loans</span>
            <span className={`arrow ${openMenu.loans ? "down" : ""}`} />
          </div>
          <div className={`submenu ${openMenu.loans ? "open" : ""}`}>
            <Link to="/loans/status/1" className={isActive("/loans/status") ? "active" : ""}>View My Active Loans</Link>
            <Link to="/loans/history/1" className={isActive("/loans/history") ? "active" : ""}>My Loan History</Link>
            <Link to="/loans/borrow/1" className={isActive("/loans/borrow") ? "active" : ""}>Borrow Book</Link>
            <Link to="/loans/return/1" className={isActive("/loans/return") ? "active" : ""}>Return Book</Link>
            <Link to="/fines/view-pay/1" className={isActive("/fines") ? "active" : ""}>View / Pay Fines</Link>
          </div>

          <div className="sidebar-title" onClick={() => toggle("reservations")}>
            <span>My Reservations</span>
            <span className={`arrow ${openMenu.reservations ? "down" : ""}`} />
          </div>
          <div className={`submenu ${openMenu.reservations ? "open" : ""}`}>
            <Link to="/reservations/view/1" className={isActive("/reservations/view") ? "active" : ""}>View My Reservations</Link>
            <Link to="/reservations/add/1" className={isActive("/reservations/add") ? "active" : ""}>Reserve a Book</Link>
            <Link to="/reservations/cancel/1" className={isActive("/reservations/cancel") ? "active" : ""}>Cancel Reservation</Link>
          </div>
        </>
      )}
    </div>
  );
}