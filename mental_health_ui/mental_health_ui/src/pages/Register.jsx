import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css";

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
    setError(""); // Clear error on input change
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
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }
      // Password validation
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
        'http://localhost:5000/api/auth/register-complete',
        formData
      );

      if (response.data.token) {
        // Save token and user info to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userName', response.data.user.name);
        
        alert('Registration Complete! Welcome to NeuroCare 🌿');
        navigate('/user-dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
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
            <button
              onClick={() => navigate("/")}
              className="close-btn"
              aria-label="Close"
            >
              ✕
            </button>
            <h1>Welcome to NeuroCare 🌿</h1>
            <p>Let's get to know you better - take your time</p>
          </div>

          {/* Progress Section */}
          <div className="progress-section">
            {/* Step Indicators */}
            <div className="step-indicators">
              {stepInfo.map((info, idx) => {
                const stepNum = idx + 1;
                const isActive = step === stepNum;
                const isCompleted = step > stepNum;

                return (
                  <div key={stepNum} className="step-indicator">
                    <div
                      className={`step-circle ${
                        isCompleted
                          ? "completed"
                          : isActive
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {isCompleted ? "✓" : stepNum}
                    </div>
                    <div className="step-info">
                      <div className={`step-title ${isActive ? "active" : "inactive"}`}>
                        {info.title}
                      </div>
                      <div className="step-desc">{info.desc}</div>
                    </div>
                    {idx < stepInfo.length - 1 && (
                      <div className={`step-connector ${step > stepNum ? "completed" : ""}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="progress-info">
                <span className="progress-info-left">Step {step} of {totalSteps}</span>
                <span className="progress-info-right">{Math.round(progress)}% Complete</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              ⚠️ {error}
            </div>
          )}

          {/* Form Content */}
          <div className="form-content">
            <div className="form-inner">
              
              {/* STEP 1: Personal Information */}
              {step === 1 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Personal Information</h2>
                    <p>Let's start with the basics</p>
                  </div>

                  <div className="form-section">
                    <label className="form-label">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      placeholder="Enter your full name"
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-section">
                    <label className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      placeholder="your.email@example.com"
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-section">
                    <label className="form-label">
                      Password <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      placeholder="Create a secure password (min 6 characters)"
                      onChange={handleChange}
                      className="form-input"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-section">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        placeholder="25"
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-section">
                      <label className="form-label">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-section">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      placeholder="City, Country"
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Background */}
              {step === 2 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Your Background</h2>
                    <p>Help us understand your current situation</p>
                  </div>

                  <div className="form-section">
                    <label className="form-label">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      placeholder="e.g., Student, Software Engineer, Teacher"
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-section">
                    <label className="form-label">Education Level</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select education level</option>
                      <option value="high-school">High School</option>
                      <option value="bachelors">Bachelor's Degree</option>
                      <option value="masters">Master's Degree</option>
                      <option value="phd">PhD/Doctorate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-section">
                    <label className="form-label">
                      Have you sought mental health support before?
                    </label>
                    <div className="radio-group">
                      {[
                        { value: "yes", label: "Yes, I have" },
                        { value: "no", label: "No, this is my first time" }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`radio-option ${
                            formData.priorSupport === option.value ? "selected" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="priorSupport"
                            value={option.value}
                            checked={formData.priorSupport === option.value}
                            onChange={handleChange}
                            className="radio-input"
                          />
                          <span className="radio-label-text">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-section">
                    <label className="form-label">
                      Have you had therapy or counseling before?
                    </label>
                    <div className="radio-list">
                      {[
                        { value: "yes-currently", label: "Yes, currently in therapy" },
                        { value: "yes-past", label: "Yes, in the past" },
                        { value: "no", label: "No, never" }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`radio-option ${
                            formData.therapyHistory === option.value ? "selected" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="therapyHistory"
                            value={option.value}
                            checked={formData.therapyHistory === option.value}
                            onChange={handleChange}
                            className="radio-input"
                          />
                          <span className="radio-label-text">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Mental Health */}
              {step === 3 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Your Mental Health Journey</h2>
                    <p>Share what brings you to NeuroCare</p>
                  </div>

                  <div className="form-section">
                    <label className="form-label">
                      What challenges are you currently facing?
                    </label>
                    <div className="checkbox-grid">
                      {["Stress", "Anxiety", "Depression", "Burnout", "Sleep Issues", "Loneliness", "Self-esteem", "Work-life Balance"].map((c) => (
                        <label
                          key={c}
                          className={`checkbox-option ${
                            formData.challenges.includes(c) ? "selected" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.challenges.includes(c)}
                            onChange={() => toggleValue("challenges", c)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-label-text">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-section">
                    <label className="form-label">Current stress level</label>
                    <div className="stress-slider-container">
                      <div className="slider-header">
                        <span className="slider-header-left">Low</span>
                        <div className="slider-value">
                          <div className="slider-value-number">{formData.stressLevel}</div>
                          <div className="slider-value-text">out of 10</div>
                        </div>
                        <span className="slider-header-right">High</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.stressLevel}
                        onChange={(e) => setFormData({ ...formData, stressLevel: e.target.value })}
                        className="stress-slider"
                        style={{
                          background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(formData.stressLevel - 1) * 11.11}%, #e5e7eb ${(formData.stressLevel - 1) * 11.11}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="slider-marks">
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <span key={num} className="slider-mark">{num}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <label className="form-label">
                      What are your goals with NeuroCare?
                    </label>
                    <textarea
                      name="goals"
                      value={formData.goals}
                      placeholder="e.g., I want to manage my anxiety better, develop coping strategies, improve my sleep quality..."
                      onChange={handleChange}
                      rows="6"
                      className="form-textarea"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* STEP 4: Preferences */}
              {step === 4 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Almost Done! 🎉</h2>
                    <p>Let's customize your experience</p>
                  </div>

                  <div className="form-section">
                    <label className="form-label">
                      What type of support are you looking for?
                    </label>
                    <div className="checkbox-grid">
                      {["Check-ins", "Journaling", "Meditation", "AI Chat", "Breathing Exercises", "Mood Tracking", "Goal Setting", "Crisis Support"].map((p) => (
                        <label
                          key={p}
                          className={`checkbox-option ${
                            formData.preferences.includes(p) ? "selected" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.preferences.includes(p)}
                            onChange={() => toggleValue("preferences", p)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-label-text">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="emergency-box">
                    <div className="emergency-header">
                      <span className="emergency-icon">🆘</span>
                      <h3>Emergency Contact</h3>
                    </div>
                    <p className="emergency-description">
                      This information will only be used in case of emergency and will be kept strictly confidential.
                    </p>

                    <div className="form-section">
                      <label className="form-label">Emergency Contact Name</label>
                      <input
                        type="text"
                        name="emergencyName"
                        value={formData.emergencyName}
                        placeholder="Contact person's name"
                        onChange={handleChange}
                        className="emergency-input"
                      />
                    </div>

                    <div className="form-section">
                      <label className="form-label">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        placeholder="+1 (555) 000-0000"
                        onChange={handleChange}
                        className="emergency-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="register-footer">
            <div className="footer-buttons">
              <button
                onClick={() => (step === 1 ? navigate("/") : setStep(step - 1))}
                className="btn btn-back"
                disabled={loading}
              >
                {step === 1 ? "✕ Cancel" : "← Previous"}
              </button>

              {step < totalSteps ? (
                <button
                  onClick={handleNext}
                  className="btn btn-next"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleCompleteRegistration}
                  className="btn btn-complete"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "✓ Complete Registration"}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}