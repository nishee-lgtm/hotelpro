import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="auth-eyebrow">Welcome</span>
        <h2 className="auth-title">Sign In</h2>
        <div className="auth-divider"><span></span><i></i><span></span></div>
        <p className="auth-sub">Access your bookings and reservations</p>

        {error && <p className="auth-error">{error}</p>}

        <label className="auth-label">Email</label>
        <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />

        <label className="auth-label">Password</label>
        <input name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} required />

        <button type="submit" className="auth-btn">Login</button>

        <p className="auth-foot">
          New to HotelPro? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;