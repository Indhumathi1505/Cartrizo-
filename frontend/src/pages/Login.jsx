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


  // Generate CAPTCHA
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptcha(code);
    setInputCaptcha("");
  };

  useEffect(() => generateCaptcha(), []);

  const verifyCaptcha = () => inputCaptcha === captcha;

  // Normal login
  const handleLogin = async () => {
    if (!email || !password) return alert("Please fill all fields");
    if (!verifyCaptcha()) {
      alert("Incorrect CAPTCHA");
      generateCaptcha();
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) { 
  alert("Login successful ✅");
  localStorage.setItem("user", JSON.stringify({
    email,
    name: data.name,
    role: data.role
  }));
  navigate("/");
  return; // ✅ STOP HERE
}

alert(data.message || "Invalid email or password");


     
    } catch (err) {
      alert("Server error: " + err.message);
    }
  };

  // Google login
  const handleGoogleSuccess = async (response) => {
    console.log("Google response:", response);
    if (!response.credential) return alert("Google credential missing!");

    try {
      const user = jwtDecode(response.credential);
      console.log("Decoded user:", user);

      const res = await fetch("http://localhost:8080/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: user.name, email: user.email }),
      });

      const data = await res.json();
     if (res.ok) {
  alert("Login successful");
  localStorage.setItem("user", JSON.stringify({
  email: user.email,
  name: user.name,
  role: "BUYER"
}));

  navigate("/");
  return;
}

alert(data.message || "Login failed");


      
    } catch (err) {
      console.error(err);
      alert("Google Sign In Failed");
    }
  };

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
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />

            <div className="captcha-row">
              <div className="captcha-box">{captcha} <span className="refresh" onClick={generateCaptcha}>⟳</span></div>
              <input type="text" placeholder="Enter CAPTCHA" value={inputCaptcha} onChange={e => setInputCaptcha(e.target.value)} />
            </div>

            <Link className="forgot-link" to="/forgot-password">Forgot Password?</Link>
          </div>

          <button className="login-btn" onClick={handleLogin}>Login</button>

          <div className="divider"><span></span><p>or</p><span></span></div>

          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => alert("Google Sign In Failed!")}
          />

          <p>Don’t have an account? <Link to="/signup">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
