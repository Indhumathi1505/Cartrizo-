import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";
import api from "../api/api"; // Added import for api instance

import loginCar from "../assets/car.jpg";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [inputCaptcha, setInputCaptcha] = useState("");

  /* ================= CLEAR OLD LOGIN ================= */
  useEffect(() => {
    localStorage.removeItem("user");
  }, []);

  /* ================= CAPTCHA ================= */
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptcha(code);
    setInputCaptcha("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const verifyCaptcha = () => inputCaptcha === captcha;

  /* ================= NORMAL LOGIN ================= */
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (!verifyCaptcha()) {
      alert("Incorrect CAPTCHA");
      generateCaptcha();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Login successful ✅");
        localStorage.setItem("user", JSON.stringify({
          email: email.toLowerCase(),
          name: data.name,
          role: data.role,
          token: data.token
        }));
        navigate("/info");
        return;
      }
      alert(data.message || "Invalid email or password");
    } catch (err) {
      alert("Server error: " + err.message);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleSuccess = async (response) => {
    if (!response.credential) return alert("Google credential missing!");

    try {
      const decoded = jwtDecode(response.credential);

      const res = await fetch(`${API_URL}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: decoded.name, email: decoded.email }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Login successful ✅");
        localStorage.setItem("user", JSON.stringify({
          email: decoded.email.toLowerCase(),
          name: decoded.name,
          role: data.role,
          token: data.token
        }));
        navigate("/info");
        return;
      }
      alert(data.message || "Login failed");
    } catch (err) {
      console.error(err);
      alert("Unable to connect to server");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-left">
          <div className="semicircle-shape"></div>
          <h1>LOGIN PAGE</h1>
        </div>

        <div className="login-middle">
          <img src={loginCar} alt="Login" />
        </div>

        <div className="login-right">
          <h2>Login</h2>

          <div className="form-group">
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

            <div className="captcha-row">
              <div className="captcha-box">
                {captcha}
                <span className="refresh" onClick={generateCaptcha}>⟳</span>
              </div>

              <input
                type="text"
                placeholder="Enter CAPTCHA"
                value={inputCaptcha}
                onChange={(e) => setInputCaptcha(e.target.value)}
              />
            </div>

            <Link className="forgot-link" to="/forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>

          <div className="divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Sign-In Failed")}
          />

          <p>
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}