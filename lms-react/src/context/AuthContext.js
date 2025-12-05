// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import { userApi } from "../api/userApi";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Always start from Login screen on refresh/npm restart
  useEffect(() => {
    localStorage.removeItem("lms_user");
  }, []);

  const login = async (email, password) => {
    try {
      // First: authenticate
      const loginRes = await userApi.login(email, password);

      // Then: fetch full user data using the ID from login
      const userRes = await userApi.getUserById(loginRes.data.id);

      const fullUserData = {
        id: userRes.data.id,
        email: userRes.data.email,
        fullName: userRes.data.fullName,
        phone: userRes.data.phone || "",
        address: userRes.data.address || "",
        role: userRes.data.role,
        displayName: userRes.data.email.split("@")[0],
      };

      setUser(fullUserData);
      localStorage.setItem("lms_user", JSON.stringify(fullUserData));

      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: `Welcome back, ${fullUserData.fullName}`,
        timer: 1500,
        showConfirmButton: false,
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
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>
  );
}
