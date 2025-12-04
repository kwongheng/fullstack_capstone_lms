// Login.js
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);   // ✅ FIX: use login(), not setUser()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email === "admin1@library.com") {
      login({ email, role: "admin", name: "admin1" });   // ✅ call login()
      navigate("/dashboard");
    } else if (email === "user1@email.com") {
      login({ email, role: "user", name: "user1" });     // ✅ call login()
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-wrapper d-flex justify-content-center align-items-center">
      <div className="login-box shadow p-4 rounded">
        <h3 className="text-center mb-3">Login</h3>

        <input
          className="form-control"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="form-control mt-2"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary w-100 mt-3" onClick={handleLogin}>
          Login
        </button>

        <p className="mt-3 text-center">
          <Link to="/create-account">Create new account</Link>
        </p>
      </div>
    </div>
  );
}
