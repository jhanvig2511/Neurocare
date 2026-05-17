import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function TherapistChat() {
  const { sessionId } = useParams();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // ✅ move function INSIDE useEffect (BEST FIX for CI builds)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/therapist/messages/${sessionId}`
        );
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => clearInterval(interval);

  }, [sessionId]);

  const sendMessage = async () => {
    if (!input) return;

    try {
      await axios.post(
        "http://localhost:5000/api/therapist/message",
        {
          session_id: sessionId,
          sender: "user",
          message: input,
        }
      );

      setInput("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chat-container">
      <h2>💬 Therapist Chat</h2>

      <div className="chat-box">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={msg.sender === "user" ? "user-msg" : "doctor-msg"}
          >
            {msg.message}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default TherapistChat;