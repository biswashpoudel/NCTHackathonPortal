"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  FaUsers,
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt,
  FaUsersCog,
  FaSignOutAlt,
  FaBars,
  FaMedal,
  FaBell,
  FaPlus,
  FaUserPlus,
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUserTie,
  FaCalendarAlt,
  FaEdit,
  FaInfoCircle,
} from "react-icons/fa"
import { RiUserShared2Fill } from "react-icons/ri"
import "./admindashboard.css"

const AdminDashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const username = queryParams.get("username")

  const [activeTab, setActiveTab] = useState("pending-users")
  const [pendingUsers, setPendingUsers] = useState([])
  const [pendingGroups, setPendingGroups] = useState([])
  const [approvedUsers, setApprovedUsers] = useState([])
  const [approvedGroups, setApprovedGroups] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardPublished, setLeaderboardPublished] = useState(false)
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [notification, setNotification] = useState({
    message: "",
    type: "info",
  })
  const [notificationSuccess, setNotificationSuccess] = useState("")
  const [groupChangeRequests, setGroupChangeRequests] = useState([])
  const [groupChangeLoading, setGroupChangeLoading] = useState(false)
  const [showUserRegistrationForm, setShowUserRegistrationForm] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [userRegistrationData, setUserRegistrationData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  })
  const [userRegistrationError, setUserRegistrationError] = useState("")
  const [userRegistrationSuccess, setUserRegistrationSuccess] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [mentors, setMentors] = useState([])
  const [showMentorAssignmentForm, setShowMentorAssignmentForm] = useState(false)
  const [mentorAssignment, setMentorAssignment] = useState({
    mentorId: "",
    groupIds: [],
  })
  const [hackathons, setHackathons] = useState([])
  const [showHackathonForm, setShowHackathonForm] = useState(false)
  const [hackathonFormData, setHackathonFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "upcoming",
  })
  const [selectedHackathon, setSelectedHackathon] = useState(null)

  useEffect(() => {
    if (!username) {
      navigate("/", { replace: true })
      return
    }

    fetchPendingUsers()
    fetchPendingGroups()
    fetchApprovedUsers()
    fetchApprovedGroups()
    fetchSubmissions()
    fetchLeaderboard()
    fetchGroupChangeRequests()
    fetchAllUsers()
    fetchMentors()
    fetchHackathons()
  }, [username, navigate])

  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/pending-users")
      setPendingUsers(res.data)
    } catch (err) {
      console.error("Error fetching pending users", err)
    }
  }

  const fetchPendingGroups = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/groups")
      setPendingGroups(res.data.filter((group) => group.pendingApproval))
    } catch (err) {
      console.error("Error fetching pending groups", err)
    }
  }

  const fetchApprovedUsers = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/participants")
      setApprovedUsers(res.data)
    } catch (err) {
      console.error("Error fetching approved users", err)
    }
  }

  const fetchApprovedGroups = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/groups")
      setApprovedGroups(res.data.filter((group) => !group.pendingApproval))
    } catch (err) {
      console.error("Error fetching approved groups", err)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/api/submissions")
      setSubmissions(res.data)
    } catch (err) {
      console.error("Error fetching submissions", err)
    }
  }

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/api/leaderboard")
      setLeaderboard(res.data)
      setLeaderboardPublished(true) // Assuming leaderboard is published if data exists
    } catch (err) {
      console.error("Error fetching leaderboard", err)
      setLeaderboardPublished(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/all-users")
      setAllUsers(res.data)
    } catch (err) {
      console.error("Error fetching all users", err)
      // For demo purposes, create some mock users
      const mockUsers = [
        {
          _id: "user1",
          username: "john_doe",
          email: "john@example.com",
          role: "user",
          isApproved: true,
        },
        {
          _id: "user2",
          username: "jane_smith",
          email: "jane@example.com",
          role: "user",
          isApproved: true,
        },
        {
          _id: "mentor1",
          username: "mentor_alex",
          email: "alex@example.com",
          role: "mentor",
          isApproved: true,
        },
        {
          _id: "judge1",
          username: "judge_sarah",
          email: "sarah@example.com",
          role: "judge",
          isApproved: true,
        },
      ]
      setAllUsers(mockUsers)
    }
  }

  const fetchMentors = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/mentors")
      setMentors(res.data)
    } catch (err) {
      console.error("Error fetching mentors", err)
      // For demo purposes, create some mock mentors
      const mockMentors = [
        {
          _id: "mentor1",
          username: "mentor_alex",
          email: "alex@example.com",
          assignedGroups: [],
        },
        {
          _id: "mentor2",
          username: "mentor_lisa",
          email: "lisa@example.com",
          assignedGroups: ["group1"],
        },
      ]
      setMentors(mockMentors)
    }
  }

  const fetchHackathons = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/hackathons")
      setHackathons(res.data)
    } catch (err) {
      console.error("Error fetching hackathons", err)
      // For demo purposes, create a mock hackathon
      const mockHackathons = [
        {
          _id: "hack1",
          title: "Summer Code Challenge 2023",
          description: "Build innovative solutions using modern web technologies",
          startDate: "2023-06-15",
          endDate: "2023-06-30",
          status: "active",
          createdBy: "admin",
        },
      ]
      setHackathons(mockHackathons)
    }
  }

  const handleApproveUser = async (username) => {
    setLoading(true)
    try {
      await axios.post("https://ncthackathonportal.onrender.com/approve-participation", {
        username,
      })

      // Refresh data
      fetchPendingUsers()
      fetchApprovedUsers()
      alert(`User ${username} has been approved for participation.`)
    } catch (err) {
      console.error("Error approving user", err)
      alert(`Failed to approve user: ${err.response?.data?.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRejectUser = async (username) => {
    setLoading(true)
    try {
      await axios.post("https://ncthackathonportal.onrender.com/reject-participation", {
        username,
      })

      // Refresh data
      fetchPendingUsers()
      alert(`User ${username}'s participation request has been rejected.`)
    } catch (err) {
      console.error("Error rejecting user", err)
      alert(`Failed to reject user: ${err.response?.data?.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveGroup = async (groupId) => {
    setLoading(true)
    try {
      await axios.post("https://ncthackathonportal.onrender.com/approve-group", {
        groupId,
      })

      // Refresh data
      fetchPendingGroups()
      fetchApprovedGroups()
      alert("Group has been approved successfully.")
    } catch (err) {
      console.error("Error approving group", err)
      alert(`Failed to approve group: ${err.response?.data?.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRejectGroup = async (groupId) => {
    setLoading(true)
    try {
      await axios.post("https://ncthackathonportal.onrender.com/reject-group", {
        groupId,
      })

      // Refresh data
      fetchPendingGroups()
      alert("Group has been rejected.")
    } catch (err) {
      console.error("Error rejecting group", err)
      alert(`Failed to reject group: ${err.response?.data?.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    navigate("/", { replace: true })
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleCreateNotification = async (e) => {
    e.preventDefault()

    if (!notification.message.trim()) {
      alert("Please enter a notification message")
      return
    }

    try {
      await axios.post("https://ncthackathonportal.onrender.com/create-notification", {
        message: notification.message,
        type: notification.type,
        sender: username,
        senderRole: "admin",
        isGlobal: true,
      })

      setNotificationSuccess("Notification sent successfully!")
      setNotification({ message: "", type: "info" })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setNotificationSuccess("")
        setShowNotificationForm(false)
      }, 3000)
    } catch (err) {
      console.error("Error creating notification", err)
      alert("Failed to send notification. Please try again.")
    }
  }

  const fetchGroupChangeRequests = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/pending-group-changes")
      setGroupChangeRequests(res.data)
    } catch (err) {
      console.error("Error fetching group change requests", err)
    }
  }

  const handleApproveGroupChange = async (changeId) => {
    setGroupChangeLoading(true)
    try {
      await axios.post("https://ncthackathonportal.onrender.com/approve-group-change", {
        changeId,
      })

      // Refresh data
      fetchGroupChangeRequests()
      fetchApprovedGroups()
      alert("Group change has been approved successfully.")
    } catch (err) {
      console.error("Error approving group change", err)
      alert(`Failed to approve group change: ${err.response?.data?.message || "Unknown error"}`)
    } finally {
      setGroupChangeLoading(false)
    }
  }

  const handleRejectGroupChange = async (changeId) => {
    setGroupChangeLoading(true)
    try {
      await axios.post("https://ncthackathonportal.onrender.com/reject-group-change", {
        changeId,
      })

      // Refresh data
      fetchGroupChangeRequests()
      alert("Group change has been rejected.")
    } catch (err) {
      console.error("Error rejecting group change", err)
      alert(`Failed to reject group change: ${err.response?.data?.message || "Unknown error"}`)
    } finally {
      setGroupChangeLoading(false)
    }
  }

  const handleUserRegistrationChange = (e) => {
    const { name, value } = e.target
    setUserRegistrationData({ ...userRegistrationData, [name]: value })

    if (name === "username") {
      const usernamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9_-]{1,18}[a-zA-Z0-9])?$/

      if (!usernamePattern.test(value)) {
        setUsernameError(
          "Username must be 3-20 characters, containing only letters, numbers, underscores (_), and hyphens (-). No symbols at the start or end.",
        )
      } else {
        setUsernameError("")
      }
    }
  }

  const handleUserRegistrationSubmit = async (e) => {
    e.preventDefault()
    setUserRegistrationError("")
    setUserRegistrationSuccess("")

    if (userRegistrationData.password !== userRegistrationData.confirmPassword) {
      setUserRegistrationError("Passwords do not match!")
      return
    }

    try {
      const res = await axios.post("https://ncthackathonportal.onrender.com/register", {
        username: userRegistrationData.username,
        email: userRegistrationData.email,
        password: userRegistrationData.password,
        role: userRegistrationData.role,
      })

      setUserRegistrationSuccess("User registered successfully!")
      setUserRegistrationData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
      })
      fetchAllUsers()
      fetchMentors()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUserRegistrationSuccess("")
      }, 3000)
    } catch (err) {
      setUserRegistrationError(err.response?.data?.message || "Error registering user")
    }
  }

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete user ${username}?`)) {
      return
    }

    try {
      await axios.delete(`https://ncthackathonportal.onrender.com/users/${userId}`)
      setUserRegistrationSuccess("User deleted successfully!")
      fetchAllUsers()
      fetchMentors()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUserRegistrationSuccess("")
      }, 3000)
    } catch (err) {
      setUserRegistrationError(err.response?.data?.message || "Error deleting user")
    }
  }

  const handleMentorAssignmentChange = (e) => {
    const { name, value } = e.target

    if (name === "mentorId") {
      setMentorAssignment({ ...mentorAssignment, mentorId: value })
    }
  }

  const handleGroupSelectionChange = (groupId) => {
    const currentGroupIds = [...mentorAssignment.groupIds]

    if (currentGroupIds.includes(groupId)) {
      // Remove group if already selected
      setMentorAssignment({
        ...mentorAssignment,
        groupIds: currentGroupIds.filter((id) => id !== groupId),
      })
    } else {
      // Add group if not selected
      setMentorAssignment({
        ...mentorAssignment,
        groupIds: [...currentGroupIds, groupId],
      })
    }
  }

  const handleMentorAssignmentSubmit = async (e) => {
    e.preventDefault()

    if (!mentorAssignment.mentorId || mentorAssignment.groupIds.length === 0) {
      alert("Please select a mentor and at least one group")
      return
    }

    try {
      await axios.post("https://ncthackathonportal.onrender.com/assign-mentor", {
        mentorId: mentorAssignment.mentorId,
        groupIds: mentorAssignment.groupIds,
      })

      alert("Mentor assigned to groups successfully!")
      setMentorAssignment({ mentorId: "", groupIds: [] })
      setShowMentorAssignmentForm(false)
      fetchMentors()
      fetchApprovedGroups()
    } catch (err) {
      console.error("Error assigning mentor to groups", err)
      alert(`Failed to assign mentor: ${err.response?.data?.message || "Unknown error"}`)
    }
  }

  const handleHackathonFormChange = (e) => {
    const { name, value } = e.target
    setHackathonFormData({ ...hackathonFormData, [name]: value })
  }

  const handleHackathonSubmit = async (e) => {
    e.preventDefault()

    try {
      if (selectedHackathon) {
        // Update existing hackathon
        await axios.put(
          `https://ncthackathonportal.onrender.com/hackathons/${selectedHackathon._id}`,
          hackathonFormData,
        )
        alert("Hackathon updated successfully!")
      } else {
        // Create new hackathon
        await axios.post("https://ncthackathonportal.onrender.com/hackathons", {
          ...hackathonFormData,
          createdBy: username,
        })
        alert("Hackathon created successfully!")
      }

      setHackathonFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "upcoming",
      })
      setSelectedHackathon(null)
      setShowHackathonForm(false)
      fetchHackathons()
    } catch (err) {
      console.error("Error with hackathon", err)
      alert(
        `Failed to ${selectedHackathon ? "update" : "create"} hackathon: ${err.response?.data?.message || "Unknown error"}`,
      )
    }
  }

  const handleEditHackathon = (hackathon) => {
    setSelectedHackathon(hackathon)
    setHackathonFormData({
      title: hackathon.title,
      description: hackathon.description,
      startDate: hackathon.startDate.substring(0, 10), // Format date for input
      endDate: hackathon.endDate.substring(0, 10), // Format date for input
      status: hackathon.status,
    })
    setShowHackathonForm(true)
  }

  const handleDeleteHackathon = async (hackathonId) => {
    if (!confirm("Are you sure you want to delete this hackathon?")) {
      return
    }

    try {
      await axios.delete(`https://ncthackathonportal.onrender.com/hackathons/${hackathonId}`)
      alert("Hackathon deleted successfully!")
      fetchHackathons()
    } catch (err) {
      console.error("Error deleting hackathon", err)
      alert(`Failed to delete hackathon: ${err.response?.data?.message || "Unknown error"}`)
    }
  }

  const menuItems = [
    { id: "pending-users", label: "Pending Users", icon: <RiUserShared2Fill /> },
    { id: "pending-groups", label: "Pending Groups", icon: <FaUsersCog /> },
    { id: "group-changes", label: "Group Changes", icon: <FaUsersCog /> },
    { id: "approved-users", label: "Approved Users", icon: <FaUserCheck /> },
    { id: "approved-groups", label: "Approved Groups", icon: <FaUsers /> },
    { id: "submissions", label: "Submissions", icon: <FaFileAlt /> },
    { id: "leaderboard", label: "Leaderboard", icon: <FaMedal /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "user-management", label: "User Management", icon: <FaUserPlus /> },
    { id: "mentor-management", label: "Mentor Management", icon: <FaUserTie /> },
    { id: "hackathons", label: "Hackathons", icon: <FaCalendarAlt /> },
  ]

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-navbar">
        <div className="admin-dashboard-navbar-left">
          <button className="admin-dashboard-menu-toggle" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <h2 className="admin-dashboard-title">Admin Dashboard</h2>
        </div>

        <div className="admin-dashboard-navbar-right">
          <span className="admin-dashboard-username">Hi, {username}</span>
          <button className="admin-dashboard-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="admin-dashboard-main">
        <div className={`admin-dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <button className="admin-dashboard-sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
          <ul className="admin-dashboard-sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)}>
                <span className="admin-dashboard-menu-icon">{item.icon}</span>
                <span className="admin-dashboard-menu-text">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-dashboard-content">
          <div className="admin-dashboard-stats">
            <div className="admin-dashboard-stat-card">
              <div className="admin-dashboard-stat-icon purple">
                <FaUsers />
              </div>
              <div className="admin-dashboard-stat-title">Pending Users</div>
              <div className="admin-dashboard-stat-value">{pendingUsers.length}</div>
            </div>
            <div className="admin-dashboard-stat-card">
              <div className="admin-dashboard-stat-icon blue">
                <FaUsersCog />
              </div>
              <div className="admin-dashboard-stat-title">Pending Groups</div>
              <div className="admin-dashboard-stat-value">{pendingGroups.length}</div>
            </div>
            <div className="admin-dashboard-stat-card">
              <div className="admin-dashboard-stat-icon green">
                <FaUserCheck />
              </div>
              <div className="admin-dashboard-stat-title">Approved Users</div>
              <div className="admin-dashboard-stat-value">{approvedUsers.length}</div>
            </div>
            <div className="admin-dashboard-stat-card">
              <div className="admin-dashboard-stat-icon amber">
                <FaFileAlt />
              </div>
              <div className="admin-dashboard-stat-title">Total Submissions</div>
              <div className="admin-dashboard-stat-value">{submissions.length}</div>
            </div>
          </div>
          {activeTab === "pending-users" && (
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <h2>Pending User Approvals</h2>
              </div>
              <div className="admin-dashboard-section-body">
                {pendingUsers.length > 0 ? (
                  <div className="admin-dashboard-table-container">
                    <table className="admin-dashboard-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingUsers.map((user) => (
                          <tr key={user.username}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td className="admin-dashboard-actions">
                              <button
                                className="admin-dashboard-approve-btn"
                                onClick={() => handleApproveUser(user.username)}
                                disabled={loading}
                              >
                                <FaCheckCircle /> Approve
                              </button>
                              <button
                                className="admin-dashboard-reject-btn"
                                onClick={() => handleRejectUser(user.username)}
                                disabled={loading}
                              >
                                <FaTimesCircle /> Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="admin-dashboard-empty-state">No pending user approvals.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "pending-groups" && (
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <h2>Pending Group Approvals</h2>
              </div>
              <div className="admin-dashboard-section-body">
                {pendingGroups.length > 0 ? (
                  <div className="admin-dashboard-table-container">
                    <table className="admin-dashboard-table">
                      <thead>
                        <tr>
                          <th>Group Name</th>
                          <th>Created By</th>
                          <th>Members</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingGroups.map((group) => (
                          <tr key={group._id}>
                            <td>{group.name}</td>
                            <td>{group.createdBy}</td>
                            <td>{group.members.join(", ")}</td>
                            <td className="admin-dashboard-actions">
                              <button
                                className="admin-dashboard-approve-btn"
                                onClick={() => handleApproveGroup(group._id)}
                                disabled={loading}
                              >
                                <FaCheckCircle /> Approve
                              </button>
                              <button
                                className="admin-dashboard-reject-btn"
                                onClick={() => handleRejectGroup(group._id)}
                                disabled={loading}
                              >
                                <FaTimesCircle /> Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="admin-dashboard-empty-state">No pending group approvals.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "approved-users" && (
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <h2>Approved Users</h2>
              </div>
              <div className="admin-dashboard-section-body">
                {approvedUsers.length > 0 ? (
                  <div className="admin-dashboard-table-container">
                    <table className="admin-dashboard-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedUsers.map((user) => (
                          <tr key={user.username}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="admin-dashboard-empty-state">No approved users yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "approved-groups" && (
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <h2>Approved Groups</h2>
              </div>
              <div className="admin-dashboard-section-body">
                {approvedGroups.length > 0 ? (
                  <div className="admin-dashboard-table-container">
                    <table className="admin-dashboard-table">
                      <thead>
                        <tr>
                          <th>Group Name</th>
                          <th>Created By</th>
                          <th>Members</th>
                          <th>Assigned Mentor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedGroups.map((group) => (
                          <tr key={group._id}>
                            <td>{group.name}</td>
                            <td>{group.createdBy}</td>
                            <td>{group.members.join(", ")}</td>
                            <td>{group.assignedMentor || "None"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="admin-dashboard-empty-state">No approved groups yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <h2>All Submissions</h2>
              </div>
              <div className="admin-dashboard-section-body">
                {submissions.length > 0 ? (
                  <div className="admin-dashboard-table-container">
                    <table className="admin-dashboard-table">
                      <thead>
                        <tr>
                          <th>Filename</th>
                          <th>Uploaded By</th>
                          <th>Group</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((submission) => (
                          <tr key={submission._id}>
                            <td>{submission.filename}</td>
                            <td>{submission.uploadedBy}</td>
                            <td>{submission.groupName}</td>
                            <td>{new Date(submission.date).toLocaleString()}</td>
                            <td>
                              <a
                                href={`https://ncthackathonportal.onrender.com/download/${submission.filename}`}
                                className="admin-dashboard-download-btn"
                              >
                                Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="admin-dashboard-empty-state">No submissions yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <h2>Leaderboard</h2>
              </div>
              <div className="admin-dashboard-section-body">
                {loading ? (
                  <p className="admin-dashboard-loading">Loading leaderboard...</p>
                ) : leaderboard.length > 0 ? (
                  <div className="admin-dashboard-leaderboard">
                    <div className="admin-dashboard-leaderboard-header">
                      <div className="admin-dashboard-leaderboard-rank">Rank</div>
                      <div className="admin-dashboard-leaderboard-group">Group</div>
                      <div className="admin-dashboard-leaderboard-members">Members</div>
                      <div className="admin-dashboard-leaderboard-score">Score</div>
                    </div>
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry._id}
                        className={`admin-dashboard-leaderboard-row ${index < 3 ? `top-${index + 1}` : ""}`}
                      >
                        <div className="admin-dashboard-leaderboard-rank">
                          {index < 3 ? <FaMedal className={`medal-${index + 1}`} /> : index + 1}
                        </div>
                        <div className="admin-dashboard-leaderboard-group">{entry.groupName}</div>
                        <div className="admin-dashboard-leaderboard-members">{entry.members.join(", ")}</div>
                        <div className="admin-dashboard-leaderboard-score">{entry.grade}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-dashboard-empty-state">
                    {leaderboardPublished
                      ? "No leaderboard data available yet."
                      : "The leaderboard has not been published yet."}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <h2>Notifications</h2>
                <button
                  className="admin-dashboard-button"
                  onClick={() => setShowNotificationForm(!showNotificationForm)}
                >
                  <FaPlus /> Create Notification
                </button>
              </div>
              <div className="admin-dashboard-section-body">
                {notificationSuccess && <div className="admin-dashboard-success-message">{notificationSuccess}</div>}

                {showNotificationForm && (
                  <form onSubmit={handleCreateNotification} className="admin-dashboard-form">
                    <div className="admin-dashboard-form-group">
                      <label>Notification Type:</label>
                      <select
                        value={notification.type}
                        onChange={(e) => setNotification({ ...notification, type: e.target.value })}
                      >
                        <option value="info">Information</option>
                        <option value="warning">Warning</option>
                        <option value="announcement">Announcement</option>
                        <option value="success">Success</option>
                      </select>
                    </div>
                    <div className="admin-dashboard-form-group">
                      <label>Message:</label>
                      <textarea
                        value={notification.message}
                        onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                        placeholder="Enter your notification message here..."
                        rows={4}
                        required
                      />
                    </div>
                    <button type="submit" className="admin-dashboard-button">
                      Send Notification
                    </button>
                  </form>
                )}

                <p className="admin-dashboard-info">
                  Notifications will be sent to all users and will appear in their notification panel.
                </p>
              </div>
            </div>
          )}
          {activeTab === "group-changes" && (
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <h2>Pending Group Member Changes</h2>
              </div>
              <div className="admin-dashboard-section-body">
                {groupChangeRequests.length > 0 ? (
                  <div className="admin-dashboard-table-container">
                    <table className="admin-dashboard-table">
                      <thead>
                        <tr>
                          <th>Group Name</th>
                          <th>Requested By</th>
                          <th>Change Type</th>
                          <th>Members</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupChangeRequests.map((change) => (
                          <tr key={change._id}>
                            <td>{change.groupName}</td>
                            <td>{change.requestedBy}</td>
                            <td>
                              <span
                                className={`admin-dashboard-status admin-dashboard-status-${change.changeType === "add" ? "approved" : "rejected"}`}
                              >
                                {change.changeType === "add" ? "Add Members" : "Remove Members"}
                              </span>
                            </td>
                            <td>{change.members.join(", ")}</td>
                            <td className="admin-dashboard-actions">
                              <button
                                className="admin-dashboard-approve-btn"
                                onClick={() => handleApproveGroupChange(change._id)}
                                disabled={groupChangeLoading}
                              >
                                <FaCheckCircle /> Approve
                              </button>
                              <button
                                className="admin-dashboard-reject-btn"
                                onClick={() => handleRejectGroupChange(change._id)}
                                disabled={groupChangeLoading}
                              >
                                <FaTimesCircle /> Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="admin-dashboard-empty-state">No pending group member changes.</p>
                )}
              </div>
            </div>
          )}
          {activeTab === "user-management" && (
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <h2>User Management</h2>
                <button
                  className="admin-dashboard-button"
                  onClick={() => setShowUserRegistrationForm(!showUserRegistrationForm)}
                >
                  {showUserRegistrationForm ? "Hide Form" : "Register New User"}
                </button>
              </div>
              <div className="admin-dashboard-section-body">
                {userRegistrationSuccess && (
                  <div className="admin-dashboard-success-message">{userRegistrationSuccess}</div>
                )}
                {userRegistrationError && <div className="admin-dashboard-error-message">{userRegistrationError}</div>}

                {showUserRegistrationForm && (
                  <form onSubmit={handleUserRegistrationSubmit} className="admin-dashboard-form">
                    <div className="admin-dashboard-form-group">
                      <label>Username:</label>
                      <input
                        type="text"
                        name="username"
                        value={userRegistrationData.username}
                        onChange={handleUserRegistrationChange}
                        required
                      />
                      {usernameError && <p className="admin-dashboard-form-error">{usernameError}</p>}
                    </div>
                    <div className="admin-dashboard-form-group">
                      <label>Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={userRegistrationData.email}
                        onChange={handleUserRegistrationChange}
                        required
                      />
                    </div>
                    <div className="admin-dashboard-form-group">
                      <label>Password:</label>
                      <input
                        type="password"
                        name="password"
                        value={userRegistrationData.password}
                        onChange={handleUserRegistrationChange}
                        required
                      />
                    </div>
                    <div className="admin-dashboard-form-group">
                      <label>Confirm Password:</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={userRegistrationData.confirmPassword}
                        onChange={handleUserRegistrationChange}
                        required
                      />
                    </div>
                    <div className="admin-dashboard-form-group">
                      <label>Role:</label>
                      <select
                        name="role"
                        value={userRegistrationData.role}
                        onChange={handleUserRegistrationChange}
                        required
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="judge">Judge</option>
                        <option value="mentor">Mentor</option>
                      </select>
                    </div>
                    <button type="submit" className="admin-dashboard-button">
                      <FaUserPlus /> Register User
                    </button>
                  </form>
                )}

                <div className="admin-dashboard-section-header">
                  <h2>All Users</h2>
                </div>
                <div className="admin-dashboard-table-container">
                  <table className="admin-dashboard-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user) => (
                        <tr key={user._id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`admin-dashboard-status admin-dashboard-status-${user.role}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`admin-dashboard-status ${
                                user.isApproved ? "admin-dashboard-status-approved" : "admin-dashboard-status-pending"
                              }`}
                            >
                              {user.isApproved ? "Approved" : "Pending"}
                            </span>
                          </td>
                          <td className="admin-dashboard-actions">
                            <button
                              className="admin-dashboard-reject-btn"
                              onClick={() => handleDeleteUser(user._id, user.username)}
                            >
                              <FaTrashAlt /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mentor-management" && (
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <h2>Mentor Management</h2>
                <button
                  className="admin-dashboard-button"
                  onClick={() => setShowMentorAssignmentForm(!showMentorAssignmentForm)}
                >
                  {showMentorAssignmentForm ? "Hide Form" : "Assign Mentors to Groups"}
                </button>
              </div>
              <div className="admin-dashboard-section-body">
                {showMentorAssignmentForm && (
                  <form onSubmit={handleMentorAssignmentSubmit} className="admin-dashboard-form">
                    <div className="admin-dashboard-form-group">
                      <label>Select Mentor:</label>
                      <select
                        name="mentorId"
                        value={mentorAssignment.mentorId}
                        onChange={handleMentorAssignmentChange}
                        required
                      >
                        <option value="">-- Select a Mentor --</option>
                        {allUsers
                          .filter((user) => user.role === "mentor")
                          .map((mentor) => (
                            <option key={mentor._id} value={mentor._id}>
                              {mentor.username} ({mentor.email})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="admin-dashboard-form-group">
                      <label>Select Groups to Assign:</label>
                      <div className="admin-dashboard-checkbox-group">
                        {approvedGroups.map((group) => (
                          <div key={group._id} className="admin-dashboard-checkbox-item">
                            <input
                              type="checkbox"
                              id={`group-${group._id}`}
                              checked={mentorAssignment.groupIds.includes(group._id)}
                              onChange={() => handleGroupSelectionChange(group._id)}
                            />
                            <label htmlFor={`group-${group._id}`}>
                              {group.name} ({group.members.length} members)
                              {group.assignedMentor && (
                                <span className="admin-dashboard-assigned-mentor">
                                  Currently assigned to: {group.assignedMentor}
                                </span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="admin-dashboard-button">
                      <FaUserTie /> Assign Mentor to Groups
                    </button>
                  </form>
                )}

                <div className="admin-dashboard-section-header">
                  <h2>Current Mentor Assignments</h2>
                </div>
                <div className="admin-dashboard-table-container">
                  <table className="admin-dashboard-table">
                    <thead>
                      <tr>
                        <th>Mentor</th>
                        <th>Email</th>
                        <th>Assigned Groups</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers
                        .filter((user) => user.role === "mentor")
                        .map((mentor) => {
                          const assignedGroups = approvedGroups.filter(
                            (group) => group.assignedMentor === mentor.username,
                          )
                          return (
                            <tr key={mentor._id}>
                              <td>{mentor.username}</td>
                              <td>{mentor.email}</td>
                              <td>
                                {assignedGroups.length > 0
                                  ? assignedGroups.map((g) => g.name).join(", ")
                                  : "No groups assigned"}
                              </td>
                              <td className="admin-dashboard-actions">
                                <button
                                  className="admin-dashboard-button"
                                  onClick={() => {
                                    setMentorAssignment({
                                      mentorId: mentor._id,
                                      groupIds: assignedGroups.map((g) => g._id),
                                    })
                                    setShowMentorAssignmentForm(true)
                                  }}
                                >
                                  <FaEdit /> Edit Assignments
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "hackathons" && (
            <div className="admin-dashboard-section">
              <div className="admin-dashboard-section-header">
                <h2>Hackathons</h2>
                <button
                  className="admin-dashboard-button"
                  onClick={() => {
                    setSelectedHackathon(null)
                    setHackathonFormData({
                      title: "",
                      description: "",
                      startDate: "",
                      endDate: "",
                      status: "upcoming",
                    })
                    setShowHackathonForm(!showHackathonForm)
                  }}
                >
                  {showHackathonForm && !selectedHackathon ? "Hide Form" : "Create New Hackathon"}
                </button>
              </div>
              <div className="admin-dashboard-section-body">
                {showHackathonForm && (
                  <form onSubmit={handleHackathonSubmit} className="admin-dashboard-form">
                    <div className="admin-dashboard-form-group">
                      <label>Hackathon Title:</label>
                      <input
                        type="text"
                        name="title"
                        value={hackathonFormData.title}
                        onChange={handleHackathonFormChange}
                        required
                      />
                    </div>
                    <div className="admin-dashboard-form-group">
                      <label>Description:</label>
                      <textarea
                        name="description"
                        value={hackathonFormData.description}
                        onChange={handleHackathonFormChange}
                        rows={4}
                        required
                      />
                    </div>
                    <div className="admin-dashboard-form-group">
                      <label>Start Date:</label>
                      <input
                        type="date"
                        name="startDate"
                        value={hackathonFormData.startDate}
                        onChange={handleHackathonFormChange}
                        required
                      />
                    </div>
                    <div className="admin-dashboard-form-group">
                      <label>End Date:</label>
                      <input
                        type="date"
                        name="endDate"
                        value={hackathonFormData.endDate}
                        onChange={handleHackathonFormChange}
                        required
                      />
                    </div>
                    <div className="admin-dashboard-form-group">
                      <label>Status:</label>
                      <select
                        name="status"
                        value={hackathonFormData.status}
                        onChange={handleHackathonFormChange}
                        required
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <button type="submit" className="admin-dashboard-button">
                      <FaCalendarAlt /> {selectedHackathon ? "Update Hackathon" : "Create Hackathon"}
                    </button>
                  </form>
                )}

                <div className="admin-dashboard-hackathons-grid">
                  {hackathons.length > 0 ? (
                    hackathons.map((hackathon) => (
                      <div key={hackathon._id} className="admin-dashboard-hackathon-card">
                        <div className="admin-dashboard-hackathon-header">
                          <h3>{hackathon.title}</h3>
                          <span className={`admin-dashboard-status admin-dashboard-status-${hackathon.status}`}>
                            {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                          </span>
                        </div>
                        <div className="admin-dashboard-hackathon-body">
                          <p>{hackathon.description}</p>
                          <div className="admin-dashboard-hackathon-dates">
                            <div>
                              <strong>Start Date:</strong> {new Date(hackathon.startDate).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>End Date:</strong> {new Date(hackathon.endDate).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>Created By:</strong> {hackathon.createdBy}
                            </div>
                          </div>
                        </div>
                        <div className="admin-dashboard-hackathon-footer">
                          <button
                            className="admin-dashboard-button admin-dashboard-button-small"
                            onClick={() => handleEditHackathon(hackathon)}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            className="admin-dashboard-button admin-dashboard-button-small admin-dashboard-button-danger"
                            onClick={() => handleDeleteHackathon(hackathon._id)}
                          >
                            <FaTrashAlt /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="admin-dashboard-empty-state-card">
                      <FaInfoCircle className="admin-dashboard-empty-icon" />
                      <p>No hackathons have been created yet.</p>
                      <p>Click the "Create New Hackathon" button to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

