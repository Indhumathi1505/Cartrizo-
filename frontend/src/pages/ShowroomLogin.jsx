import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";
import loginCar from "../assets/car.jpg";
import "./ShowroomAuth.css";

export default function ShowroomLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return alert("Please fill all fields");

    setLoading(true);
    try {
      const res = await fetch("/api/showroom/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Login failed");

      localStorage.setItem("showroomToken", data.token);
      localStorage.setItem("showroomEmail", email);
      navigate("/sell/new"); // redirect after login
    } catch (err) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const user = jwtDecode(response.credential);
      const res = await fetch("/api/showroom/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name, email: user.email }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Google login failed");

      localStorage.setItem("showroomToken", data.token);
      localStorage.setItem("showroomEmail", user.email);
      navigate("/sell/new"); // redirect after Google login
    } catch (err) {
      console.error(err);
      alert("Google Sign In Failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-left">
          <div className="semicircle"></div>
          <h1>SHOWROOM <br /> LOGIN</h1>
        </div>

        <div className="auth-middle">
          <img src={loginCar} alt="Showroom Login" />
        </div>

        <div className="auth-right">
          <h2>Welcome Back!</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Sign In Failed")}
          />

          <p className="auth-redirect">
            Don't have an account? <Link to="/showroom/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
