// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import MemberDashboard from "./pages/User/MemberDashboard";  
import "./styles/styles.css";

import ManageUsers from "./pages/Admin/User/ManageUsers";
import ManageBooks from "./pages/Admin/Books/ManageBooks";

import LoansActive from "./pages/Admin/BookLoans/LoansActive";
import LoansHistory from "./pages/Admin/BookLoans/LoansHistory";
import LoansUpdate from "./pages/Admin/BookLoans/LoansUpdate";

import ReservationsCancel from "./pages/Admin/Reservations/ReservationsCancel";
import ReservationsUpdate from "./pages/Admin/Reservations/ReservationsUpdate";
import ReservationsView from "./pages/Admin/Reservations/ReservationsView";

import BorrowBooks from "./pages/User/BookLoans/BorrowBooks";
import ManageLoansStatus from "./pages/User/BookLoans/ManageLoansStatus";
import ViewLoansHistory from "./pages/User/BookLoans/ViewLoansHistory";
import ManageUserReservations from "./pages/User/Reservations/ManageUserReservations";

import UserProfile from "./pages/UserProfile";

/* ================================ */

function Layout() {
  const { user } = useContext(AuthContext);

  // If not logged in → only allow login + create account
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Logged-in user
  return (
    <>
      <Header />
      <div className="main-layout">
        <Sidebar />
        <div className="content-area">
          <Routes>
            {/* === MEMBER DASHBOARD — NEW LANDING PAGE === */}
            <Route path="/member/dashboard" element={<MemberDashboard />} />
            <Route path="/" element={<Navigate to="/member/dashboard" replace />} />

            {/* === ADMIN ROUTES === */}
            <Route path="/users/manage" element={<ManageUsers />} />
            <Route path="/books/manage" element={<ManageBooks />} />

            <Route path="/loans/current" element={<LoansActive />} />
            <Route path="/loans/history" element={<LoansHistory />} />
            <Route path="/loans/update/:id" element={<LoansUpdate />} />

            <Route path="/reservations/list" element={<ReservationsView />} />
            <Route path="/reservations/update" element={<ReservationsUpdate />} />
            <Route path="/reservations/delete" element={<ReservationsCancel />} />

            {/* === MEMBER ROUTES === */}
            <Route path="/member/loans/borrow" element={<BorrowBooks />} />
            <Route path="/member/loans/status" element={<ManageLoansStatus />} />
            <Route path="/member/loans/history" element={<ViewLoansHistory />} />
            <Route path="/member/reservations" element={<ManageUserReservations />} />

            {/* === User Profile === */}
            <Route path="/profile" element={<UserProfile />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/member/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}