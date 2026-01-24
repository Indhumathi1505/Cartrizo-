import { useEffect, useState } from "react";
import api from "../api/api";
import Chat from "./Chat";
import "./SellerInbox.css";

export default function SellerInbox() {
  const [inboxes, setInboxes] = useState({});
  const [selectedCar, setSelectedCar] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState("");

  // ✅ Correct way
 const loggedUser = JSON.parse(localStorage.getItem("user"));
const sellerEmail = loggedUser?.email;
const sellerName = loggedUser?.name;


  /* ---------------- LOAD INBOXES ---------------- */
  useEffect(() => {
    if (!sellerEmail){
      console.error("Seller name not found in localStorage");
      return;
    }

    api
      .get(`/api/chat/seller/${sellerEmail}`)
      .then(res => setInboxes(res.data))
      .catch(err =>
        console.error("Failed to load seller inbox:", err)
      );
  }, [sellerEmail]);

  /* ---------------- BUYERS FOR SELECTED CAR ---------------- */
  const buyers = selectedCar
  ? inboxes[selectedCar] || []
  : [];

  /* ---------------- AUTO SELECT FIRST BUYER ---------------- */
  useEffect(() => {
    if (buyers.length > 0) {
      setSelectedBuyer(buyers[0]);
    }
  }, [buyers]);

  /* ---------------- GUARD ---------------- */
  if (!sellerName) {
    return (
      <div className="seller-inbox-container">
        <h3>Please login as seller</h3>
      </div>
    );
  }

  return (
    <div className="seller-inbox-container">
      <h2>Seller Inbox for {sellerName}</h2>

      {/* CAR LIST */}
      <div className="car-list">
        <h3>Your Cars</h3>

        {Object.keys(inboxes).length === 0 && (
          <p>No messages yet</p>
        )}

        {Object.keys(inboxes).map(carId => (
          <button
            key={carId}
            className={carId === selectedCar ? "active" : ""}
            onClick={() => setSelectedCar(carId)}
          >
            Car {carId}
          </button>
        ))}
      </div>

      {/* BUYER LIST */}
      {buyers.length > 0 && (
        <div className="buyer-list">
          <h3>Buyers</h3>

          {buyers.map(buyer => (
            <button
              key={buyer}
              className={buyer === selectedBuyer ? "active" : ""}
              onClick={() => setSelectedBuyer(buyer)}
            >
              {buyer}
            </button>
          ))}
        </div>
      )}

      {/* CHAT */}
      {selectedCar && selectedBuyer && (
        <div className="chat-section">
          <h4>
            Chat with <b>{selectedBuyer}</b> for Car {selectedCar}
          </h4>
          <Chat
  carId={selectedCar}
  user={sellerEmail}
  role="SELLER"
  receiver={selectedBuyer}
  buyerEmail={selectedBuyer}   // ✅ explicit
  sellerEmail={sellerEmail}    // ✅ explicit
/>


    

        </div>
      )}
    </div>
  );
}
