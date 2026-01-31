import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import api from "../api/api";
import "./Favourites.css";

export default function Favourites() {
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email?.toLowerCase();

  /* ===============================
     FETCH FAVOURITES
  ================================ */
  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const fetchFavourites = async () => {
      try {
        // 1️⃣ Get favourite summary (id, carId, carType)
        const favRes = await api.get(`/api/favorites/${email}`);

        // 2️⃣ Fetch full car details
        const cars = await Promise.all(
          favRes.data.map(async (fav) => {
            try {
              const carRes = await api.get(`/api/cars/${fav.carId}`);
              return {
                favId: fav.id,
                carId: fav.carId,
                carType: fav.carType,
                ...carRes.data,
              };
            } catch (err) {
              console.error(`Failed to fetch car ${fav.carId}`, err);
              return null;
            }
          })
        );

        setFavourites(cars.filter(Boolean));
      } catch (err) {
        console.error("Failed to fetch favourites list", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [email]);

  /* ===============================
     NAVIGATION
  ================================ */
  const handleCarClick = (car) => {
    if (car.carType === "NEW") {
      navigate(`/new-car/${car.carId || car.id}`);
    } else {
      navigate(`/car/${car.carId || car.id}`);
    }
  };

  /* ===============================
     REMOVE FAVOURITE
  ================================ */
  const handleRemove = async (car) => {
    try {
      const carId = car.carId || car.id;
      await api.delete(`/api/favorites/${email}/${carId}`);

      setFavourites((prev) =>
        prev.filter((item) => (item.carId || item.id) !== carId)
      );
    } catch (err) {
      console.error(`Failed to remove favourite car`, err);
    }
  };

  if (loading) {
    return <div className="empty-msg">Loading favourites...</div>;
  }

  if (favourites.length === 0) {
    return <div className="empty-msg">No favourite cars found!</div>;
  }

  return (
    <div className="favourites-page">
      <h1 className="page-title">My Favourites</h1>

      <div className="favourites-list">
        {favourites.map((car) => (
          <div
            key={car.carId || car.id}
            className="car-card"
            onClick={() => handleCarClick(car)}
          >
            <img
              src={
                car.image
                  ? `data:image/jpeg;base64,${car.image}`
                  : "/placeholder-car.jpg"
              }
              alt={car.title || `${car.brand || ""} ${car.model || ""}`}
            />

            <div className="car-card-content">
              <h3>{car.title || `${car.brand || ""} ${car.model || ""}`}</h3>
              <p>
                ₹{" "}
                {car.price
                  ? Number(car.price).toLocaleString("en-IN")
                  : "N/A"}
              </p>
            </div>

            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(car);
              }}
            >
              <FaTrashAlt /> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
