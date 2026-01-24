import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";

import loginCar from "../assets/car.jpg";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL;

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // ✅ SAFE RESPONSE HANDLING
      const text = await res.text();
      let data = null;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response from server:", text);
        alert("Server error. Please try again later.");
        return;
      }

      if (!res.ok) {
        alert(data?.message || "Invalid email or password");
        return;
      }

      // ✅ SUCCESS
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: data.email || email,
          name: data.name,
          role: data.role,
        })
      );

      alert("Login successful ✅");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Unable to connect to server");
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleSuccess = async (response) => {
    if (!response?.credential) {
      alert("Google credential missing");
      return;
    }

    try {
      const decoded = jwtDecode(response.credential);

      const res = await fetch(`${API_URL}/api/auth/google-login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: decoded.name,
          email: decoded.email,
        }),
      });

      const text = await res.text();
      let data = null;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON Google response:", text);
        alert("Server error during Google login");
        return;
      }

      if (!res.ok) {
        alert(data?.message || "Google login failed");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          email: decoded.email,
          name: decoded.name,
          role: data.role || "BUYER",
        })
      );

      alert("Login successful ✅");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Google Sign-In failed");
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