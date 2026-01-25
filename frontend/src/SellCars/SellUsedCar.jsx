import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Home/Navbar";
import sellimage from "../assets/car.jpg";
import "./SellCar.css";

export default function SellUsedCar() {
  const navigate = useNavigate();

  const [car, setCar] = useState({
    title: "",
     brand: "", 
    bodyType: "",
    model: "",
    year: "",
    exteriorColor: "",
    description: "",
    fuelType: "",
    mileage: "",
    engineCapacity: "",
    price: "",
    condition: "Used",
    imageFile: null,
    certificateFile: null,
    imagePreview: null,
    certificatePreview: null,
    features: [],
  });

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

  // Image preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCar({ ...car, imageFile: file, imagePreview: URL.createObjectURL(file) });
    }
  };

  // Certificate preview
  const handleCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCar({ ...car, certificateFile: file, certificatePreview: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!car.imageFile) {
    alert("Please upload car image");
    return;
  }

  if (!car.certificateFile) {
    alert("RC / Insurance is mandatory for used cars");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("title", car.title);
    formData.append("brand", car.brand);
    formData.append("bodyType", car.bodyType);
    formData.append("model", car.model);
    formData.append("year", Number(car.year));
    formData.append("fuelType", car.fuelType);
    formData.append("price", Number(car.price));
    formData.append("mileage", Number(car.mileage) || 0);
    formData.append("engineCapacity", Number(car.engineCapacity) || 0);
    formData.append("description", car.description);
    formData.append("condition", car.condition);
    formData.append("exteriorColor", car.exteriorColor);
    car.features.forEach((f) => formData.append("features", f));
    formData.append("image", car.imageFile);
    formData.append("certificate", car.certificateFile);
    formData.append("sellerType", "USER");

    const token = localStorage.getItem("token");

if (!token) {
  alert("You must be logged in to sell a car");
  return;
}

const res = await fetch("http://65.2.49.242:8080/api/cars/add", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: formData
});

    if (!res.ok) throw new Error("Upload failed");

    alert("Car sent for admin approval");
    navigate("/");
  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }
};


  return (
    <div className="sell-layout">
      <Navbar />
      <div className="sell-page">
        <form className="sell-form" onSubmit={handleSubmit}>
          {/* LEFT */}
          <div className="sell-left">
            <h2>Sell Your Used Car</h2>
            <p className="breadcrumb">User - Used Car</p>
            <img src={sellimage} alt="car" />
          </div>

          {/* RIGHT */}
          <div className="sell-right">
            <section>
              <h3>Car Details</h3>
              <input name="title" placeholder="Title" value={car.title} onChange={handleChange} required />
              <input
  name="brand"
  placeholder="Brand (Honda, BMW, etc)"
  value={car.brand}
  onChange={handleChange}
  required
/>

              <input name="model" placeholder="Model" value={car.model} onChange={handleChange} required />
              <input name="year" type="number" placeholder="Year" value={car.year} onChange={handleChange} />
              <input name="bodyType" placeholder="Body Type" value={car.bodyType} onChange={handleChange} />
              <input name="fuelType" placeholder="Fuel Type" value={car.fuelType} onChange={handleChange} />
              <input name="mileage" type="number" placeholder="Mileage (km)" value={car.mileage} onChange={handleChange} />
              <input name="engineCapacity" type="number" placeholder="Engine Capacity (cc)" value={car.engineCapacity} onChange={handleChange} />
              <input name="price" type="number" placeholder="Price" value={car.price} onChange={handleChange} required />
              <input name="exteriorColor" placeholder="Exterior Color" value={car.exteriorColor} onChange={handleChange} />
              <textarea name="description" placeholder="Description" value={car.description} onChange={handleChange} />

              <p><b>Features:</b></p>
              <div className="features-grid">
  {[
    // Comfort
    "Air Conditioning",
    "Power Steering",
    "Power Windows",
    "Automatic Climate Control",
    "Rear AC Vents",

    // Safety
    "ABS",
    "Airbags",
    "Traction Control",
    "Hill Assist",
    "ISOFIX Child Seat Mounts",

    // Technology
    "Navigation System",
    "Touchscreen Display",
    "Bluetooth",
    "Apple CarPlay / Android Auto",
    "USB Charging",

    // Exterior
    "Alloy Wheels",
    "Fog Lamps",
    "LED Headlamps",
    "Sunroof",

    // Convenience
    "Keyless Entry",
    "Push Button Start",
    "Cruise Control",
    "Parking Sensors",
    "Rear View Camera"
  ].map((f) => (
    <label className="feature-item" key={f}>
      <input
        type="checkbox"
        checked={car.features?.includes(f)}
        onChange={() => handleFeatureChange(f)}
      />
      {f}
    </label>
  ))}
</div>


              <p><b>Condition:</b> {car.condition}</p>
            </section>

            <section>
              <h3>Upload Image</h3>
              <div className="image-upload-box">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {car.imagePreview && <img className="image-preview" src={car.imagePreview} alt="preview" />}
              </div>
            </section>

            <section>
              <h3>Upload Certificate (RC / Insurance)</h3>
              <div className="image-upload-box">
                <input type="file" onChange={handleCertificateChange} />
                {car.certificatePreview && <img className="image-preview" src={car.certificatePreview} alt="certificate" />}
              </div>
            </section>

            <button type="submit" className="submit-btn">Submit for Approval</button>
          </div>
        </form>
      </div>
    </div>
  );
}
