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
} from "react-icons/fa"
import "./admindashboard.css" // You'll need to create this CSS file

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

  const menuItems = [
    { id: "pending-users", label: "Pending Users", icon: <FaUsers /> },
    { id: "pending-groups", label: "Pending Groups", icon: <FaUsersCog /> },
    { id: "approved-users", label: "Approved Users", icon: <FaUserCheck /> },
    { id: "approved-groups", label: "Approved Groups", icon: <FaUsersCog /> },
    { id: "submissions", label: "Submissions", icon: <FaFileAlt /> },
    { id: "leaderboard", label: "Leaderboard", icon: <FaMedal /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
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
          <span className="admin-dashboard-username">{username}</span>
          <button className="admin-dashboard-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="admin-dashboard-main">
        <div className={`admin-dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}>
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
                        </tr>
                      </thead>
                      <tbody>
                        {approvedGroups.map((group) => (
                          <tr key={group._id}>
                            <td>{group.name}</td>
                            <td>{group.createdBy}</td>
                            <td>{group.members.join(", ")}</td>
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
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

