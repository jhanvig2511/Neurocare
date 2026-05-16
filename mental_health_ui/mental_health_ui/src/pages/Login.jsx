import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (role === "user") {
      navigate("/user-dashboard");
    } else {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="login-container">

      {/* Left Visual Section */}
      <div className="login-left">
        <h1>Welcome Back 🌱</h1>
        <p>
          Take a breath. You’re entering a safe and supportive space designed
          for clarity, calm, and care.
        </p>
      </div>

      {/* Right Login Card */}
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

          <h2>{role === "user" ? "User Login" : "Admin Login"}</h2>

          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />

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