import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css";

/* 🌐 BACKEND URL */
const BASE_URL = "https://neurocare-backend-3k89.onrender.com";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    location: "",
    occupation: "",
    education: "",
    priorSupport: "",
    therapyHistory: "",
    challenges: [],
    stressLevel: 5,
    goals: "",
    preferences: [],
    emergencyName: "",
    emergencyPhone: "",
  });

  const totalSteps = 4;

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  /* =========================
     VALIDATION
  ========================= */
  const validateStep = () => {
    if (step === 1) {
      if (
        !formData.name ||
        !formData.email ||
        !formData.password
      ) {
        setError("Please fill in all required fields");
        return false;
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }

      if (formData.password.length < 6) {
        setError(
          "Password must be at least 6 characters long"
        );
        return false;
      }
    }

    return true;
  };

  /* =========================
     NEXT STEP
  ========================= */
  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      setError("");
    }
  };

  /* =========================
     COMPLETE REGISTRATION
  ========================= */
  const handleCompleteRegistration = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/register-complete`,
        formData
      );

      if (response.data.token) {
        localStorage.setItem(
          "token",
          response.data.token
        );

        localStorage.setItem(
          "userId",
          response.data.user.id
        );

        localStorage.setItem(
          "userName",
          response.data.user.name
        );

        alert(
          "Registration Complete! Welcome to NeuroCare 🌿"
        );

        navigate("/user-dashboard");
      }
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     STEP INFO
  ========================= */
  const stepInfo = [
    {
      title: "Personal Info",
      desc: "Tell us about yourself",
    },
    {
      title: "Background",
      desc: "Your experience",
    },
    {
      title: "Mental Health",
      desc: "Your journey",
    },
    {
      title: "Preferences",
      desc: "Final touches",
    },
  ];

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">

          {/* HEADER */}
          <div className="register-header">
            <button
              onClick={() => navigate("/")}
              className="close-btn"
            >
              ✕
            </button>

            <h1>Welcome to NeuroCare 🌿</h1>

            <h3>
              {stepInfo[step - 1].title}
            </h3>

            <p>
              {stepInfo[step - 1].desc}
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="error-banner">
              ⚠️ {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="form-section">

              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />

            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="form-section">

              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
              />

              <label>Gender</label>
              <input
                type="text"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              />

              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />

            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="form-section">

              <label>Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
              />

              <label>Education</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
              />

              <label>Goals</label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleChange}
              />

            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="form-section">

              <label>Emergency Contact Name</label>
              <input
                type="text"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
              />

              <label>Emergency Contact Phone</label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
              />

            </div>
          )}

          {/* FOOTER */}
          <div className="register-footer">

            <button
              onClick={() =>
                step === 1
                  ? navigate("/")
                  : setStep(step - 1)
              }
            >
              Back
            </button>

            {step < totalSteps ? (
              <button onClick={handleNext}>
                Next
              </button>
            ) : (
              <button
                onClick={handleCompleteRegistration}
                disabled={loading}
              >
                {loading
                  ? "Registering..."
                  : "Complete Registration"}
              </button>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}