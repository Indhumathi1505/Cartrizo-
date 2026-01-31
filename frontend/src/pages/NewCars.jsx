import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../UsedCars/UsedCar.css";

export default function NewCars() {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  // 🔍 TYPE SEARCH (Frontend only)
  const [search, setSearch] = useState({
    brand: "",
    color: "",
  });

  // 🎯 OTHER FILTERS
  const [filters, setFilters] = useState({
    condition: "All",
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
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const buyerEmail = loggedUser?.email;

  const toggleFavourite = async (car) => {
    if (!buyerEmail) {
      alert("Please login to add favourites");
      navigate("/login");
      return;
    }

    try {
      const carId = car.id || car._id;
      const res = await api.post("api/favorites/toggle", {
        userEmail: buyerEmail,
        carId: carId,
        carType: "NEW"
      });

      // Update state locally
      setCars(prev => prev.map(c =>
        (c.id || c._id) === carId ? { ...c, isFavourite: res.data } : c
      ));
      setFilteredCars(prev => prev.map(c =>
        (c.id || c._id) === carId ? { ...c, isFavourite: res.data } : c
      ));
    } catch (err) {
      console.error("Failed to toggle favourite", err);
    }
  };

  /* =======================
     FETCH NEW CARS
  ======================== */
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const [carsRes, favsRes] = await Promise.all([
          api.get("api/cars/new"),
          buyerEmail ? api.get(`api/favorites/${buyerEmail}`) : Promise.resolve({ data: [] })
        ]);

        const favouriteIds = new Set(favsRes.data.map(f => f.carId));

        const carsWithFav = carsRes.data.map((car) => {
          const carId = car.id || car._id;
          return {
            ...car,
            isFavourite: favouriteIds.has(carId),
          };
        });

        setCars(carsWithFav);
        setFilteredCars(carsWithFav);
      } catch (err) {
        console.error("Failed to fetch new cars:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [buyerEmail]);

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

    // 🎯 DROPDOWN FILTERS
    if (filters.condition !== "All")
      temp = temp.filter(c => c.condition === filters.condition);

    if (filters.fuelType !== "All")
      temp = temp.filter(c => c.fuelType === filters.fuelType);

    if (filters.bodyType !== "All")
      temp = temp.filter(c => c.bodyType === filters.bodyType);

    if (filters.transmission !== "All")
      temp = temp.filter(c => c.transmission === filters.transmission);

    if (filters.year !== "All")
      temp = temp.filter(c => String(c.year) === String(filters.year));

    // 💰 PRICE
    if (filters.minPrice)
      temp = temp.filter(c => c.price >= Number(filters.minPrice));

    if (filters.maxPrice)
      temp = temp.filter(c => c.price <= Number(filters.maxPrice));

    // 🚗 MILEAGE
    if (filters.minMileage)
      temp = temp.filter(c => c.mileage >= Number(filters.minMileage));

    if (filters.maxMileage)
      temp = temp.filter(c => c.mileage <= Number(filters.maxMileage));

    setFilteredCars(temp);
  }, [search, filters, cars]);

  if (loading) return <p className="loading-text">Loading new cars...</p>;

  return (
    <div className="used-cars-page">
      <h2 className="page-title">Available New Cars</h2>

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

        {/* Condition */}
        <div className="filter-section">
          <h4>Condition</h4>
          <select
            value={filters.condition}
            onChange={e =>
              setFilters({ ...filters, condition: e.target.value })
            }
          >
            <option value="All">All</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </div>

        {/* Fuel */}
        <div className="filter-section">
          <h4>Fuel Type</h4>
          <select
            value={filters.fuelType}
            onChange={e =>
              setFilters({ ...filters, fuelType: e.target.value })
            }
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
            onChange={e =>
              setFilters({ ...filters, bodyType: e.target.value })
            }
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
            onChange={e =>
              setFilters({ ...filters, transmission: e.target.value })
            }
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
            onChange={e =>
              setFilters({ ...filters, year: e.target.value })
            }
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
            onChange={e =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={e =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
          />
        </div>

        {/* Mileage */}
        <div className="filter-section">
          <h4>Mileage (km)</h4>
          <input
            type="number"
            placeholder="Min"
            value={filters.minMileage}
            onChange={e =>
              setFilters({ ...filters, minMileage: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxMileage}
            onChange={e =>
              setFilters({ ...filters, maxMileage: e.target.value })
            }
          />
        </div>
      </div>

      {/* ================= CAR GRID ================= */}
      <div className="car-grid">
        {filteredCars.length === 0 && (
          <p>No new cars match your filters</p>
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
                <img src="/assets/default-car.png" alt="No Image" />
              )}
            </div>

            <div className="car-details">
              <h3 className="car-name">{car.title}</h3>
              <p className="car-price">
                ₹ {Number(car.price).toLocaleString("en-IN")}
              </p>

              <p className="car-specs">
                {car.year} • {car.fuelType} • {car.bodyType} •{" "}
                {car.transmission} • {car.color} • {car.mileage} km
              </p>

              <button
                className="view-details-btn"
                onClick={() => navigate(`/new-car/${car.id || car._id}`)}
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
