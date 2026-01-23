import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../Home/Navbar";
import Footer from "../Footer/Footer";
import "./Home.css";

/* ==== Images ==== */
import hero from "../assets/hero.jpg";
import audi from "../assets/brands/honda.png";
import bmw from "../assets/brands/bmw.jpg";
import lamborghini from "../assets/brands/lamborghini.jpg";
import ford from "../assets/brands/ford.jpg";
import suzuki from "../assets/brands/suzuki.jpg";
import honda from "../assets/brands/honda.png";
import toyota from "../assets/brands/toyota.jpg";
import bentley from "../assets/brands/bentley.png";
import mercedes from "../assets/brands/mercedes.png";
import jaguar from "../assets/brands/jaguar.png";

import api from "../api/api";

/* ==== Brand Data ==== */
const BRANDS = [
  { name: "Audi", src: audi },
  { name: "BMW", src: bmw },
  { name: "Lamborghini", src: lamborghini },
  { name: "Ford", src: ford },
  { name: "Suzuki", src: suzuki },
  { name: "Honda", src: honda },
  { name: "Toyota", src: toyota },
  { name: "Bentley", src: bentley },
  { name: "Mercedes", src: mercedes },
  { name: "Jaguar", src: jaguar },
];

const slugify = (name) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

export default function Home() {
  const navigate = useNavigate();
  const brandsRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false); // ✅ dropdown state
  const [recommendedCars, setRecommendedCars] = useState([]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setSellOpen(false); // close dropdown when menu closes
  };

  /* ===== Fetch Recommended Cars (NO backend change) ===== */
 useEffect(() => {
  api
    .get("/api/cars/recommended")
    .then((res) => setRecommendedCars(res.data))
    .catch((err) =>
      console.error("Failed to load recommended cars", err)
    );
}, []);


  return (
    <div className="cartrizo-root">
      {/* ===== SIDE MENU ===== */}
      <div className={`side-menu ${menuOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleMenu}>✖</button>
        <h2 className="menu-title">Cartrizo</h2>

        <ul className="menu-items">
          <li>
            <Link to="/" onClick={toggleMenu}>🏠 Home</Link>
          </li>

          <li>
            <Link to="/new-cars" onClick={toggleMenu}>🚗 New cars</Link>
          </li>

          <li>
            <Link to="/used-cars" onClick={toggleMenu}>🚘 Used cars</Link>
          </li>

          {/* ===== SELL CARS DROPDOWN ===== */}
          <li className={`dropdown ${sellOpen ? "open" : ""}`}>
            <div
              className="dropdown-title"
              onClick={() => setSellOpen(!sellOpen)}
            >
              💰 Sell Cars
              <span className="arrow">{sellOpen ? "▴" : "▾"}</span>
            </div>

            <ul className="dropdown-menu">
              <li>
                <Link to="/sell-role" onClick={toggleMenu}>
                  Sell Your Car
                </Link>
              </li>
              <li>
                <Link to="/seller/inbox" onClick={toggleMenu}>
                  Seller Dashboard
                </Link>
              </li>
            </ul>
          </li>

          <li>
            <Link to="/favourites" onClick={toggleMenu}>❤️ Favourites</Link>
          </li>

          <li>
            <Link to="/rate-us" onClick={toggleMenu}>⭐ Rate us</Link>
          </li>
        </ul>
      </div>

      {/* ===== NAVBAR ===== */}
      <Navbar toggleMenu={toggleMenu} />

      {/* ===== HERO ===== */}
      <div className="home">
        <div className="hero-container">
          <img src={hero} alt="Cars" className="hero-image" />
          <div className="overlay"></div>

          <div className="hero-content">
            <h1>
              Find Your <span>Perfect Car</span><br />
              Drive with Confidence
            </h1>
          </div>
        </div>
      </div>

      {/* ===== BRANDS ===== */}
      <section className="brands-shell" ref={brandsRef}>
        <h2 className="explore">Explore by Brand</h2>
        <p className="explore-sub">
          Choose from top automobile manufacturers worldwide
        </p>

        <div className="brands-grid">
          {BRANDS.map((b) => (
           <Link
  to={`/brand/${b.name.trim().toUpperCase()}`}
  className="brand-card"
  key={b.name}
>

              <img src={b.src} alt={b.name} />
              <span>{b.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== RECOMMENDED CARS ===== */}
      <section className="recommended-cars">
        <h2 className="explore">Recommended Cars</h2>

        <div className="car-cards">
          {recommendedCars.map((car) => (
            <div className="car-card" key={car.id || car._id}>
              <img
                src={`data:image/jpeg;base64,${car.image}`}
                alt={car.title}
              />

              <h3 className="name">{car.title}</h3>

              <p className="price">
                Rs. {Number(car.price).toLocaleString("en-IN")}
              </p>

              <p className="location">{car.condition}</p>

              <div className="car-info">
                <span>{car.year}</span>
                <span>{car.fuelType}</span>
                <span>{car.bodyType}</span>
              </div>

              <button
                className="view-details-btn"
                onClick={() => navigate(`/car/${car.id || car._id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
