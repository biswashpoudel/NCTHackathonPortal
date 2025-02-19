import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Participate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    college: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/hackathon-participants", formData);
      alert("Registered successfully!");
      navigate("/team-formation");
    } catch (err) {
      console.error("Registration failed", err);
      alert("Registration failed. Try again.");
    }
  };

  return (
    <div className="participate-container">
      <h2>Hackathon Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="studentId" placeholder="Student ID" onChange={handleChange} required />
        <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="text" name="college" placeholder="College Name" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Participate;
