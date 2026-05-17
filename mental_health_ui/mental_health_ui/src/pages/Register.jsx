import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css";

/* 🌐 BACKEND URL */
const BASE_URL = "https://neurocare-production.up.railway.app";

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
  const progress = (step / totalSteps) * 100;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const toggleValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all required fields");
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      setError("");
    }
  };

  const handleCompleteRegistration = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/register-complete`,
        formData
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.user.id);
        localStorage.setItem("userName", response.data.user.name);

        alert("Registration Complete! Welcome to NeuroCare 🌿");
        navigate("/user-dashboard");
      }

    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message || "Registration failed. Try again."
      );
      setLoading(false);
    }
  };

  const stepInfo = [
    { title: "Personal Info", desc: "Tell us about yourself" },
    { title: "Background", desc: "Your experience" },
    { title: "Mental Health", desc: "Your journey" },
    { title: "Preferences", desc: "Final touches" }
  ];

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">

          {/* Header */}
          <div className="register-header">
            <button onClick={() => navigate("/")} className="close-btn">
              ✕
            </button>
            <h1>Welcome to NeuroCare 🌿</h1>
          </div>

          {/* Error */}
          {error && <div className="error-banner">⚠️ {error}</div>}

          {/* STEP 4 ONLY CHANGE */}
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
              onClick={() => (step === 1 ? navigate("/") : setStep(step - 1))}
            >
              Back
            </button>

            {step < totalSteps ? (
              <button onClick={handleNext}>Next</button>
            ) : (
              <button onClick={handleCompleteRegistration} disabled={loading}>
                {loading ? "Registering..." : "Complete Registration"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}