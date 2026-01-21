import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart, FaPhoneAlt } from "react-icons/fa";
import "./CarDetails.css";

// ⭐ Chart imports
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function NewCarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ===== BASIC STATES =====
  const [car, setCar] = useState(null);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);

  // ===== USER =====
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const buyerEmail = loggedUser?.email;

  // ===== SHOWROOM =====
  const [showroom, setShowroom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ===== REVIEWS =====
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  // ===== FETCH CAR =====
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/cars/${id}`)
      .then(res => {
        setCar(res.data);
        setImage(res.data.image);
      })
      .catch(() => setCar(null))
      .finally(() => setLoading(false));
  }, [id]);

  // =========================
  // ❤️ FAVORITES (BACKEND)
  // =========================
  useEffect(() => {
    if (!buyerEmail) return;

    axios
      .get(`http://localhost:8080/api/favorites/${buyerEmail}`)
      .then(res => {
        setIsFavourite(res.data.some(f => f.carId === id));

      })
      .catch(err => console.error("Fav check failed", err));
  }, [id, buyerEmail]);

  const toggleFavourite = async () => {
    if (!buyerEmail) {
      alert("Please login");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/api/favorites/toggle",
        {
          userEmail: buyerEmail,
          carId: id,
          carType: "NEW"
        }
      );

      setIsFavourite(res.data);
    } catch (err) {
      console.error("Favorite toggle failed", err);
    }
  };

  // ===== FETCH REVIEWS =====
  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/reviews/car/${id}`
      );
      setReviews(res.data);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // ===== CONTACT DEALER =====
  const contactDealer = async () => {
  try {
    const res = await axios.get(
      `http://localhost:8080/api/cars/contact/${id}`
    );
    setShowroom(res.data);
    setShowModal(true); // 🔥 THIS opens modal
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("Dealer details not available");
  }
};


  // ===== SUBMIT REVIEW =====
  const submitReview = async (e) => {
    e.preventDefault();

    if (!buyerEmail) {
      alert("Please login to submit a review");
      navigate("/login");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/reviews", {
        carId: id,
        userEmail: buyerEmail,
        rating: Number(newReview.rating),
        comment: newReview.comment
      });

      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
    } catch {
      alert("Failed to submit review");
    }
  };

  // ===== PIE CHART =====
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach(r => counts[r.rating - 1]++);

  const pieData = {
  labels: ["1★", "2★", "3★", "4★", "5★"],
  datasets: [
    {
      data: counts,
      backgroundColor: [
        "#ce8f9cff",
        "#73c3f8ff",
        "#eed493ff",
        "#9be8e8ff",
        "#b69de8ff"
      ]
    }
  ]
};


  if (loading) return <div className="loading">Loading...</div>;
  if (!car) return <div className="loading">Car not found</div>;

  return (
    <div className="cardetails-page">

      <button className="back-btn" onClick={() => navigate("/new-cars")}>
        ← Back to New Cars
      </button>

      {/* IMAGE */}
      <div className="image-section">
        <img
          className="main-image"
          src={`data:image/jpeg;base64,${image}`}
          alt="car"
        />

        <button className="favourite-btn" onClick={toggleFavourite}>
          {isFavourite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      {/* DETAILS */}
      <div className="details-section">
        <h1>{car.title}</h1>
        <div className="price">₹{Number(car.price).toLocaleString()}</div>

        <table className="spec-table">
          <tbody>
            <tr><th>Brand</th><td>{car.brand}</td></tr>
            <tr><th>Model</th><td>{car.model}</td></tr>
            <tr><th>Year</th><td>{car.year}</td></tr>
            <tr><th>Fuel</th><td>{car.fuelType}</td></tr>
            <tr><th>Mileage</th><td>{car.mileage} km</td></tr>
            <tr><th>Condition</th><td>New</td></tr>
          </tbody>
        </table>

        <div className="action-buttons">
          {car.sellerType === "SHOWROOM" && (
  <button className="contact-btn" onClick={contactDealer}>
    <FaPhoneAlt /> Contact Dealer
  </button>
)}

        </div>
      </div>

      {/* REVIEWS */}
      <div className="reviews-section">
        <h2>Customer Reviews</h2>

        {reviews.length > 0 && (
          <div className="pie-chart">
            <Pie data={pieData} />
          </div>
        )}

        <form onSubmit={submitReview}>
          <textarea
            value={newReview.comment}
            onChange={e =>
              setNewReview({ ...newReview, comment: e.target.value })
            }
            required
          />
          <button type="submit">Submit Review</button>
        </form>
      </div>
      {showModal && showroom && (
  <div className="dealer-modal-overlay">
    <div className="dealer-modal">
      <h3>Dealer Contact Details</h3>

      <p><b>Name:</b> {showroom.name}</p>
      <p><b>Email:</b> {showroom.email}</p>
      <p><b>Phone:</b> {showroom.phone}</p>
      <p><b>Address:</b> {showroom.address}</p>

      <button onClick={() => setShowModal(false)}>
        Close
      </button>
    </div>
  </div>
)}


    </div>
  );
}
