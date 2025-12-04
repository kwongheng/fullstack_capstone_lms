// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import "./styles/styles.css";

/* ================================
   IMPORT YOUR STUB PAGES
================================ */

import LoansActive from "./pages/Admin/BookLoans/LoansActive";
import LoansHistory from "./pages/Admin/BookLoans/LoansHistory";
import LoansUpdate from "./pages/Admin/BookLoans/LoansUpdate";

import ReservationsCancel from "./pages/Admin/Reservations/ReservationsCancel";
import ReservationsUpdate from "./pages/Admin/Reservations/ReservationsUpdate";
import ReservationsView from "./pages/Admin/Reservations/ReservationsView";

import UserAdd from "./pages/Admin/User/UserAdd";
import UserDelete from "./pages/Admin/User/UserDelete";
import UserUpdate from "./pages/Admin/User/UserUpdate";
import UserView from "./pages/Admin/User/UserView";

import BooksAdd from "./pages/Admin/Books/BooksAdd";
import BooksView from "./pages/Admin/Books/BooksView";
import BooksUpdate from "./pages/Admin/Books/BooksUpdate";
import BooksDelete from "./pages/Admin/Books/BooksDelete";

import BooksBorrow from "./pages/User/BookLoans/BooksBorrow";
import BooksReturn from "./pages/User/BookLoans/BooksReturn";
import FinesViewPay from "./pages/User/BookLoans/FinesViewPay";
import LoansUserStatus from "./pages/User/BookLoans/LoansUserStatus";
import LoansUserHistory from "./pages/User/BookLoans/LoansUserHistory";

import ReservationsUserAdd from "./pages/User/Reservations/ReservationsUserAdd";
import ReservationsUserCancel from "./pages/User/Reservations/ReservationsUserCancel";
import ReservationsUserView from "./pages/User/Reservations/ReservationsUserView";
/* ================================ */

function Layout() {
  const { user } = useContext(AuthContext);

  // If not logged in → only allow login + create account
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Logged-in layout
  return (
    <>
      <Header />
      <div className="main-layout">
        <Sidebar />
        <div className="content-area p-3">
          <Routes>

            {/* ================================
               USERS
            ================================ */}
            <Route path="/users/list" element={<UserView />} />
            <Route path="/users/create" element={<UserAdd />} />
            <Route path="/users/update/:id" element={<UserUpdate />} />
            <Route path="/users/delete/:id" element={<UserDelete />} />

            {/* ================================
               BOOKS
            ================================ */}
            <Route path="/books/list" element={<BooksView />} />
            <Route path="/books/add" element={<BooksAdd />} />
            <Route path="/books/update/:id" element={<BooksUpdate />} />
            <Route path="/books/delete/:id" element={<BooksDelete />} />

            {/* ================================
               LOANS
            ================================ */}
            <Route path="/loans/current" element={<LoansActive />} />
            <Route path="/loans/history" element={<LoansHistory />} />
            <Route path="/loans/update/:id" element={<LoansUpdate />} />

            {/* ================================
               RESERVATIONS
            ================================ */}
            {/* Admin */}
            <Route path="/reservations/list" element={<ReservationsView />} />
            <Route path="/reservations/update" element={<ReservationsUpdate />} />
            <Route path="/reservations/delete" element={<ReservationsCancel />} />

            {/* ================================
               Members
            ================================ */}

            {/* BookLoans */}
            <Route path="/loans/borrow/:id" element={<BooksBorrow />} />
            <Route path="/loans/return/:id" element={<BooksReturn />} />
            <Route path="/loans/history/:id" element={<LoansUserHistory />} />
            <Route path="/loans/status/:id" element={<LoansUserStatus />} />
            <Route path="/fines/view-pay/:id" element={<FinesViewPay />} />

            <Route path="/reservations/add/:id" element={<ReservationsUserAdd />} />
            <Route path="/reservations/cancel/:id" element={<ReservationsUserCancel />} />
            <Route path="/reservations/view/:id" element={<ReservationsUserView/>} />           

            {/* DEFAULT */}
            <Route path="*" element={<h2>Stub Page</h2>} />
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
