import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/therapist.css";

/* SOCKET CONNECTION */
const socket = io("http://localhost:5000");

function Therapists() {

  const [therapists, setTherapists] =
    useState([]);

  const navigate = useNavigate();

  /* FETCH THERAPISTS */
  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/therapist"
      );

      setTherapists(res.data);

    } catch (err) {

      console.log(err);

    }
  };

  /* CHECK DOCTOR AVAILABILITY */
  const checkAvailability = (slot) => {

    const now = new Date();

    const currentHour =
      now.getHours();

    const [start, end] =
      slot.split("-");

    const convertTo24Hour =
      (time) => {

      let hour = parseInt(time);

      if (
        time.includes("PM") &&
        hour !== 12
      ) {
        hour += 12;
      }

      if (
        time.includes("AM") &&
        hour === 12
      ) {
        hour = 0;
      }

      return hour;
    };

    const startHour =
      convertTo24Hour(start.trim());

    const endHour =
      convertTo24Hour(end.trim());

    return (
      currentHour >= startHour &&
      currentHour < endHour
    );
  };

  /* BOOK SESSION */
  const bookSession = async (
    therapistId
  ) => {

    try {

      const res = await axios.post(
        "http://localhost:5000/api/therapist/book",
        {
          user_id: 1,
          therapist_id: therapistId,
        }
      );

      /* SEND REALTIME ALERT TO DOCTOR */
      socket.emit("bookSession", {
        doctorId: therapistId,
        user: "Patient",
      });

      /* GO TO CHAT PAGE */
      navigate(
        `/therapistchat/${res.data.sessionId}`
      );

    } catch (err) {

      console.log(err);

      alert("Booking failed");
    }
  };

  return (
    <div className="therapist-page">

      <h1>
        🩺 Available Therapists
      </h1>

      <div className="therapist-grid">

        {therapists.map(
          (therapist) => (

          <div
            className="therapist-card"
            key={therapist.id}
          >

            {/* DOCTOR NAME */}
            <h2 className="doctor-name">
              👩‍⚕️ {therapist.name}
            </h2>

            {/* SPECIALIZATION */}
            <p>
              <strong>
                Specialization:
              </strong>{" "}
              {
                therapist.specialization
              }
            </p>

            {/* EXPERIENCE */}
            <p>
              <strong>
                Experience:
              </strong>{" "}
              {
                therapist.experience
              }
            </p>

            {/* ABOUT */}
            <p className="about-text">
              {therapist.about}
            </p>

            {/* TIME */}
            <p>
              🕒{" "}
              <strong>
                Available:
              </strong>{" "}
              {therapist.slots}
            </p>

            {/* STATUS */}
            <p
              className={
                checkAvailability(
                  therapist.slots
                )
                  ? "online"
                  : "offline"
              }
            >

              {checkAvailability(
                therapist.slots
              )
                ? "🟢 Online"
                : "🔴 Offline"}

            </p>

            {/* BUTTON */}
            <button
              className="book-btn"

              disabled={
                !checkAvailability(
                  therapist.slots
                )
              }

              onClick={() =>
                bookSession(
                  therapist.id
                )
              }
            >

              {checkAvailability(
                therapist.slots
              )
                ? "Book Session"
                : "Unavailable"}

            </button>

          </div>
        ))}

      </div>
    </div>
  );
}

export default Therapists;