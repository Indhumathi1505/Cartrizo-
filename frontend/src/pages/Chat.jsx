import { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import api from "../api/api";
import "./Chat.css";

const SOCKET_URL = "/ws";

export default function Chat({
  carId,
  user,        // logged-in email (buyer or seller)
  role,        // "BUYER" or "SELLER"
  receiver,
  buyerEmail: propBuyerEmail,
  sellerEmail: propSellerEmail
}) {

  // ================= BASIC SAFETY =================
  const username = user?.toLowerCase();
  const target = receiver?.toLowerCase();



  const finalBuyerEmail =
    role === "BUYER" ? username : target;

  const finalSellerEmail =
    role === "SELLER" ? username : target;




  // ================= STATE =================
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);

  const clientRef = useRef(null);
  const bottomRef = useRef(null);

  // =================================================
  // 1️⃣ LOAD CHAT HISTORY (VERY IMPORTANT FOR REFRESH)
  // =================================================
  useEffect(() => {
    if (!carId || !username || !target) return;

<<<<<<< HEAD
  // BUYER
  if (role === "BUYER") {
    api.get("/api/chat/buyer", {
      params: {
        carId,
        sellerEmail: receiver,
        buyerEmail: username
      },
      withCredentials: true
    })
    .then(res => setMessages(res.data))
    .catch(err => console.error("Load buyer chat error", err));
  }

  // SELLER
  if (role === "SELLER") {
    api.get("/api/chat/buyer", {
      params: {
        carId,
        sellerEmail: username,
        buyerEmail: receiver
      },
      withCredentials: true
    })
    .then(res => setMessages(res.data))
    .catch(err => console.error("Load seller chat error", err));
  }
=======
    // BUYER
    if (role === "BUYER") {
      api.get("api/chat/buyer", {
        params: {
          carId,
          sellerEmail: target,
          buyerEmail: username
        }
      })
        .then(res => setMessages(res.data))
        .catch(err => console.error("Load buyer chat error", err));
    }

    // SELLER
    if (role === "SELLER") {
      api.get("api/chat/buyer", {
        params: {
          carId,
          sellerEmail: username,
          buyerEmail: target
        }
      })
        .then(res => setMessages(res.data))
        .catch(err => console.error("Load seller chat error", err));
    }
>>>>>>> 8922237 (msg)

  }, [carId, username, target, role]);




  // =====================================
  // 2️⃣ WEBSOCKET CONNECTION (REAL-TIME)
  // =====================================
  // =====================================
  // 2️⃣ WEBSOCKET CONNECTION (REAL-TIME) - FIXED
  // =====================================
  useEffect(() => {
    if (!carId || !username || !target) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      debug: (str) => console.log("STOMP DEBUG:", str),
    });

    client.onConnect = () => {
      console.log("✅ Connected to WebSocket");
      setConnected(true);

      const safeEmail = username.replace(/\./g, "_");
      client.subscribe(`/topic/chat/${carId}/${safeEmail}`, (msg) => {
        const body = JSON.parse(msg.body);
        setMessages((prev) => [...prev, body]);
      });
    };

    client.onDisconnect = () => setConnected(false);
    client.activate();
    clientRef.current = client;

    return () => {
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [carId, username, target]);


  // ================= AUTO SCROLL =================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= SEND MESSAGE =================
  // ================= SEND MESSAGE =================
  const sendMessage = e => {
    e.preventDefault();
    if (!connected || !text.trim()) return;

    const payload = {
      carId,
      message: text,
      sender: username,
      buyerEmail: finalBuyerEmail,
      sellerEmail: finalSellerEmail
    };


    console.log("📤 Sending payload:", payload);

    clientRef.current.publish({
      destination: `/app/chat/${carId}`,
      body: JSON.stringify(payload)
    });

    setText("");
  };



  // ================= FILTER DISPLAY =================




  const displayedMessages = messages.filter(
    m =>
      m.carId === carId &&
      (
        (m.buyerEmail?.toLowerCase() === username && m.sellerEmail?.toLowerCase() === target) ||
        (m.buyerEmail?.toLowerCase() === target && m.sellerEmail?.toLowerCase() === username)
      )
  );






  if (!user) {
    return <div className="chat-error">Please login</div>;
  }


  // ================= UI =================
  return (
    <div className="chat-container">

      <div className="chat-header">
        <span>
          Chat with {target}
        </span>

        <span className={connected ? "online" : "offline"}>
          {connected ? "● Online" : "● Connecting"}
        </span>
      </div>

      <div className="chat-body">
        {displayedMessages.map((m) => (
          <div
            key={m.id || m._id || m.timestamp}
            className={`chat-message ${m.sender === username ? "me" : "other"}`}
          >

            <b>{m.sender}</b>
            <p>{m.message}</p>
            <small>
              {m.timestamp ? new Date(m.timestamp).toLocaleString() : ""}
            </small>

          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-footer" onSubmit={sendMessage}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          disabled={!connected}
        />
        <button disabled={!connected || !text.trim()}>
          Send
        </button>
      </form>

    </div>
  );
}
