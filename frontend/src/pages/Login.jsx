import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";

import loginCar from "../assets/car.jpg";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [inputCaptcha, setInputCaptcha] = useState("");

  useEffect(() => {
    localStorage.removeItem("user");
  }, []);

  /* ================= CAPTCHA ================= */
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
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
      const res = await fetch(
        "http://15.207.235.93:8080/api/auth/login",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      // ✅ SAFE PARSING (FIXES HTML RESPONSE ISSUE)
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned non-JSON:", text);
        throw new Error("Server error. Please try again later.");
      }

      if (res.ok) {
        alert("Login successful ✅");
        localStorage.setItem(
          "user",
          JSON.stringify({
            email,
            name: data.name,
            role: data.role,
          })
        );
        navigate("/");
        return;
      }

      alert(data.message || "Invalid email or password");
    } catch (err) {
      alert("Server error: " + err.message);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleSuccess = async (response) => {
    if (!response.credential) {
      alert("Google credential missing!");
      return;
    }

    try {
      const user = jwtDecode(response.credential);

      const res = await fetch(
        "http://15.207.235.93:8080/api/auth/google-login",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
          }),
        }
      );

      // ✅ SAFE PARSING AGAIN
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned non-JSON:", text);
        throw new Error("Server error during Google login");
      }

      if (res.ok) {
        alert("Login successful ✅");
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: user.email,
            name: user.name,
            role: data.role || "BUYER",
          })
        );
        navigate("/");
        return;
      }

      alert(data.message || "Google login failed");
    } catch (err) {
      console.error(err);
      alert("Google Sign In Failed");
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
          <img src={loginCar} alt="Login Car" />
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
                <span className="refresh" onClick={generateCaptcha}>
                  ⟳
                </span>
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
            onError={() => alert("Google Sign In Failed!")}
          />

          <p>
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}