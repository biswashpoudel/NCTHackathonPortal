import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useRef } from "react-router-dom";
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
  FaChevronRight
} from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi2";
import "./dashboard.css"; 

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username");

  const [activeTab, setActiveTab] = useState("hackathons");
  const [submissions, setSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groupName, setGroupName]=useState("N/A")

  // Create refs to detect clicks outside elements
  const sidebarRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const menuToggleRef = useRef(null);
  const profileIconRef = useRef(null);

  // Handle click outside of sidebar and profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // For sidebar: Close if click is outside and sidebar is open
      if (sidebarOpen && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target) &&
          menuToggleRef.current && 
          !menuToggleRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
      
      // For profile dropdown: Close if click is outside and dropdown is open
      if (showProfileDropdown && 
          profileDropdownRef.current && 
          !profileDropdownRef.current.contains(event.target) &&
          profileIconRef.current && 
          !profileIconRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Reset scroll position
    window.scrollTo(0, 0);
    
    // Prevent automatic scrolling
    document.body.style.overflow = "auto";
    
    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, showProfileDropdown]);

  useEffect(() => {
    if (!username) {
      console.log("No username found, redirecting to login");
      navigate("/", { replace: true });
      return;
    }
    
    fetchSubmissions();
  }, [username, navigate]);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`https://ncthackathonportal.onrender.com/submissions?username=${username}`);
      const userSubmissions = res.data.filter(submission => 
        submission.uploadedBy === username
      );

      setSubmissions(userSubmissions);
    } catch (err) {
      console.error("Error fetching submissions", err);
      alert("Failed to load submissions. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/", { replace: true });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file!");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", username); 
    
    try {
      await axios.post("https://ncthackathonportal.onrender.com/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });
      // alert("File uploaded successfully!");
      setFile(null);
      fetchSubmissions();
    } catch (err) {
      alert("Upload failed. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { id: "hackathons", label: "View Hackathons", icon: <FaLaptopCode /> },
    { id: "leaderboard", label: "Leaderboard", icon: <FaTrophy /> },
    { id: "groups", label: "Groups", icon: < HiUserGroup /> },
    { id: "submissions", label: "Submissions", icon: <FaFileUpload /> },
    { id: "discussion", label: "Discussion", icon: <FaComments /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> }
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-navbar">
        <div className="dashboard-navbar-left">
          <button className="dashboard-menu-toggle" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <h2 className="dashboard-greeting">Hi, {username}</h2>

        </div>
       
        
        <div className="dashboard-profile-container">
          <div className="dashboard-profile-icon" onClick={toggleProfileDropdown}>
            {username ? username.charAt(0).toUpperCase() : "U"}
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
          <button 
            className="dashboard-sidebar-toggle" 
            onClick={toggleSidebar}
          >
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
          {activeTab === "hackathons" && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Available Hackathons</h2>
              </div>
              <div className="dashboard-section-body">
                <p className="dashboard-empty-state">Upcoming hackathons will be listed here.</p>
                <button 
                  className="dashboard-button" 
                  onClick={() => navigate("/participate-hackathons")}
                >
                  <FaLaptopCode className="dashboard-button-icon" /> 
                  Click to Participate
                </button>
              </div>
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Submit Your Project</h2>
              </div>
              <div className="dashboard-section-body">
                <form onSubmit={handleUpload} className="dashboard-form">
                  <div className="dashboard-form-group">
                    <label>File Upload:</label>
                    <div className="dashboard-file-input">
                      <input type="file" onChange={handleFileChange} />
                    </div>
                  </div>
                  <button 
                    className="dashboard-button" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? (
                      "Uploading..."
                    ) : (
                      <>
                        <FaFileUpload className="dashboard-button-icon" /> 
                        Submit
                      </>
                    )}
                  </button>
                </form>
                
                <div className="dashboard-section-header">
                  <h2>Your Submissions</h2>
                </div>
                <div className="dashboard-submissions">
                  {submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <div key={submission._id} className="dashboard-submission-item">
                        <div className="dashboard-submission-info">
                          <h3>{submission.filename}</h3>
                          <p>Uploaded by: <b>{submission.uploadedBy}</b><br></br>Group:{groupName} </p>
                        </div>
                        <a
                          href={`https://ncthackathonportal.onrender.com/${submission.filename}`}
                          download
                          className="dashboard-view-button"
                        >
                          View
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="dashboard-empty-state">You haven't made any submissions yet.</p>
                  )}
                </div>
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

export default Dashboard;