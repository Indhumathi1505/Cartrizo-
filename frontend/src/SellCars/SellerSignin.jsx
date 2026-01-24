import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerSignin.css";

const SellerSignin = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [inputCaptcha, setInputCaptcha] = useState("");
  const [error, setError] = useState("");

  const generateCaptcha = () =>
    Math.floor(1000 + Math.random() * 9000).toString();

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!username || !password || !inputCaptcha) {
    setError("All fields are required");
    return;
  }

  if (inputCaptcha !== captcha) {
    setError("Captcha is incorrect");
    setCaptcha(generateCaptcha());
    setInputCaptcha("");
    return;
  }

  try {
    const response = await fetch(
      "http://15.207.235.93:8080/api/seller/verify",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          password
        })
      }
    );
    const data = await response.json();

if (!data.token) {
  throw new Error("Token not received from server");
}

// ✅ Save JWT
localStorage.setItem("token", data.token);

// ✅ Save user info
localStorage.setItem("user", JSON.stringify({
  email: username,
  name: username,
  role: "SELLER"
}));

// ❌ remove old dummy token if exists
localStorage.removeItem("showroomToken");

navigate("/sell/used");


   

  } catch (err) {
    setError(err.message);
  }
};

/*
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password || !inputCaptcha) {
      setError("All fields are required");
      return;
    }

    if (inputCaptcha !== captcha) {
      setError("Captcha is incorrect");
      setCaptcha(generateCaptcha());
      setInputCaptcha("");
      return;
    }

    setError("");

    // ✅ Navigate to login page
    navigate("/sell-login");
  };
  */

  return (
    <div className="main">
    <div className="container">
      <h2>Welcome Seller</h2>
      <p className="subtitle">Sign-In as seller</p>

      <form onSubmit={handleSubmit}>
    {/*<input
          type="text"
          placeholder="Seller Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />*/}
        <input
  type="text"
  placeholder="Email"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>


        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="captcha-container">
          <span>{captcha}</span>
          <button
            type="button"
            className="refresh-btn"
            onClick={() => setCaptcha(generateCaptcha())}
          >
            🔄
          </button>
        </div>

        <input
          type="text"
          placeholder="Enter Captcha"
          value={inputCaptcha}
          onChange={(e) => setInputCaptcha(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Sign In</button>
      </form>
    </div>
    </div>
  );
};

export default SellerSignin;
