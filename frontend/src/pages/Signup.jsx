import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";

import carImg from "../assets/car.jpg";
import "./Signup.css";




export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Normal Signup
  const handleSignup = async () => {
    if (!name || !email || !password) return alert("Please fill all fields");

    try {
      const res = await fetch("api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      alert(data.message);
      if (res.ok) {
         localStorage.setItem("user", JSON.stringify({ email, name }));
        navigate("/info");
      }
    } catch (err) {
      alert("Server error: " + err.message);
    }
  };

  // Google Signup/Login
  const handleGoogleSuccess = async (response) => {
    console.log("Google response:", response);

    if (!response.credential) return alert("Google credential missing!");

    try {
      const user = jwtDecode(response.credential);
      console.log("Decoded user:", user);

      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: user.name,
          email: user.email,
        }),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) navigate("/"); // redirect after login
    } catch (err) {
      console.error(err);
      alert("Google Sign In Failed");
    }
  };

  return (
   <div className="signup-container">
      <div className="signup-card">

        {/* LEFT PANEL */}
        <div className="signup-left">
          <div className="semicircle"></div>
          <h1>SIGNUP</h1>
        </div>

        {/* MIDDLE IMAGE */}
        <div className="signup-middle">
          <img src={carImg} alt="Car" />
        </div>

        {/* RIGHT FORM */}
        <div className="signup-right">
          <h2>Create Account</h2>

          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
          </div>

          <button className="signup-btn" onClick={handleSignup}>
            Signup
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

          <p className="login-text">
            Already have an account?
            <Link to="/info"> Login</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
