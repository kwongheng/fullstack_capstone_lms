// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import MemberDashboard from "./pages/User/MemberDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import "./styles/styles.css";

import ManageUsers from "./pages/Admin/User/ManageUsers";
import ManageBooks from "./pages/Admin/Books/ManageBooks";
import ActiveLoans from "./pages/Admin/BookLoans/ActiveLoans";
import LoansHistory from "./pages/Admin/BookLoans/LoansHistory";
import ManageReservations from "./pages/Admin/Reservations/ManageReservations";

import BorrowBooks from "./pages/User/BookLoans/BorrowBooks";
import ManageLoansStatus from "./pages/User/BookLoans/ManageLoansStatus";
import ViewLoansHistory from "./pages/User/BookLoans/ViewLoansHistory";
import ManageUserReservations from "./pages/User/Reservations/ManageUserReservations";
import MakeReservations from "./pages/User/Reservations/MakeReservations";

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
            {/* ROLE-BASED LANDING PAGE — ONE LINE */}
            {user.role === "Admin" ? (
              <>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </>
            ) : user.role === "Member" ? (
              <>
                <Route path="/member/dashboard" element={<MemberDashboard />} />
                <Route path="*" element={<Navigate to="/member/dashboard" replace />} />
              </>
            ) : null}

            {/* ADMIN ROUTES — ONLY FOR ADMIN */}
            {user.role === "Admin" && (
              <>
                <Route path="/admin/users/manage" element={<ManageUsers />} />
                <Route path="/admin/books/manage" element={<ManageBooks />} />
                <Route path="/admin/loans/current" element={<ActiveLoans />} />
                <Route path="/admin/loans/history" element={<LoansHistory />} />
                <Route path="/admin/reservations/manage" element={<ManageReservations />} />
              </>
            )}

            {/* MEMBER ROUTES — ONLY FOR MEMBER */}
            {user.role === "Member" && (
              <>
                <Route path="/member/loans/borrow" element={<BorrowBooks />} />
                <Route path="/member/loans/status" element={<ManageLoansStatus />} />
                <Route path="/member/loans/history" element={<ViewLoansHistory />} />
                <Route path="/member/reservations/manage" element={<ManageUserReservations />} />
                <Route path="/member/reservations/make" element={<MakeReservations />} />
              </>
            )}

            {/* USER PROFILE */}
            <Route path="/profile" element={<UserProfile />} />
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
