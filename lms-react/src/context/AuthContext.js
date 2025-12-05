// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import { userApi } from "../api/userApi";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore session from localStorage on page load
  useEffect(() => {
    const saved = localStorage.getItem("lms_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("lms_user");
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await userApi.login(email, password);
      const userData = {
        id: res.data.id,
        email: res.data.email,
        fullName: res.data.name,        // matches LoginResponse
        role: res.data.role,            // "Admin" or "Member"
      };
      setUser(userData);
      localStorage.setItem("lms_user", JSON.stringify(userData));
      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: `Welcome back, ${userData.fullName}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      const msg = err.response?.data || "Invalid email or password";
      Swal.fire("Login Failed", msg, "error");
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lms_user");
    Swal.fire("Logged out", "You have been logged out", "info");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}