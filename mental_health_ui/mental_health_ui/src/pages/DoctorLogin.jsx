import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DoctorLogin() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const navigate = useNavigate();

  const login = async () => {

    try {

      const res = await axios.post(
        "http://localhost:5000/api/therapist/doctor-login",
        {
          email,
          password,
        }
      );

      if (res.data.success) {

        localStorage.setItem(
          "doctor",
          JSON.stringify(res.data.doctor)
        );

        navigate("/doctor");

      } else {

        alert("Invalid Login");
      }

    } catch (err) {

      console.log(err);
    }
  };

  return (
    <div style={{ padding: "40px" }}>

      <h1>Doctor Login</h1>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br /><br />

      <button onClick={login}>
        Login
      </button>

    </div>
  );
}

export default DoctorLogin;