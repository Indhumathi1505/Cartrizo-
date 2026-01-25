import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./info.css";

export default function ProfileInfo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
    image: null // ✅ for file upload
  });

  /* ---------------- Handle input changes ---------------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm((prev) => ({ ...prev, image: files[0] })); // store file
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* ---------------- Handle submit ---------------- */
  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      // Append text fields if they have a value
      ["fullName","email","phone","gender","state","city","pincode","address"].forEach(
        key => {
          if (form[key]) formData.append(key, form[key]);
        }
      );

      // Append image only if selected
      if (form.image) {
        formData.append("image", form.image);
      }

      const res = await fetch("http://65.2.49.242:8080/api/profile", {
        method: "POST",
        body: formData // ✅ multipart/form-data
      });

      if (!res.ok) throw new Error("API failed");

      alert("Profile saved successfully!");
      navigate("/"); // go to home page

    } catch (error) {
      console.error(error);
      alert("Backend not running or CORS issue");
    }
  };

  return (
    <div className="info-page">
      <div className="info-card">
        <h2 className="info-title">Fill your information</h2>

        <div className="form-group">
          <label>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={form.gender === "Male"}
                onChange={handleChange}
              />
              Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={form.gender === "Female"}
                onChange={handleChange}
              />
              Female
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>State</label>
          <input name="state" value={form.state} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>City</label>
          <input name="city" value={form.city} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Pincode</label>
          <input name="pincode" value={form.pincode} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} />
        </div>

        {/* ---------------- Image Upload ---------------- */}
        <div className="form-group">
          <label>Profile Image</label>
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
          {form.image && (
            <img
              src={URL.createObjectURL(form.image)}
              alt="Preview"
              className="image-preview"
            />
          )}
        </div>

        <button className="save-btn" onClick={handleSubmit}>
          Save & Continue
        </button>
      </div>
    </div>
  );
}
