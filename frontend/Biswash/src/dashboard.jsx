import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
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

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/submissions?username=${username}`);
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
      await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded successfully!");
      setFile(null);
      fetchSubmissions(); 
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <div className="user-info">
          <h1>Welcome, {username}!</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="content">
        <div className="tabs">
          {["hackathons", "submissions", "results", "mentors", "group"].map(
            (tab) => (
              <div
                key={tab}
                className={`tab-card ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <h3>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h3>
              </div>
            )
          )}
        </div>

        <div className="tab-content">
          {activeTab === "hackathons" && (
            <div>
              <h2>Hackathons</h2>
              <p>Upcoming hackathons will be listed here.</p>
              <button className="participate-btn" onClick={() => navigate("/participate-hackathons")}>Participate in Hackathon</button>
            </div>
          )}

          {activeTab === "submissions" && (
            <div>
              <h2>Submit Your Project</h2>
              <form onSubmit={handleUpload}>
                <label>
                  File Upload:
                  <input type="file" onChange={handleFileChange} />
                </label>
                <button className="submit-button" type="submit" disabled={loading}>
                  {loading ? "Uploading..." : "Submit"}
                </button>
              </form>
              <h2>Previous Submissions</h2>
              <ul>
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <li key={submission._id}>
                      {submission.filename} uploaded by {submission.uploadedBy}
                      <a
                        href={`http://localhost:5000/download/${submission.filename}`}
                        download
                      >
                        <button className="download-btn"> View </button>
                      </a>
                    </li>
                  ))
                ) : (
                  <p>No submissions yet.</p>
                )}
              </ul>
            </div>
          )}

          {activeTab === "results" && (
            <div>
              <h2>Results</h2>
              <ul>
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <li key={submission._id}>
                      <strong>{submission.filename}</strong>
                      {submission.feedback ? (
                        <div>
                          <p>Submitted By: {submission.uploadedBy}</p>
                          <p>Feedback: {submission.feedback}</p>
                          <p>Grade: {submission.grade}</p>
                        </div>
                      ) : (
                        <p>No feedback yet.</p>
                      )}
                    </li>
                  ))
                ) : (
                  <p>No results available.</p>
                )}
              </ul>
            </div>
          )}

          {activeTab === "mentors" && <h2>Mentors</h2>}
          {activeTab === "group" && <h2>Groups</h2>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
