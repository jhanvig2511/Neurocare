import { useNavigate } from "react-router-dom";

function LoginUser() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/user-dashboard");
  };

  return (
    <div className="auth-page">
      <h2>User Login</h2>

      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginUser;