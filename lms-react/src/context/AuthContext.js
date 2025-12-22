// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";
import { userApi } from "../api/userApi";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On app load: restore session if token + user exist
  useEffect(() => {
    const storedUser = localStorage.getItem("lms_user");
    const storedToken = localStorage.getItem("jwt_token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Call the real /api/users/login endpoint
      const response = await userApi.login(email, password);

      const { token, id, email: userEmail, fullName, role } = response.data;
      // response.data is your AuthResponse record

      if (!token) {
        throw new Error("No token received");
      }

      const fullUserData = {
        id,
        email: userEmail,
        fullName: fullName || "",
        phone: "", // not returned, optional
        address: "", // not returned, optional
        role, // "Admin" or "Member" as string
        displayName: userEmail.split("@")[0],
      };

      // Store both token and user
      localStorage.setItem("jwt_token", token);
      localStorage.setItem("lms_user", JSON.stringify(fullUserData));

      setUser(fullUserData);

      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: `Welcome back, ${fullName || userEmail}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid email";
      Swal.fire("Login Failed", msg, "error");
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lms_user");
    localStorage.removeItem("jwt_token");
    Swal.fire("Logged out", "You have been logged out", "info");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};