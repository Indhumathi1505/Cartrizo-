import { useNavigate, useParams} from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";


export default function BrandCars() {
  const { brand } = useParams();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/cars/brand/${brand}`)
      .then(res => {
        setCars(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Brand fetch failed", err);
        setLoading(false);
      });
  }, [brand]);

  if (loading) return <p>Loading {brand} cars...</p>;

  return (
    <div className="used-cars-page">
      <h2 className="page-title">{brand.toUpperCase()} Cars</h2>

      <div className="car-grid">
        {cars.length === 0 && <p>No cars found</p>}

        {cars.map(car => (
          <div className="car-card" key={car.id || car._id}>
            <div className="car-image-box">
              <img
                src={`data:image/jpeg;base64,${car.image}`}
                alt={car.title}
              />
            </div>

            <div className="car-price">
              <h3>{car.title || `${car.brand} ${car.model}`}</h3>
              <p className="car-price">
                ₹ {Number(car.price).toLocaleString("en-IN")}
              </p>

              <button
                className="view-details-btn"
                onClick={() => {
                  if (car.condition === "New") {
                    navigate(`/new-car/${car.id || car._id}`);
                  } else {
                    navigate(`/car/${car.id || car._id}`);
                  }
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
