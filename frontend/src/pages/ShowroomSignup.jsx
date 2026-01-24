import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";
import signupCar from "../assets/car.jpg";
import "./ShowroomAuth.css";

export default function ShowroomSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) return alert("Please fill all fields");

    setLoading(true);
    try {
      const res = await fetch("http://15.207.235.93:8080/api/showroom/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password,phone,address }),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message || "Signup failed");
      }

      alert("Signup successful! Please login.");
      navigate("/showroom/login"); // redirect to login
    } catch (err) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const user = jwtDecode(response.credential);
      const res = await fetch("http://15.207.235.93:8080/api/showroom/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email ,password:password}),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Google login failed");

      localStorage.setItem("showroomToken", data.token);
      navigate("/sell-cars"); // redirect after Google login
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
          <h1>SHOWROOM <br /> SIGNUP</h1>
        </div>

        <div className="auth-middle">
          <img src={signupCar} alt="Showroom Signup" />
        </div>

        <div className="auth-right">
          <h2>Create Account</h2>

          <input
            type="text"
            placeholder="Showroom Name"
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
          <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
<input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />


          <button className="auth-btn" onClick={handleSignup} disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
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
            Already have an account? <Link to="/showroom/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
