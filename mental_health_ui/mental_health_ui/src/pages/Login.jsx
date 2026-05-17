import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

/* 🌐 BACKEND URL */
const BASE_URL = "https://neurocare-production.up.railway.app";

function Login() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
        role,
      });

      /* SAVE TOKEN (IMPORTANT) */
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      /* REDIRECT BASED ON ROLE */
      if (role === "user") {
        navigate("/user-dashboard");
      } else {
        navigate("/admin/dashboard");
      }

    } catch (err) {
      console.log(err);
      alert("Login failed ❌ Check credentials or server");
    }
  };

  return (
    <div className="login-container">

      {/* Left Side */}
      <div className="login-left">
        <h1>Welcome Back 🌱</h1>
        <p>
          Take a breath. You’re entering a safe and supportive space.
        </p>
      </div>

      {/* Right Side */}
      <div className="login-right">
        <div className="login-card">

          {/* Role Toggle */}
          <div className="role-toggle">
            <button
              type="button"
              className={role === "user" ? "active" : ""}
              onClick={() => setRole("user")}
            >
              User
            </button>

            <button
              type="button"
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              Admin
            </button>
          </div>

          <h2>
            {role === "user" ? "User Login" : "Admin Login"}
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn-primary">
              Login
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}

export default Login;