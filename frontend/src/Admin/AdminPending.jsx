import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPending.css";

export default function AdminPendingCars() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(
    "/api/admin/cars/pending",
    {
      headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  setCars(res.data);
};


  const approveCar = async (id) => {
  const token = localStorage.getItem("token");

  await axios.put(
    `/api/admin/cars/approve/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  setSelectedCar(null);
  loadCars();
};

const rejectCar = async (id) => {
  const token = localStorage.getItem("token");

  await axios.delete(
    `/api/admin/cars/reject/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  setSelectedCar(null);
  loadCars();
};


  // ✅ Get certificate safely
  const getCertificate = (car) => {
    return (
      car.certificate ||
      car.certificateImage ||
      car.rcCertificate ||
      null
    );
  };

  return (
    <div className="admin-page">
      <h2 className="admin-heading">Pending Car Approvals</h2>

      <div className="card-grid">
        {cars.map((car) => (
          <div className="admin-card" key={car.id}>
            {car.image && (
              <img
                src={`data:image/jpeg;base64,${car.image}`}
                className="card-car-img"
                alt="Car"
              />
            )}

            <h3>{car.brand} {car.model}</h3>
            <p>₹{car.price}</p>

            <button
              className="view-btn"
              onClick={() => setSelectedCar(car)}
            >
              View Full Details
            </button>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {selectedCar && (
        <div className="modal-overlay">
          <div className="modal large">
            <h3>{selectedCar.brand} {selectedCar.model}</h3>

            {/* 🔹 Images */}
            <div className="image-row">
              {/* CAR IMAGE */}
              {selectedCar.image && (
                <div>
                  <p className="img-title">Car Image</p>
                  <img
                    src={`data:image/jpeg;base64,${selectedCar.image}`}
                    className="modal-img"
                    alt="Car"
                  />
                </div>
              )}

              {/* CERTIFICATE */}
              {getCertificate(selectedCar) ? (
                <div>
                  <p className="img-title">Certificate</p>

                  {/* Image */}
                  <img
                    src={`data:image/jpeg;base64,${getCertificate(selectedCar)}`}
                    className="modal-img"
                    alt="Certificate"
                    onError={(e) => (e.target.style.display = "none")}
                  />

                  {/* PDF fallback */}
                  <a
                    href={`data:application/pdf;base64,${getCertificate(selectedCar)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pdf-link"
                  >
                    View Certificate PDF
                  </a>
                </div>
              ) : (
                <p className="no-cert">No certificate uploaded</p>
              )}
            </div>

            {/* DETAILS */}
            <div className="details-grid">
              <p><b>Year:</b> {selectedCar.year}</p>
              <p><b>Fuel:</b> {selectedCar.fuelType}</p>
              <p><b>Transmission:</b> {selectedCar.transmission}</p>
              <p><b>KMs Driven:</b> {selectedCar.kmDriven}</p>
              <p><b>Condition:</b> {selectedCar.condition}</p>
              <p><b>Location:</b> {selectedCar.location}</p>
              <p><b>Owner Name:</b> {selectedCar.ownerName}</p>
              <p><b>Owner Phone:</b> {selectedCar.ownerPhone}</p>
              <p><b>Price:</b> ₹{selectedCar.price}</p>
            </div>

            <div className="description">
              <b>Description:</b> {selectedCar.description}
            </div>

            {/* ACTIONS */}
            <div className="action-row">
              <button className="approve" onClick={() => approveCar(selectedCar.id)}>
                Approve
              </button>
              <button className="reject" onClick={() => rejectCar(selectedCar.id)}>
                Reject
              </button>
              <button className="close" onClick={() => setSelectedCar(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
