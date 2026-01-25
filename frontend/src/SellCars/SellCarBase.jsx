import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Home/Navbar";
import sellimage from "../assets/car.jpg";
import "./SellCar.css";

export default function SellCarBase({ mode }) {
  const navigate = useNavigate();

  /* ================= AUTO MODE ================= */
  const isUsed = mode === "USED";
  const sellerType = isUsed ? "USER" : "SHOWROOM";

  const [car, setCar] = useState({
    title: "",
    bodyType: "",
    model: "",
    year: "",
    exteriorColor: "",
    description: "",
    fuelType: "",
    mileage: "",
    engineCapacity: "",
    price: "",
    condition: isUsed ? "Used" : "New",
    imageFile: null,
    certificateFile: null,
    features: [],
  });

  /* LOCK CONDITION BASED ON PAGE */
  useEffect(() => {
    setCar((prev) => ({
      ...prev,
      condition: isUsed ? "Used" : "New",
    }));
  }, [isUsed]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCar({ ...car, [name]: value });
  };

  const handleFeatureChange = (feature) => {
    setCar((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleFileChange = (e) => {
    setCar({ ...car, imageFile: e.target.files[0] });
  };

  const handleCertificateChange = (e) => {
    setCar({ ...car, certificateFile: e.target.files[0] });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!car.imageFile) {
      alert("Please upload car image");
      return;
    }

    if (isUsed && !car.certificateFile) {
      alert("RC / Insurance is mandatory for used cars");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("title", car.title);
      formData.append("bodyType", car.bodyType || "");
      formData.append("model", car.model);
      formData.append("year", Number(car.year));
      formData.append("fuelType", car.fuelType || "");
      formData.append("price", Number(car.price));
      formData.append("mileage", Number(car.mileage) || 0);
      formData.append("engineCapacity", Number(car.engineCapacity) || 0);
      formData.append("description", car.description || "");
      formData.append("condition", car.condition);
      formData.append("exteriorColor", car.exteriorColor || "");
      car.features.forEach((f) => formData.append("features", f));
      formData.append("image", car.imageFile);
      formData.append("sellerType", sellerType);
      formData.append("status", "PENDING");

      if (isUsed) {
        formData.append("certificate", car.certificateFile);
        formData.append("sellerId", localStorage.getItem("sellerId"));
      }

      const res = await fetch("http://65.2.49.242:8080/api/cars/add", {
        method: "POST",
        headers:
          sellerType === "SHOWROOM"
            ? { Authorization: `Bearer ${localStorage.getItem("showroomToken")}` }
            : {},
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      alert("Car sent for admin approval");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  /* ================= UI (UNCHANGED) ================= */
  return (
    <div className="sell-layout">
      <Navbar />
      <div className="sell-page">
        <form className="sell-form" onSubmit={handleSubmit}>
          {/* LEFT */}
          <div className="sell-left">
            <h2>Sell Your Car</h2>
            <p className="breadcrumb">
              {isUsed ? "User - Used Car" : "Showroom - New Car"}
            </p>
            <img src={sellimage} alt="car" />
          </div>

          {/* RIGHT (YOUR FULL FORM STAYS) */}
          <div className="sell-right">
            <section>
              <h3>Car Details</h3>

              <input
                name="title"
                placeholder="Title"
                value={car.title}
                onChange={handleChange}
                required
              />

              <input
                name="model"
                placeholder="Model"
                value={car.model}
                onChange={handleChange}
                required
              />

              <p><b>Condition:</b> {car.condition}</p>
            </section>

            <section>
              <h3>Upload Image</h3>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </section>

            {isUsed && (
              <section>
                <h3>Upload Certificate (RC / Insurance)</h3>
                <input type="file" onChange={handleCertificateChange} />
              </section>
            )}

            <button type="submit" className="submit-btn">
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
