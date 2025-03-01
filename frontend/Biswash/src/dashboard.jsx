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
  FaUserPlus,
  FaUserCheck,
  FaUserMinus,
  FaUsers
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // New states for hackathon and group functionality
  const [availableHackathons, setAvailableHackathons] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [selectedHackathonId, setSelectedHackathonId] = useState(null);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [participatingHackathons, setParticipatingHackathons] = useState([]);

  useEffect(() => {
    if (!username) {
      console.log("No username found, redirecting to login");
      navigate("/", { replace: true });
      return;
    }
    
    fetchSubmissions();
    fetchAvailableHackathons();
    fetchRegisteredUsers();
    fetchUserGroups();
    fetchParticipatingHackathons();
  }, [username, navigate]);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/submissions?username=${username}`);
      const userSubmissions = res.data.filter(submission => 
        submission.uploadedBy === username
      );
      
      setSubmissions(userSubmissions);
    } catch (err) {
      console.error("Error fetching submissions", err);
      alert("Failed to load submissions. Please try again.");
    }
  };

  const fetchAvailableHackathons = async () => {
    try {
      const res = await axios.get("http://localhost:5000/hackathons");
      setAvailableHackathons(res.data);
    } catch (err) {
      console.error("Error fetching hackathons", err);
      alert("Failed to load hackathons. Please try again.");
    }
  };

  const fetchRegisteredUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      setRegisteredUsers(res.data.filter(user => user.username !== username));
    } catch (err) {
      console.error("Error fetching users", err);
      alert("Failed to load users. Please try again.");
    }
  };

  const fetchUserGroups = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/groups?username=${username}`);
      setUserGroups(res.data);
      
      // Set current group if user is in one
      const currentUserGroup = res.data.find(group => 
        group.members.some(member => member.username === username && member.status === "active")
      );
      setCurrentGroup(currentUserGroup || null);
    } catch (err) {
      console.error("Error fetching user groups", err);
      alert("Failed to load groups. Please try again.");
    }
  };

  const fetchParticipatingHackathons = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/participations?username=${username}`);
      setParticipatingHackathons(res.data);
    } catch (err) {
      console.error("Error fetching participations", err);
      alert("Failed to load participation data. Please try again.");
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
    formData.append("groupId", currentGroup ? currentGroup._id : "");
    
    try {
      await axios.post("http://localhost:5000/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });
      alert("File uploaded successfully!");
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

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 0) {
      const results = registeredUsers.filter(user => 
        user.username.toLowerCase().includes(term.toLowerCase()) &&
        !invitedUsers.some(invited => invited.username === user.username) &&
        (!currentGroup || !currentGroup.members.some(member => member.username === user.username))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const inviteUser = async (userToInvite) => {
    if (!currentGroup) {
      alert("Please create a group first before inviting members");
      return;
    }
    
    if (currentGroup.members.length >= 5) {
      alert("Group already has maximum of 5 members");
      return;
    }
    
    try {
      await axios.post("http://localhost:5000/invites", {
        groupId: currentGroup._id,
        fromUsername: username,
        toUsername: userToInvite.username
      });
      
      setInvitedUsers([...invitedUsers, userToInvite]);
      setSearchResults(searchResults.filter(user => user.username !== userToInvite.username));
      alert(`Invitation sent to ${userToInvite.username}!`);
    } catch (err) {
      console.error("Error sending invitation", err);
      alert("Failed to send invitation. Please try again.");
    }
  };

  const createGroup = async () => {
    if (currentGroup) {
      alert("You are already in a group. Please leave your current group before creating a new one.");
      return;
    }
    
    try {
      const res = await axios.post("http://localhost:5000/groups", {
        name: `${username}'s Group`,
        createdBy: username,
        members: [{ username, role: "leader", status: "active" }]
      });
      
      setCurrentGroup(res.data);
      setUserGroups([...userGroups, res.data]);
      alert("Group created successfully!");
    } catch (err) {
      console.error("Error creating group", err);
      alert("Failed to create group. Please try again.");
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:5000/groups/${groupId}/leave`, {
        username
      });
      
      setCurrentGroup(null);
      fetchUserGroups();
      alert("You have left the group successfully!");
    } catch (err) {
      console.error("Error leaving group", err);
      alert("Failed to leave group. Please try again.");
    }
  };

  const joinGroup = async (groupId) => {
    if (currentGroup) {
      alert("You are already in a group. Please leave your current group before joining another one.");
      return;
    }
    
    try {
      await axios.post(`http://localhost:5000/groups/${groupId}/join`, {
        username
      });
      
      fetchUserGroups();
      alert("You have joined the group successfully!");
    } catch (err) {
      console.error("Error joining group", err);
      alert("Failed to join group. Please try again.");
    }
  };

  const participateInHackathon = async (hackathonId) => {
    if (!currentGroup) {
      alert("You need to be in a group to participate in a hackathon.");
      return;
    }
    
    if (currentGroup.members.length < 5) {
      alert("Your group needs to have 5 members to participate in a hackathon.");
      return;
    }
    
    if (participatingHackathons.some(p => p.hackathonId === hackathonId)) {
      alert("You are already participating in this hackathon.");
      return;
    }
    
    try {
      await axios.post("http://localhost:5000/participate", {
        hackathonId,
        groupId: currentGroup._id
      });
      
      fetchParticipatingHackathons();
      alert("Your group has been registered for the hackathon successfully!");
    } catch (err) {
      console.error("Error participating in hackathon", err);
      alert("Failed to register for hackathon. Please try again.");
    }
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
                {currentGroup && (
                  <div className="dashboard-current-group">
                    <p>Current Group: {currentGroup.name} ({currentGroup.members.length}/5 members)</p>
                  </div>
                )}
              </div>
              <div className="dashboard-section-body">
                {availableHackathons.length > 0 ? (
                  <div className="dashboard-hackathons-list">
                    {availableHackathons.map((hackathon) => {
                      const isParticipating = participatingHackathons.some(
                        p => p.hackathonId === hackathon._id
                      );
                      
                      return (
                        <div key={hackathon._id} className="dashboard-hackathon-card">
                          <div className="dashboard-hackathon-info">
                            <h3>{hackathon.name}</h3>
                            <p className="dashboard-hackathon-dates">
                              {new Date(hackathon.startDate).toLocaleDateString()} - 
                              {new Date(hackathon.endDate).toLocaleDateString()}
                            </p>
                            <p>{hackathon.description}</p>
                          </div>
                          <div className="dashboard-hackathon-actions">
                            {isParticipating ? (
                              <button 
                                className="dashboard-button dashboard-button-participating" 
                                disabled
                              >
                                <FaUserCheck className="dashboard-button-icon" /> 
                                Participating
                              </button>
                            ) : (
                              <button 
                                className="dashboard-button" 
                                onClick={() => participateInHackathon(hackathon._id)}
                                disabled={!currentGroup || currentGroup.members.length < 5}
                              >
                                <FaLaptopCode className="dashboard-button-icon" /> 
                                Participate
                              </button>
                            )}
                          </div>
                          {(!currentGroup || currentGroup.members.length < 5) && !isParticipating && (
                            <div className="dashboard-hackathon-requirement">
                              <p>You need a group with 5 members to participate</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="dashboard-empty-state">No hackathons are currently available.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "groups" && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Group Management</h2>
              </div>
              <div className="dashboard-section-body">
                <div className="dashboard-group-controls">
                  {!currentGroup ? (
                    <button 
                      className="dashboard-button" 
                      onClick={createGroup}
                    >
                      <FaUsers className="dashboard-button-icon" /> 
                      Create New Group
                    </button>
                  ) : (
                    <div className="dashboard-current-group-info">
                      <h3>Your Current Group: {currentGroup.name}</h3>
                      <p>Group Members ({currentGroup.members.length}/5):</p>
                      <ul className="dashboard-group-members">
                        {currentGroup.members.map((member) => (
                          <li key={member.username} className="dashboard-group-member">
                            <span className={`dashboard-member-role ${member.role}`}>
                              {member.role === "leader" ? "👑 " : ""}
                              {member.username}
                            </span>
                            <span className="dashboard-member-status">
                              {member.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      {currentGroup.members.length < 5 && (
                        <div className="dashboard-group-invite">
                          <h4>Invite Members</h4>
                          <div className="dashboard-search-container">
                            <input 
                              type="text" 
                              placeholder="Search users..." 
                              value={searchTerm}
                              onChange={handleSearch}
                              className="dashboard-search-input"
                            />
                            {searchResults.length > 0 && (
                              <ul className="dashboard-search-results">
                                {searchResults.map((user) => (
                                  <li key={user.username} className="dashboard-search-result">
                                    <span>{user.username}</span>
                                    <button 
                                      className="dashboard-invite-button"
                                      onClick={() => inviteUser(user)}
                                    >
                                      <FaUserPlus /> Invite
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          
                          {invitedUsers.length > 0 && (
                            <div className="dashboard-invited-users">
                              <h4>Pending Invitations</h4>
                              <ul>
                                {invitedUsers.map((user) => (
                                  <li key={user.username}>{user.username}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <button 
                        className="dashboard-button dashboard-button-danger" 
                        onClick={() => leaveGroup(currentGroup._id)}
                      >
                        <FaUserMinus className="dashboard-button-icon" /> 
                        Leave Group
                      </button>
                    </div>
                  )}
                </div>
                
                {!currentGroup && userGroups.length > 0 && (
                  <div className="dashboard-available-groups">
                    <h3>Available Groups</h3>
                    <div className="dashboard-groups-list">
                      {userGroups
                        .filter(group => !group.members.some(member => 
                          member.username === username && member.status === "active"
                        ))
                        .map((group) => (
                          <div key={group._id} className="dashboard-group-card">
                            <div className="dashboard-group-info">
                              <h4>{group.name}</h4>
                              <p>Members: {group.members.length}/5</p>
                              <p>Leader: {
                                group.members.find(member => member.role === "leader")?.username
                              }</p>
                            </div>
                            <button 
                              className="dashboard-button" 
                              onClick={() => joinGroup(group._id)}
                              disabled={group.members.length >= 5}
                            >
                              <FaUserPlus className="dashboard-button-icon" /> 
                              Join Group
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
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
                {currentGroup ? (
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
                ) : (
                  <div className="dashboard-group-requirement">
                    <p>You need to be in a group to submit your project.</p>
                    <button 
                      className="dashboard-button" 
                      onClick={() => setActiveTab("groups")}
                    >
                      <HiUserGroup className="dashboard-button-icon" /> 
                      Go to Groups
                    </button>
                  </div>
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
                          <p>Uploaded by: {submission.uploadedBy}</p>
                          {submission.groupId && (
                            <p>Group: {
                              userGroups.find(g => g._id === submission.groupId)?.name || submission.groupId
                            }</p>
                          )}
                        </div>
                        <a
                          href={`http://localhost:5000/download/${submission.filename}`}
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