import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="auth-eyebrow">Join Us</span>
        <h2 className="auth-title">Create Account</h2>
        <div className="auth-divider"><span></span><i></i><span></span></div>
        <p className="auth-sub">Register to book your luxury stay</p>

        {error && <p className="auth-error">{error}</p>}

        <label className="auth-label">Full Name</label>
        <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />

        <label className="auth-label">Email</label>
        <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />

        <label className="auth-label">Password</label>
        <input name="password" type="password" placeholder="Choose a password" value={form.password} onChange={handleChange} required />

        <button type="submit" className="auth-btn">Register</button>

        <p className="auth-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;