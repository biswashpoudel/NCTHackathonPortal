import React, { useState, useEffect } from "react"; 
import axios from "axios"; 
import { useNavigate, useLocation } from "react-router-dom"; 
import "./AuthPage.css";

const AuthPage = ({ isLogin: propIsLogin }) => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(propIsLogin);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [usernameError, setUsernameError] = useState(""); 

  useEffect(() => {
    setIsLogin(location.pathname === "/login"); 
    setErrorMessage(""); 
  }, [location.pathname]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate username for industry level rules
    if (name === "username") {
      // Check if username matches the pattern
      const usernamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9_-]{1,18}[a-zA-Z0-9])?$/;
      
      if (!usernamePattern.test(value)) {
        setUsernameError(
          "Username must be 3-20 characters, containing only letters, numbers, underscores (_), and hyphens (-). No symbols at the start or end."
        );
      } else {
        setUsernameError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      if (isLogin) {
        const res = await axios.post("https://ncthackathonportal.onrender.com/login", {
          email: formData.email,
          password: formData.password,
        });

        const { role, username } = res.data;
        localStorage.setItem("username", username);
        if (role === "admin") navigate(`/admin-dashboard?username=${username}`);
        else if (role === "judge") navigate(`/judge-dashboard?username=${username}`);
        else if (role === "mentor") navigate(`/mentor-dashboard?username=${username}`);
        else navigate(`/participant-dashboard?username=${username}`);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setErrorMessage("Passwords do not match!");
          return;
        }

        const res = await axios.post("https://ncthackathonportal.onrender.com/register", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        alert(res.data.message);
        navigate("/login");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">{isLogin ? "Login" : "Register"}</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <>
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                {usernameError && <p className="error-message">{usernameError}</p>}
              </>
            )}
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {!isLogin && (
              <>
                <label>Confirm Password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </>
            )}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="auth-button">
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
          <p className="auth-toggle">
            {isLogin ? (
              <>Don't have an account? <span onClick={() => navigate("/register")}>Register here</span></>
            ) : (
              <>Already have an account? <span onClick={() => navigate("/login")}>Login here</span></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
