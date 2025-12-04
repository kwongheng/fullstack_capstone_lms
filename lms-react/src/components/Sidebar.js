// Sidebar.js
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";   // ✅ IMPORTANT

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  const [openMenu, setOpenMenu] = useState({
    users: false,
    books: false,
    loans: false,
    reservations: false,
  });

  // AUTO RESET when user logs out
  useEffect(() => {
    if (!user) {
      setOpenMenu({
        users: false,
        books: false,
        loans: false,
        reservations: false,
      });
    }
  }, [user]);

  const toggle = (key) => {
    setOpenMenu((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="sidebar">
      {/* USERS */}
      <div className="sidebar-title" onClick={() => toggle("users")}>
        <span>Users</span>
        <span>{openMenu.users ? "▾" : "▸"}</span>
      </div>
      <div className={`submenu ${openMenu.users ? "open" : ""}`}>
        <Link to="/users/list">User List</Link>
        <Link to="/users/create">Add User</Link>
      </div>

      {/* BOOKS */}
      <div className="sidebar-title" onClick={() => toggle("books")}>
        <span>Books</span>
        <span>{openMenu.books ? "▾" : "▸"}</span>
      </div>
      <div className={`submenu ${openMenu.books ? "open" : ""}`}>
        <Link to="/books/list">Book List</Link>
        <Link to="/books/add">Add Book</Link>
      </div>

      {/* LOANS */}
      <div className="sidebar-title" onClick={() => toggle("loans")}>
        <span>Loans</span>
        <span>{openMenu.loans ? "▾" : "▸"}</span>
      </div>
      <div className={`submenu ${openMenu.loans ? "open" : ""}`}>
        <Link to="/loans/current">Current Loans</Link>
        <Link to="/loans/history">Loan History</Link>
      </div>

      {/* RESERVATIONS */}
      <div className="sidebar-title" onClick={() => toggle("reservations")}>
        <span>Reservations</span>
        <span>{openMenu.reservations ? "▾" : "▸"}</span>
      </div>
      <div className={`submenu ${openMenu.reservations ? "open" : ""}`}>
        <Link to="/reservations/list">Reservation List</Link>
        <Link to="/reservations/create">New Reservation</Link>
      </div>
    </div>
  );
}
