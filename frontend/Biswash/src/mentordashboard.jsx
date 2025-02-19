import React from "react";
import './mentordashboard.css';

const MentorDashboard = ({ username }) => {
  return (
    <div className="mentor-dashboard-container">
      <div className="dashboard-header">
        <h1>Hello, {username} (Mentor)</h1>
        <button className="logout-btn">Logout</button>
      </div>
      <div className="mentor-dashboard-content">
        <h2>Mentor Dashboard</h2>
        <p>Provide feedback and guide participants here.</p>
       
      </div>
    </div>
  );
};

export default MentorDashboard;
