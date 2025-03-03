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
  FaUsers,
  FaUserPlus
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
  const [isParticipating, setIsParticipating] = useState(false);
  const [participationLoading, setParticipationLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    members: []
  });

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
    
    fetchSubmissions();
    checkParticipationStatus();
    fetchGroups();
    fetchUserGroups();
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

  const checkParticipationStatus = async () => {
    try {
      const res = await axios.get(`https://ncthackathonportal.onrender.com/participants`);
      const participant = res.data.find(p => p.username === username);
      setIsParticipating(!!participant);
      setParticipants(res.data);
    } catch (err) {
      console.error("Error checking participation status", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`https://ncthackathonportal.onrender.com/groups`);
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups", err);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const res = await axios.get(`https://ncthackathonportal.onrender.com/user-groups?username=${username}`);
      setUserGroups(res.data);
      if (res.data.length > 0) {
        setSelectedGroup(res.data[0].name);
      }
    } catch (err) {
      console.error("Error fetching user groups", err);
    }
  };

  const handleParticipate = async () => {
    setParticipationLoading(true);
    try {
      await axios.post("https://ncthackathonportal.onrender.com/participate", {
        username
      });
      setIsParticipating(true);
      alert("You have successfully registered for the hackathon!");
    } catch (err) {
      console.error("Error registering for hackathon", err);
      alert("Failed to register. Please try again.");
    } finally {
      setParticipationLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name || !newGroup.description) {
      alert("Group name and description are required");
      return;
    }
    
    if (newGroup.members.length > 4) { // +1 for current user = 5 max
      alert("Maximum 5 members allowed per group");
      return;
    }
    
    try {
      const members = [...newGroup.members, username];
      await axios.post("https://ncthackathonportal.onrender.com/groups", {
        name: newGroup.name,
        description: newGroup.description,
        members,
        createdBy: username
      });
      
      alert("Group created successfully!");
      setNewGroup({ name: "", description: "", members: [] });
      fetchGroups();
      fetchUserGroups();
    } catch (err) {
      console.error("Error creating group", err);
      alert(`Failed to create group: ${err.response?.data?.message || "Unknown error"}`);
    }
  };

  const handleAddMember = (member) => {
    if (newGroup.members.includes(member)) {
      setNewGroup({
        ...newGroup,
        members: newGroup.members.filter(m => m !== member)
      });
    } else {
      setNewGroup({
        ...newGroup,
        members: [...newGroup.members, member]
      });
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
    
    if (!selectedGroup) {
      alert("Please select a group for your submission");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", username);
    formData.append("groupName", selectedGroup);
    
    try {
      await axios.post("https://ncthackathonportal.onrender.com/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });
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
    { id: "groups", label: "Groups", icon: <HiUserGroup /> },
    { id: "submissions", label: "Submissions", icon: <FaFileUpload /> },
    { id: "leaderboard", label: "Leaderboard", icon: <FaTrophy /> },
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
                {isParticipating ? (
                  <div className="dashboard-participation-status">
                    <div className="dashboard-success-message">
                      <FaUsers className="dashboard-success-icon" />
                      You are registered for the current hackathon!
                    </div>
                    <button 
                      className="dashboard-button" 
                      onClick={() => setActiveTab("groups")}
                    >
                      <HiUserGroup className="dashboard-button-icon" /> 
                      Manage Your Groups
                    </button>
                  </div>
                ) : (
                  <button 
                    className="dashboard-button" 
                    onClick={handleParticipate}
                    disabled={participationLoading}
                  >
                    {participationLoading ? (
                      "Registering..."
                    ) : (
                      <>
                        <FaLaptopCode className="dashboard-button-icon" /> 
                        Click to Participate
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "groups" && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Your Groups</h2>
              </div>
              <div className="dashboard-section-body">
                {!isParticipating ? (
                  <div className="dashboard-notice">
                    <p>You need to register for the hackathon first.</p>
                    <button 
                      className="dashboard-button" 
                      onClick={() => setActiveTab("hackathons")}
                    >
                      Go to Hackathons
                    </button>
                  </div>
                ) : (
                  <>
                    {userGroups.length > 0 ? (
                      <div className="dashboard-groups-list">
                        {userGroups.map(group => (
                          <div key={group._id} className="dashboard-group-card">
                            <h3>{group.name}</h3>
                            <p>{group.description}</p>
                            <div className="dashboard-group-members">
                              <h4>Members:</h4>
                              <ul>
                                {group.members.map(member => (
                                  <li key={member}>{member}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="dashboard-empty-state">You haven't joined any groups yet.</p>
                    )}

                    <div className="dashboard-section-header">
                      <h2>Create New Group</h2>
                    </div>
                    <form onSubmit={handleCreateGroup} className="dashboard-form">
                      <div className="dashboard-form-group">
                        <label>Group Name:</label>
                        <input 
                          type="text" 
                          value={newGroup.name}
                          onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="dashboard-form-group">
                        <label>Group Description:</label>
                        <textarea 
                          value={newGroup.description}
                          onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                          required
                        />
                      </div>
                      <div className="dashboard-form-group">
                        <label>Add Members (Max 4 additional members):</label>
                        <div className="dashboard-participants-list">
                          {participants
                            .filter(p => p.username !== username)
                            .map(participant => (
                              <div key={participant.username} className="dashboard-participant-item">
                                <input
                                  type="checkbox"
                                  id={`member-${participant.username}`}
                                  checked={newGroup.members.includes(participant.username)}
                                  onChange={() => handleAddMember(participant.username)}
                                  disabled={newGroup.members.length >= 4 && !newGroup.members.includes(participant.username)}
                                />
                                <label htmlFor={`member-${participant.username}`}>
                                  {participant.username} ({participant.email})
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                      <button 
                        className="dashboard-button" 
                        type="submit"
                      >
                        <FaUserPlus className="dashboard-button-icon" /> 
                        Create Group
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Submit Your Project</h2>
              </div>
              <div className="dashboard-section-body">
                {!isParticipating ? (
                  <div className="dashboard-notice">
                    <p>You need to register for the hackathon first.</p>
                    <button 
                      className="dashboard-button" 
                      onClick={() => setActiveTab("hackathons")}
                    >
                      Go to Hackathons
                    </button>
                  </div>
                ) : userGroups.length === 0 ? (
                  <div className="dashboard-notice">
                    <p>You need to join or create a group first.</p>
                    <button 
                      className="dashboard-button" 
                      onClick={() => setActiveTab("groups")}
                    >
                      Go to Groups
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpload} className="dashboard-form">
                    <div className="dashboard-form-group">
                      <label>Select Group:</label>
                      <select 
                        value={selectedGroup} 
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        required
                      >
                        <option value="">Select a group</option>
                        {userGroups.map(group => (
                          <option key={group._id} value={group.name}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="dashboard-form-group">
                      <label>File Upload:</label>
                      <div className="dashboard-file-input">
                        <input type="file" onChange={handleFileChange} required />
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
                )}
                
                <div className="dashboard-section-header">
                  <h2>Your Submissions</h2>
                </div>
                <div className="dashboard-submissions">
                  {submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <div key={submission._id} className="dashboard-submission-item">
                        <div className="dashboard-submission-info">
                          <h3>{submission.filename}</h3>
                          <p>
                            Uploaded by: <b>{submission.uploadedBy}</b>
                            <br />
                            Group: <b>{submission.groupName || "N/A"}</b>
                          </p>
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