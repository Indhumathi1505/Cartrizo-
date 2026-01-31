import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { FaHeart, FaRegHeart, FaPhoneAlt } from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./CarDetails.css";
import Chat from "./Chat";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function UsedCarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const buyerEmail = loggedUser?.email?.toLowerCase();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [showChat, setShowChat] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  // ======== FETCH CAR DETAILS ========
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await api.get(`/api/cars/${id}`);
        setCar(res.data);
        setSelectedImage(res.data.image || "");

        // Check if favourite
        if (buyerEmail) {
          api.get(`/api/favorites/${buyerEmail}`).then(favRes => {
            setIsFavourite(favRes.data.some(f => f.carId === id));
          });
        }
      } catch (err) {
        console.error("Failed to fetch car details:", err);
        setCar(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id, buyerEmail]);

  // ======== FETCH REVIEWS ========
  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/reviews/car/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const toggleFavourite = async () => {
    if (!buyerEmail) {
      alert("Please login");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post("/api/favorites/toggle", {
        userEmail: buyerEmail,
        carId: id,
        carType: "USED"
      });
      setIsFavourite(res.data);
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  // ======== SUBMIT REVIEW ========
  const submitReview = async (e) => {
    e.preventDefault();
    if (!buyerEmail) return alert("Please log in to submit a review");

    const payload = {
      carId: id,
      userEmail: buyerEmail,
      rating: Number(newReview.rating),
      comment: newReview.comment
    };

    try {
      await api.post("/api/reviews", payload);
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
      alert("Review submitted successfully!");
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review");
    }
  };

  // ======== PIE CHART DATA ========
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach(r => counts[r.rating - 1]++);
  const pieData = {
    labels: ["1★", "2★", "3★", "4★", "5★"],
    datasets: [
      {
        data: counts,
        backgroundColor: ["#ce8f9c", "#73c3f8", "#eed493", "#9be8e8", "#b69de8"]
      }
    ]
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!car) return <div className="loading">Car not found</div>;

  const carId = car.id || car._id;

  return (
    <div className="cardetails-page">
      <button className="back-btn" onClick={() => navigate("/used-cars")}>
        ← Back to Used Cars
      </button>

      <div className="image-section">
        <img
          className="main-image"
          src={selectedImage ? `data:image/jpeg;base64,${selectedImage}` : "/placeholder-car.jpg"}
          alt="car"
        />
        <div className="thumbnail-row">
          {(car.images || [car.image]).map((img, index) => (
            <img
              key={`${img}-${index}`}
              src={`data:image/jpeg;base64,${img}`}
              className={selectedImage === img ? "thumb active" : "thumb"}
              onClick={() => setSelectedImage(img)}
              alt="thumb"
            />
          ))}
        </div>
        <button className="favourite-btn" onClick={toggleFavourite}>
          {isFavourite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className="details-section">
        <h1>{car.title}</h1>
        <div className="price">₹{Number(car.price).toLocaleString()}</div>

        <table className="spec-table">
          <tbody>
            <tr><th>Model</th><td>{car.model}</td></tr>
            <tr><th>Year</th><td>{car.year}</td></tr>
            <tr><th>Mileage</th><td>{car.mileage} km</td></tr>
            <tr><th>Engine</th><td>{car.engineCapacity} CC</td></tr>
            <tr><th>Fuel</th><td>{car.fuelType}</td></tr>
            <tr><th>Color</th><td>{car.exteriorColor}</td></tr>
            <tr><th>Condition</th><td>Used</td></tr>
          </tbody>
        </table>

        <div className="description">
          <h3>Description</h3>
          <p>{car.description}</p>
        </div>

        <div className="action-buttons">
          <button
            className="contact-btn"
            onClick={() => {
              if (!buyerEmail) {
                alert("Please login to contact owner");
                navigate("/login");
                return;
              }
              setShowChat(prev => !prev);
            }}
          >
            <FaPhoneAlt /> {showChat ? "Close Chat" : "Contact Owner"}
          </button>

          {showChat && carId && buyerEmail && (
            <Chat
              carId={carId}
              user={buyerEmail}
              role="BUYER"
              receiver={car.sellerEmail}
              buyerEmail={buyerEmail}
              sellerEmail={car.sellerEmail}
            />
          )}
        </div>
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div className="pie-chart">
            <Pie data={pieData} />
          </div>
        ) : (
          <p>No reviews yet</p>
        )}

        <div className="review-form">
          <h3>Add Your Review</h3>
          <form onSubmit={submitReview}>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${newReview.rating >= star ? "active" : ""}`}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Write your review"
              value={newReview.comment}
              onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
              required
            />
            <button type="submit">Submit Review</button>
          </form>
        </div>

        <div className="review-list">
          {reviews.length ? (
            reviews.map(r => (
              <div key={r.id || r._id} className="review-card">
                <strong>{r.userEmail}</strong>
                <div className="review-stars">{"★".repeat(r.rating)}</div>
                <p>{r.comment}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
