"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
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
  FaHourglassHalf,
} from "react-icons/fa"
import { MdGroupAdd } from "react-icons/md"
import { HiUserGroup } from "react-icons/hi2"
import "./dashboard.css"

const Dashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const username = queryParams.get("username")

  const [activeTab, setActiveTab] = useState("hackathons")
  const [submissions, setSubmissions] = useState([])
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [participationStatus, setParticipationStatus] = useState("false") // "false", "pending", or "true"
  const [participationLoading, setParticipationLoading] = useState(false)
  const [participants, setParticipants] = useState([])
  const [groups, setGroups] = useState([])
  const [userGroups, setUserGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState("")
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    members: [],
  })
  const [showParticipantsList, setShowParticipantsList] = useState(false)
  const [existingGroupMembers, setExistingGroupMembers] = useState([])

  const dropdownRef = useRef(null)
  const sidebarRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.body.style.overflow = "auto"

    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  useEffect(() => {
    if (!username) {
      console.log("No username found, redirecting to login")
      navigate("/", { replace: true })
      return
    }

    fetchSubmissions()
    checkParticipationStatus()
    fetchGroups()
    fetchUserGroups()
  }, [username, navigate])

  useEffect(() => {
    if (groups.length > 0) {
      const allGroupMembers = new Set()
      groups.forEach((group) => {
        group.members.forEach((member) => {
          allGroupMembers.add(member)
        })
      })
      setExistingGroupMembers(Array.from(allGroupMembers))
    }
  }, [groups])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`https://ncthackathonportal.onrender.com/submissions?username=${username}`)
      const userSubmissions = res.data.filter((submission) => submission.uploadedBy === username)

      setSubmissions(userSubmissions)
    } catch (err) {
      console.error("Error fetching submissions", err)
      alert("Failed to load submissions. Please try again.")
    }
  }

  const checkParticipationStatus = async () => {
    try {
      // First, check if the user is in the participants list
      const participantsRes = await axios.get(`https://ncthackathonportal.onrender.com/participants`)
      const participant = participantsRes.data.find((p) => p.username === username)

      if (participant) {
        setParticipationStatus("true")
        setParticipants(participantsRes.data)
        return
      }

      // If not in participants list, check user's current status
      const userRes = await axios.get(`https://ncthackathonportal.onrender.com/user?username=${username}`)
      if (userRes.data && userRes.data.isParticipating) {
        setParticipationStatus(userRes.data.isParticipating)
      } else {
        setParticipationStatus("false")
      }

      // Set all participants for group creation
      setParticipants(participantsRes.data)
    } catch (err) {
      console.error("Error checking participation status", err)
      setParticipationStatus("false")
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`https://ncthackathonportal.onrender.com/groups`)
      setGroups(res.data)
    } catch (err) {
      console.error("Error fetching groups", err)
    }
  }

  const fetchUserGroups = async () => {
    try {
      const res = await axios.get(`https://ncthackathonportal.onrender.com/user-groups?username=${username}`)
      setUserGroups(res.data)
      if (res.data.length > 0) {
        setSelectedGroup(res.data[0].name)
      }
    } catch (err) {
      console.error("Error fetching user groups", err)
    }
  }

  const handleParticipate = async () => {
    setParticipationLoading(true)
    try {
      const res = await axios.post("https://ncthackathonportal.onrender.com/participate", {
        username,
      })

      setParticipationStatus("pending")
      alert(res.data.message || "Your participation request has been submitted for admin approval.")
    } catch (err) {
      console.error("Error registering for hackathon", err)
      alert(err.response?.data?.message || "Failed to register. Please try again.")
    } finally {
      setParticipationLoading(false)
    }
  }

  const isGroupApproved = (group) => {
    return group.pendingApproval === false // Checks if the group is approved
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!newGroup.name || !newGroup.description) {
      alert("Group name and description are required")
      return
    }

    if (newGroup.members.length > 4) {
      // +1 for current user = 5 max
      alert("Maximum 5 members allowed per group")
      return
    }

    if (userGroups.length > 0) {
      alert("You can only create one group.")
      return
    }

    try {
      const members = [...newGroup.members, username]
      // Create the group with "pendingApproval" set to true
      await axios.post("https://ncthackathonportal.onrender.com/groups", {
        name: newGroup.name,
        description: newGroup.description,
        members,
        createdBy: username,
        pendingApproval: true, // Add pendingApproval to track group approval
      })

      alert("Group created successfully! Awaiting admin approval.")
      setNewGroup({ name: "", description: "", members: [] })
      fetchGroups()
      fetchUserGroups()
    } catch (err) {
      console.error("Error creating group", err)
      alert(`Failed to create group: ${err.response?.data?.message || "Unknown error"}`)
    }
  }

  const handleAddMember = (member) => {
    if (!isGroupApproved(selectedGroup)) {
      alert("Group is awaiting approval. You cannot add members at this time.")
      return
    }
    // Add member to group logic here
    if (newGroup.members.includes(member)) {
      setNewGroup({
        ...newGroup,
        members: newGroup.members.filter((m) => m !== member),
      })
    } else {
      setNewGroup({
        ...newGroup,
        members: [...newGroup.members, member],
      })
    }
  }

  const toggleParticipantsList = () => {
    setShowParticipantsList(!showParticipantsList)
  }

  const isUserInAnyGroup = (username) => {
    return existingGroupMembers.includes(username)
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    navigate("/", { replace: true })
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      alert("Please select a file!")
      return
    }

    if (!selectedGroup) {
      alert("Please select a group for your submission")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("uploadedBy", username)
    formData.append("groupName", selectedGroup)

    try {
      await axios.post("https://ncthackathonportal.onrender.com/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setFile(null)
      fetchSubmissions()
      alert("File submitted successfully!")
    } catch (err) {
      alert("Upload failed. Please try again.")
      console.error("Upload error:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const menuItems = [
    { id: "hackathons", label: "View Hackathons", icon: <FaLaptopCode /> },
    { id: "groups", label: "Groups", icon: <HiUserGroup /> },
    { id: "submissions", label: "Submissions", icon: <FaFileUpload /> },
    { id: "leaderboard", label: "Leaderboard", icon: <FaTrophy /> },
    { id: "discussion", label: "Discussion", icon: <FaComments /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
  ]

  // Render participation status based on current state
  const renderParticipationStatus = () => {
    switch (participationStatus) {
      case "true":
        return (
          <div className="dashboard-participation-status">
            <div className="dashboard-success-message">
              <FaUsers className="dashboard-success-icon" />
              You are registered for the current hackathon!
            </div>
            <button className="dashboard-button" onClick={() => setActiveTab("groups")}>
              <HiUserGroup className="dashboard-button-icon" />
              Manage Your Groups
            </button>
          </div>
        )
      case "pending":
        return (
          <div className="dashboard-participation-status">
            <div className="dashboard-pending-message">
              <FaHourglassHalf className="dashboard-pending-icon" />
              Your participation request is pending admin approval.
            </div>
          </div>
        )
      default:
        return (
          <button className="dashboard-button" onClick={handleParticipate} disabled={participationLoading}>
            {participationLoading ? (
              "Registering..."
            ) : (
              <>
                <FaLaptopCode className="dashboard-button-icon" />
                Click to Participate
              </>
            )}
          </button>
        )
    }
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-navbar">
        <div className="dashboard-navbar-left">
          <button className="dashboard-menu-toggle" onClick={toggleSidebar} ref={sidebarRef}>
            <FaBars />
          </button>
          <h2 className="dashboard-greeting">Hi, {username}</h2>
        </div>

        <div className="dashboard-profile-container" ref={dropdownRef}>
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
                <li onClick={handleLogout} style={{ color: "red" }}>
                  <FaSignOutAlt style={{ color: "red" }} className="dashboard-dropdown-icon" />
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-main">
        <div className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`} ref={sidebarRef}>
          <button className="dashboard-sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>

          <ul className="dashboard-sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)}>
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
                {renderParticipationStatus()}
              </div>
            </div>
          )}

          {activeTab === "groups" && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Your Groups</h2>
              </div>
              <div className="dashboard-section-body">
                {participationStatus !== "true" ? (
                  <div className="dashboard-notice">
                    {participationStatus === "pending" ? (
                      <p>Your participation request is pending admin approval.</p>
                    ) : (
                      <p>You need to register for the hackathon first.</p>
                    )}
                    <button className="dashboard-button" onClick={() => setActiveTab("hackathons")}>
                      Go to Hackathons
                    </button>
                  </div>
                ) : (
                  <>
                    {userGroups.length > 0 ? (
                      <div className="dashboard-groups-list">
                        {userGroups.map((group) => (
                          <div key={group._id} className="dashboard-group-card">
                            <h3> Group Name: {group.name}</h3>
                            <p>{group.description}</p>
                            {group.pendingApproval && <p className="dashboard-pending">Pending Approval</p>}
                            <div className="dashboard-group-members">
                              <h4>Members:</h4>
                              <ul className="dashboard-members-list">
                                {group.members.map((member) => (
                                  <li key={member} className="dashboard-member-item">
                                    <div className="dashboard-member-avatar">{member.charAt(0).toUpperCase()}</div>
                                    <span className="dashboard-member-name">{member}</span>
                                    {member === group.createdBy && (
                                      <span className="dashboard-member-badge">Creator</span>
                                    )}
                                  </li>
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
                    <br></br>
                    <form onSubmit={handleCreateGroup} className="dashboard-form">
                      <div className="dashboard-form-group">
                        <label>Group Name:</label>
                        <input
                          type="text"
                          value={newGroup.name}
                          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="dashboard-form-group">
                        <label>Group Description:</label>
                        <textarea
                          value={newGroup.description}
                          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                          required
                        />
                      </div>
                      <div className="dashboard-form-group">
                        <label>Add Members (Max 4 additional members):</label>
                        <div className="dashboard-members-dropdown">
                          <button type="button" className="dashboard-dropdown-toggle" onClick={toggleParticipantsList}>
                            {newGroup.members.length > 0
                              ? `${newGroup.members.length} members selected`
                              : "Select members"}
                          </button>

                          {showParticipantsList && (
                            <div className="dashboard-participants-list">
                              {participants
                                .filter((p) => p.username !== username)
                                .map((participant) => {
                                  const isInGroup = isUserInAnyGroup(participant.username)
                                  const isInThisGroup = newGroup.members.includes(participant.username)

                                  return (
                                    <div key={participant.username} className="dashboard-participant-item">
                                      <div className="dashboard-participant-checkbox">
                                        <input
                                          type="checkbox"
                                          id={`member-${participant.username}`}
                                          checked={isInThisGroup}
                                          onChange={() => handleAddMember(participant.username)}
                                          disabled={
                                            (isInGroup && !isInThisGroup) ||
                                            (newGroup.members.length >= 4 && !isInThisGroup)
                                          }
                                        />
                                        <label
                                          htmlFor={`member-${participant.username}`}
                                          className={isInGroup && !isInThisGroup ? "dashboard-member-disabled" : ""}
                                        >
                                          <div className="dashboard-participant-info">
                                            <div className="dashboard-member-avatar">
                                              {participant.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="dashboard-participant-details">
                                              <span className="dashboard-participant-name">{participant.username}</span>
                                              <span className="dashboard-participant-email">{participant.email}</span>
                                            </div>
                                          </div>
                                          {isInGroup && !isInThisGroup && (
                                            <span className="dashboard-participant-status">Already in a group</span>
                                          )}
                                        </label>
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          )}
                        </div>
                        {newGroup.members.length > 0 && (
                          <div className="dashboard-selected-members">
                            <h4>Selected Members:</h4>
                            <ul className="dashboard-selected-members-list">
                              {newGroup.members.map((member) => (
                                <li key={member} className="dashboard-selected-member-item">
                                  <div className="dashboard-member-avatar">{member.charAt(0).toUpperCase()}</div>
                                  <span className="dashboard-member-name">{member}</span>
                                  <button
                                    type="button"
                                    className="dashboard-remove-member"
                                    onClick={() => handleAddMember(member)}
                                    aria-label={`Remove ${member}`}
                                  >
                                    <span className="dashboard-remove-icon">×</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <button className="dashboard-button" type="submit">
                        <MdGroupAdd className="dashboard-button-icon" />
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
                {participationStatus !== "true" ? (
                  <div className="dashboard-notice">
                    {participationStatus === "pending" ? (
                      <p>Your participation request is pending admin approval.</p>
                    ) : (
                      <p>You need to register for the hackathon first.</p>
                    )}
                    <button className="dashboard-button" onClick={() => setActiveTab("hackathons")}>
                      Go to Hackathons
                    </button>
                  </div>
                ) : userGroups.length === 0 ? (
                  <div className="dashboard-notice">
                    <p>You need to join or create a group first.</p>
                    <button className="dashboard-button" onClick={() => setActiveTab("groups")}>
                      Go to Groups
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpload} className="dashboard-form">
                    <div className="dashboard-form-group">
                      <label>Select Group:</label>
                      <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} required>
                        <option value="">Select a group</option>
                        {userGroups.map((group) => (
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
                    <button className="dashboard-button" type="submit" disabled={loading}>
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
  )
}

export default Dashboard

