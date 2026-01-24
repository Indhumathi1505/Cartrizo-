import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Rateus.css";

export default function RateUs() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔐 Check login
  if (!user) {
    return (
      <div className="rate-container">
        <div className="rate-card">
          <h1 className="rate-title">Login Required</h1>
          <p className="rate-desc">
            Please login to rate and review our website.
          </p>
          <button className="submit-btn" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setMessage("");
    setError("");

    if (rating === 0) {
      setError("❌ Please select a rating");
      return;
    }

    if (comment.trim() === "") {
      setError("❌ Please enter your review");
      return;
    }

    try {
      const response = await api.post(
        "/api/rate",
        {
          userEmail: user.email, // MUST match backend
          rating: rating,
          comment: comment,
        }
      );

      console.log("Saved to DB:", response.data);

      setMessage("✅ Thank you for your feedback!");
      setRating(0);
      setComment("");
    } catch (err) {
      console.error(err);

      if (err.response && err.response.data) {
        setError(err.response.data.message || "❌ You already rated");
      } else {
        setError("❌ Server error. Please try again later.");
      }
    }
  };

  return (
    <div className="rate-container">
      <div className="rate-card">

        <h1 className="rate-title">Rate Us</h1>

        <p className="rate-question">
          How was your car purchasing experience with <br />
          <b>Cartrizo?</b>
        </p>

        {/* ⭐ Star Rating */}
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= rating ? "star filled" : "star"}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        {/* 📝 Review Box */}
        <textarea
          className="review-box"
          placeholder="Write your experience or suggestions here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* 📩 Submit */}
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Review
        </button>

        {/* Messages */}
        {message && <p className="status-msg">{message}</p>}
        {error && <p className="status-msg" style={{ color: "red" }}>{error}</p>}

      </div>
    </div>
  );
}
