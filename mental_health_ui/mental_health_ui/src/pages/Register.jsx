import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css";

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
    goals: "",
    emergencyName: "",
    emergencyPhone: "",
  });

  const totalSteps = 4;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const validateStep = () => {
    if (step === 1) {
      if (
        !formData.name ||
        !formData.email ||
        !formData.password
      ) {
        setError("Please fill all required fields");
        return false;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleCompleteRegistration = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/register-complete`,
        formData
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);

        alert("Registration Successful 🌿");

        navigate("/user-dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">

          <div className="register-header">
            <h1>Welcome to NeuroCare 🌿</h1>
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="form-section">

              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

            </div>
          )}

          {step === 2 && (
            <div className="form-section">

              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
              />

              <input
                type="text"
                name="gender"
                placeholder="Gender"
                value={formData.gender}
                onChange={handleChange}
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
              />

            </div>
          )}

          {step === 3 && (
            <div className="form-section">

              <input
                type="text"
                name="occupation"
                placeholder="Occupation"
                value={formData.occupation}
                onChange={handleChange}
              />

              <input
                type="text"
                name="education"
                placeholder="Education"
                value={formData.education}
                onChange={handleChange}
              />

              <textarea
                name="goals"
                placeholder="Goals"
                value={formData.goals}
                onChange={handleChange}
              />

            </div>
          )}

          {step === 4 && (
            <div className="form-section">

              <input
                type="text"
                name="emergencyName"
                placeholder="Emergency Contact Name"
                value={formData.emergencyName}
                onChange={handleChange}
              />

              <input
                type="text"
                name="emergencyPhone"
                placeholder="Emergency Contact Phone"
                value={formData.emergencyPhone}
                onChange={handleChange}
              />

            </div>
          )}

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