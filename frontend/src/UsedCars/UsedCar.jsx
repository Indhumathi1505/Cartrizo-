import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./UsedCar.css";

export default function UsedCars() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  // 🔎 TYPE SEARCH (Frontend only)
  const [search, setSearch] = useState({
    brand: "",
    color: "",
  });

  // 🎯 DROPDOWN + RANGE FILTERS
  const [filters, setFilters] = useState({
    fuelType: "All",
    bodyType: "All",
    transmission: "All",
    year: "All",
    minPrice: "",
    maxPrice: "",
    minMileage: "",
    maxMileage: "",
  });

  /* =======================
     FAVOURITES
  ======================== */
  const getFavourites = () =>
    JSON.parse(localStorage.getItem("favourites")) || [];

  const saveFavourites = (favs) =>
    localStorage.setItem("favourites", JSON.stringify(favs));

  const toggleFavourite = (car) => {
    let favs = getFavourites();
    const carId = car.id || car._id;

    const exists = favs.some(
      (f) => (f.id || f._id) === carId
    );

    if (exists) {
      favs = favs.filter(
        (f) => (f.id || f._id) !== carId
      );
      car.isFavourite = false;
    } else {
      favs.push({ ...car, isFavourite: true });
      car.isFavourite = true;
    }

    saveFavourites(favs);
    setFilteredCars([...filteredCars]);
  };

  /* =======================
     FETCH USED CARS (NO BACKEND CHANGE)
  ======================== */
  useEffect(() => {
    api.get("/api/cars/used")
      .then((res) => {
        const favs = getFavourites();

        const carsWithFav = res.data.map((car) => {
          const carId = car.id || car._id;
          return {
            ...car,
            isFavourite: favs.some(
              (f) => (f.id || f._id) === carId
            ),
          };
        });

        setCars(carsWithFav);
        setFilteredCars(carsWithFav);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch used cars:", err);
        setLoading(false);
      });
  }, []);

  /* =======================
     FILTER + SEARCH LOGIC
     (100% FRONTEND)
  ======================== */
  useEffect(() => {
    let temp = [...cars];

    // 🔍 TYPE SEARCH
    if (search.brand.trim() !== "") {
      temp = temp.filter(c =>
        c.brand?.toLowerCase().includes(search.brand.toLowerCase())
      );
    }

    if (search.color.trim() !== "") {
      temp = temp.filter(c =>
        c.color?.toLowerCase().includes(search.color.toLowerCase())
      );
    }

    // 🎯 DROPDOWNS
    if (filters.fuelType !== "All")
      temp = temp.filter(c => c.fuelType === filters.fuelType);

    if (filters.bodyType !== "All")
      temp = temp.filter(c => c.bodyType === filters.bodyType);

    if (filters.transmission !== "All")
      temp = temp.filter(c => c.transmission === filters.transmission);

    if (filters.year !== "All")
      temp = temp.filter(c => String(c.year) === String(filters.year));

    // 💰 RANGE
    if (filters.minPrice)
      temp = temp.filter(c => c.price >= Number(filters.minPrice));

    if (filters.maxPrice)
      temp = temp.filter(c => c.price <= Number(filters.maxPrice));

    if (filters.minMileage)
      temp = temp.filter(c => c.mileage >= Number(filters.minMileage));

    if (filters.maxMileage)
      temp = temp.filter(c => c.mileage <= Number(filters.maxMileage));

    setFilteredCars(temp);
  }, [search, filters, cars]);

  if (loading) return <p className="loading-text">Loading used cars...</p>;

  return (
    <div className="used-cars-page">
      <h2 className="page-title">Available Used Cars</h2>

      <button className="filter-btn" onClick={() => setShowFilter(true)}>
        Filter Cars
      </button>

      {/* ================= FILTER PANEL ================= */}
      <div className={`slide-filter ${showFilter ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setShowFilter(false)}>
          &times;
        </button>

        {/* 🔍 Brand Search */}
        <div className="filter-section">
          <h4>Brand</h4>
          <input
            type="text"
            placeholder="Type brand name..."
            value={search.brand}
            onChange={(e) =>
              setSearch({ ...search, brand: e.target.value })
            }
          />
        </div>

        {/* 🔍 Color Search */}
        <div className="filter-section">
          <h4>Color</h4>
          <input
            type="text"
            placeholder="Type color..."
            value={search.color}
            onChange={(e) =>
              setSearch({ ...search, color: e.target.value })
            }
          />
        </div>

        {/* Fuel */}
        <div className="filter-section">
          <h4>Fuel Type</h4>
          <select
            value={filters.fuelType}
            onChange={e => setFilters({ ...filters, fuelType: e.target.value })}
          >
            <option value="All">All</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
          </select>
        </div>

        {/* Body */}
        <div className="filter-section">
          <h4>Body Type</h4>
          <select
            value={filters.bodyType}
            onChange={e => setFilters({ ...filters, bodyType: e.target.value })}
          >
            <option value="All">All</option>
            {[...new Set(cars.map(c => c.bodyType))].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div className="filter-section">
          <h4>Transmission</h4>
          <select
            value={filters.transmission}
            onChange={e => setFilters({ ...filters, transmission: e.target.value })}
          >
            <option value="All">All</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>

        {/* Year */}
        <div className="filter-section">
          <h4>Year</h4>
          <select
            value={filters.year}
            onChange={e => setFilters({ ...filters, year: e.target.value })}
          >
            <option value="All">All</option>
            {[...new Set(cars.map(c => c.year))]
              .sort((a, b) => b - a)
              .map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
          </select>
        </div>

        {/* Price */}
        <div className="filter-section">
          <h4>Price (₹)</h4>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </div>

        {/* Mileage */}
        <div className="filter-section">
          <h4>Mileage (km)</h4>
          <input
            type="number"
            placeholder="Min"
            value={filters.minMileage}
            onChange={e => setFilters({ ...filters, minMileage: e.target.value })}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxMileage}
            onChange={e => setFilters({ ...filters, maxMileage: e.target.value })}
          />
        </div>
      </div>

      {/* ================= CAR GRID ================= */}
      <div className="car-grid">
        {filteredCars.length === 0 && (
          <p>No used cars match your filters</p>
        )}

        {filteredCars.map(car => (
          <div className="car-card" key={car.id || car._id}>
            <div
              className="favourite-icon"
              onClick={() => toggleFavourite(car)}
            >
              {car.isFavourite ? "❤️" : "🤍"}
            </div>

            <div className="car-image-box">
              {car.image ? (
                <img
                  src={`data:image/jpeg;base64,${car.image}`}
                  alt={car.title}
                />
              ) : (
                <img src="/assets/default-car.png" alt="No car" />
              )}
            </div>

            <div className="car-details">
             <h3 className="car-name">
  {car.title || `${car.brand} ${car.model}`}
</h3>

              <p className="car-price">
                ₹ {Number(car.price).toLocaleString("en-IN")}
              </p>

              <p className="car-specs">
                {car.year} • {car.fuelType} • {car.bodyType} •{" "}
                {car.transmission} • {car.color} • {car.mileage} km
              </p>

              <button
                className="view-details-btn"
                onClick={() => navigate(`/car/${car.id || car._id}`)}
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
