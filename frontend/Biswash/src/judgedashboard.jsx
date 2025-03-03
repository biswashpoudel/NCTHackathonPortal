import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaTrophy,
  FaFileUpload,
  FaComments,
  FaBell,
  FaLaptopCode,
  FaUserEdit,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
} from "react-icons/fa";
import "./judgedashboard.css"
const JudgeDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username");

  const [activeTab, setActiveTab] = useState("judgeSubmissions");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!username) {
      console.log("No username found, redirecting to login");
      navigate("/", { replace: true });
      return;
    }
    fetchAllSubmissions();
  }, [username, navigate]);

  const fetchAllSubmissions = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/submissions");
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions", err);
      alert("Failed to load submissions. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/", { replace: true });
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleGradeChange = (submissionId, grade) => {
    const updatedSubmissions = submissions.map((submission) =>
      submission._id === submissionId ? { ...submission, grade } : submission
    );
    setSubmissions(updatedSubmissions);
  };

  const handleFeedbackChange = (submissionId, feedback) => {
    const updatedSubmissions = submissions.map((submission) =>
      submission._id === submissionId ? { ...submission, feedback } : submission
    );
    setSubmissions(updatedSubmissions);
  };

  const submitGradeAndFeedback = async (submissionId) => {
    const submission = submissions.find((sub) => sub._id === submissionId);
    if (!submission.grade || !submission.feedback) {
      alert("Please provide both grade and feedback.");
      return;
    }

    try {
      await axios.post("https://ncthackathonportal.onrender.com/submit-grade", {
        submissionId,
        grade: submission.grade,
        feedback: submission.feedback,
      });
      alert("Grade and feedback submitted successfully!");
    } catch (err) {
      console.error("Error submitting grade and feedback", err);
      alert("Failed to submit. Please try again.");
    }
  };

  const menuItems = [
    { id: "judgeSubmissions", label: "Judge Submissions", icon: <FaLaptopCode /> },
    { id: "leaderboard", label: "Leaderboard", icon: <FaTrophy /> },
    { id: "discussion", label: "Discussion", icon: <FaComments /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-navbar">
        <div className="dashboard-navbar-left">
          <button className="dashboard-menu-toggle" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <h2 className="dashboard-greeting">Hi, Judge {username}</h2>
        </div>

        <div className="dashboard-profile-container">
          <div className="dashboard-profile-icon" onClick={toggleProfileDropdown}>
            {username ? username.charAt(0).toUpperCase() : "J"}
          </div>

          {showProfileDropdown && (
            <div className="dashboard-profile-dropdown">
              <div className="dashboard-dropdown-header">{username}</div>
              <ul className="dashboard-dropdown-menu">
                <li onClick={() => navigate("/edit-profile")}>
                  <FaUserEdit className="dashboard-dropdown-icon" />
                  Edit Profile
                </li>
                <li onClick={() => navigate("/settings")}>
                  <FaCog className="dashboard-dropdown-icon" />
                  Settings
                </li>
                <li onClick={handleLogout}>
                  <FaSignOutAlt className="dashboard-dropdown-icon" />
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-main">
        <div className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <button className="dashboard-sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>

          <ul className="dashboard-sidebar-menu">
            {menuItems.map((item) => (
              <li
                key={item.id}
                className={activeTab === item.id ? "active" : ""}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="dashboard-menu-icon">{item.icon}</span>
                <span className="dashboard-menu-text">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-content">
          {activeTab === "judgeSubmissions" && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>All Submissions</h2>
              </div>
              <div className="dashboard-section-body">
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <div key={submission._id} className="dashboard-submission-item">
                      <div className="dashboard-submission-info">
                        <h3>{submission.filename}</h3>
                        <p>Uploaded by: <b>{submission.uploadedBy}</b></p>
                      </div>
                      <a
                        href={`https://ncthackathonportal.onrender.com/${submission.filename}`}
                        download
                        className="dashboard-view-button"
                      >
                        <FaDownload /> Download
                      </a>
                      <div className="dashboard-grade-feedback">
                        <input
                          type="number"
                          placeholder="Grade (0-100)"
                          min="0"
                          max="100"
                          value={submission.grade || ""}
                          onChange={(e) => handleGradeChange(submission._id, e.target.value)}
                        />
                        <textarea
                          placeholder="Feedback"
                          value={submission.feedback || ""}
                          onChange={(e) => handleFeedbackChange(submission._id, e.target.value)}
                        />
                        <button
                          className="dashboard-button"
                          onClick={() => submitGradeAndFeedback(submission._id)}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="dashboard-empty-state">No submissions found.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Leaderboard</h2>
              </div>
              <div className="dashboard-section-body">
                <p className="dashboard-empty-state">Top participants will be displayed here.</p>
              </div>
            </div>
          )}

          {activeTab === "discussion" && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Discussion Forum</h2>
              </div>
              <div className="dashboard-section-body">
                <p className="dashboard-empty-state">Connect with other participants here.</p>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Notifications</h2>
              </div>
              <div className="dashboard-section-body">
                <p className="dashboard-empty-state">You have no new notifications.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;