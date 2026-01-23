import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import "./Favourites.css";

export default function Favourites() {
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

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
        const favRes = await axios.get(
          `/api/favorites/${email}`
        );

        // 2️⃣ Fetch full car details
        const cars = await Promise.all(
          favRes.data.map(async (fav) => {
            const carUrl = `/api/cars/${fav.carId}`;


            try {
              const carRes = await axios.get(carUrl);
              return {
                favId: fav.id,
                carId: fav.carId,
                carType: fav.carType,
                ...carRes.data,
              };
            } catch (err) {
              console.error(`Failed to fetch car ${fav.carId} at ${carUrl}`, err);
              return null; // skip this car if API fails
            }
          })
        );

        setFavourites(cars.filter(Boolean)); // remove nulls
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
      navigate(`/new-car/${car.carId}`);
    } else {
      navigate(`/car/${car.carId}`);
    }
  };

  /* ===============================
     REMOVE FAVOURITE
  ================================ */
  const handleRemove = async (car) => {
    try {
      await axios.delete(
        `/api/favorites/${email}/${car.carId}`
      );

      setFavourites((prev) =>
        prev.filter((item) => item.carId !== car.carId)
      );
    } catch (err) {
      console.error(`Failed to remove favourite car ${car.carId}`, err);
    }
  };

  /* ===============================
     LOADING / EMPTY STATES
  ================================ */
  if (loading) {
    return <div className="empty-msg">Loading favourites...</div>;
  }

  if (favourites.length === 0) {
    return <div className="empty-msg">No favourite cars found!</div>;
  }

  /* ===============================
     UI
  ================================ */
  return (
    <div className="favourites-page">
      <h1 className="page-title">My Favourites</h1>

      <div className="favourites-list">
        {favourites.map((car) => (
          <div
            key={car.carId}
            className="car-card"
            onClick={() => handleCarClick(car)}
          >
            {/* IMAGE */}
            <img
              src={
                car.image
                  ? `data:image/jpeg;base64,${car.image}`
                  : "/placeholder-car.jpg"
              }
              alt={car.title || `${car.brand || ""} ${car.model || ""}`}
            />

            {/* DETAILS */}
            <div className="car-card-content">
              <h3>{car.title || `${car.brand || ""} ${car.model || ""}`}</h3>
              <p>
                ₹{" "}
                {car.price
                  ? Number(car.price).toLocaleString("en-IN")
                  : "N/A"}
              </p>
            </div>

            {/* REMOVE */}
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
