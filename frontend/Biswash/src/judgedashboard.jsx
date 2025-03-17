"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  FaTrophy,
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
  FaCheck,
  FaMedal,
  FaGlobe,
  FaPlus,
  FaBan,
  FaUsers,
  FaUserFriends,
  FaSearch,
} from "react-icons/fa"
import "./judgedashboard.css"

const JudgeDashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const username = queryParams.get("username")

  const [activeTab, setActiveTab] = useState("judgeSubmissions")
  const [submissions, setSubmissions] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [publishLoading, setPublishLoading] = useState(false)
  const [leaderboardPublished, setLeaderboardPublished] = useState(false)
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [notification, setNotification] = useState({
    message: "",
    type: "info",
  })
  const [notificationSuccess, setNotificationSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Base URL for API endpoints
  const API_BASE_URL = "https://ncthackathonportal.onrender.com"

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
    fetchAllSubmissions()
    checkLeaderboardStatus()
  }, [username, navigate])

  useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchLeaderboard()
    } else if (activeTab === "groups") {
      fetchGroups()
    }
  }, [activeTab])

  const fetchAllSubmissions = async () => {
    try {
      setLoading(true)
      // Using the api/submissions endpoint from your server.js which returns all submissions
      const res = await axios.get(`${API_BASE_URL}/api/submissions`)
      setSubmissions(res.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching submissions", err)
      setError("Failed to load submissions. Please try again.")
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE_URL}/groups`)
      setGroups(res.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching groups", err)
      setError("Failed to load groups. Please try again.")
      setLoading(false)
    }
  }

  const checkLeaderboardStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/leaderboard-status`)
      setLeaderboardPublished(res.data.published)
    } catch (err) {
      console.error("Error checking leaderboard status", err)
      setLeaderboardPublished(false)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE_URL}/leaderboard`)
      setLeaderboard(res.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching leaderboard", err)
      setError("Failed to load leaderboard. Please try again.")
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    navigate("/", { replace: true })
  }

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleGradeChange = (submissionId, grade) => {
    const updatedSubmissions = submissions.map((submission) =>
      submission._id === submissionId ? { ...submission, grade: Number(grade) } : submission,
    )
    setSubmissions(updatedSubmissions)
  }

  const handleFeedbackChange = (submissionId, feedback) => {
    const updatedSubmissions = submissions.map((submission) =>
      submission._id === submissionId ? { ...submission, feedback } : submission,
    )
    setSubmissions(updatedSubmissions)
  }

  const submitGradeAndFeedback = async (submissionId) => {
    const submission = submissions.find((sub) => sub._id === submissionId)

    // Validate inputs
    if (!submission.grade && submission.grade !== 0) {
      setError("Please provide a grade (0-100).")
      return
    }

    if (!submission.feedback || submission.feedback.trim() === "") {
      setError("Please provide feedback.")
      return
    }

    if (submission.grade < 0 || submission.grade > 100) {
      setError("Grade must be between 0 and 100.")
      return
    }

    try {
      // Using the submit-feedback endpoint from your server.js
      await axios.post(`${API_BASE_URL}/submit-feedback`, {
        submissionId,
        grade: submission.grade,
        feedback: submission.feedback,
      })

      setSuccessMessage("Grade and feedback submitted successfully!")
      setError(null)

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)

      // Refresh submissions to get updated data
      fetchAllSubmissions()
    } catch (err) {
      console.error("Error submitting grade and feedback", err)
      setError("Failed to submit. Please try again.")
    }
  }

  const handleDownload = (filename) => {
    window.open(`${API_BASE_URL}/download/${filename}`, "_blank")
  }

  const publishLeaderboard = async () => {
    // Check if all submissions have been graded
    const ungradedSubmissions = submissions.filter((sub) => sub.grade === null || sub.grade === undefined)

    if (ungradedSubmissions.length > 0) {
      setError(
        `There are ${ungradedSubmissions.length} ungraded submissions. Please grade all submissions before publishing.`,
      )
      return
    }

    try {
      setPublishLoading(true)
      await axios.post(`${API_BASE_URL}/publish-leaderboard`)
      setLeaderboardPublished(true)
      setSuccessMessage("Leaderboard published successfully! All participants can now view the results.")
      setError(null)

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)

      setPublishLoading(false)
    } catch (err) {
      console.error("Error publishing leaderboard", err)
      setError("Failed to publish leaderboard. Please try again.")
      setPublishLoading(false)
    }
  }

  const unpublishLeaderboard = async () => {
    try {
      setPublishLoading(true)
      await axios.post(`${API_BASE_URL}/unpublish-leaderboard`)
      setLeaderboardPublished(false)
      setSuccessMessage("Leaderboard unpublished successfully! Results are now hidden from participants.")
      setError(null)

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)

      setPublishLoading(false)
    } catch (err) {
      console.error("Error unpublishing leaderboard", err)
      setError("Failed to unpublish leaderboard. Please try again.")
      setPublishLoading(false)
    }
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
        senderRole: "judge",
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

  // Filter groups based on search term
  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.members.some((member) => member.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const menuItems = [
    { id: "judgeSubmissions", label: "View Submissions", icon: <FaLaptopCode /> },
    { id: "leaderboard", label: "Leaderboard", icon: <FaTrophy /> },
    { id: "groups", label: "Groups", icon: <FaUsers /> },
    { id: "discussion", label: "Discussion", icon: <FaComments /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
  ]

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
              <li key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)}>
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
                <div className="dashboard-header-actions">
                  <button
                    className={`dashboard-publish-button ${leaderboardPublished ? "published" : ""}`}
                    onClick={publishLeaderboard}
                    disabled={publishLoading || leaderboardPublished}
                  >
                    {publishLoading ? (
                      "Publishing..."
                    ) : leaderboardPublished ? (
                      <>
                        <FaCheck className="dashboard-button-icon" /> Published
                      </>
                    ) : (
                      <>
                        <FaGlobe className="dashboard-button-icon" /> Publish Leaderboard
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Show error messages */}
              {error && <div className="dashboard-error-message">{error}</div>}

              {/* Show success messages */}
              {successMessage && <div className="dashboard-success-message">{successMessage}</div>}

              <div className="dashboard-section-body">
                {loading ? (
                  <p className="dashboard-loading">Loading submissions...</p>
                ) : submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <div key={submission._id} className="dashboard-submission-item">
                      <div className="dashboard-submission-info">
                        <h3>{submission.filename}</h3>
                        <p>
                          Uploaded by: <b>{submission.uploadedBy}</b>
                        </p>
                        <p>
                          Group: <b>{submission.groupName}</b>
                        </p>
                        <p>
                          Date: <b>{new Date(submission.date).toLocaleString()}</b>
                        </p>

                        {/* Display existing grade and feedback if available */}
                        {submission.grade !== null && (
                          <div className="dashboard-existing-feedback">
                            <p>
                              Grade: <b>{submission.grade}</b>
                            </p>
                            <p>
                              Feedback: <b>{submission.feedback}</b>
                            </p>
                          </div>
                        )}
                      </div>

                      <button onClick={() => handleDownload(submission.filename)} className="dashboard-view-button">
                        <FaDownload /> Download
                      </button>

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
                        <button className="dashboard-button" onClick={() => submitGradeAndFeedback(submission._id)}>
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
                <div className="dashboard-header-actions">
                  {!leaderboardPublished ? (
                    <button className="dashboard-publish-button" onClick={publishLeaderboard} disabled={publishLoading}>
                      {publishLoading ? (
                        "Publishing..."
                      ) : (
                        <>
                          <FaGlobe className="dashboard-button-icon" /> Publish Leaderboard
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="dashboard-publish-button dashboard-unpublish-button"
                      onClick={unpublishLeaderboard}
                      disabled={publishLoading}
                    >
                      {publishLoading ? (
                        "Unpublishing..."
                      ) : (
                        <>
                          <FaBan className="dashboard-button-icon" /> Unpublish Leaderboard
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="dashboard-section-body">
                {!leaderboardPublished ? (
                  <div className="dashboard-notice">
                    <p>The leaderboard has not been published yet.</p>
                    {submissions.some((sub) => sub.grade !== null) && (
                      <button className="dashboard-button" onClick={publishLeaderboard} disabled={publishLoading}>
                        {publishLoading ? "Publishing..." : "Publish Leaderboard"}
                      </button>
                    )}
                  </div>
                ) : loading ? (
                  <p className="dashboard-loading">Loading leaderboard...</p>
                ) : leaderboard.length > 0 ? (
                  <div className="dashboard-leaderboard">
                    <div className="dashboard-leaderboard-header">
                      <div className="dashboard-leaderboard-rank">Rank</div>
                      <div className="dashboard-leaderboard-group">Group</div>
                      <div className="dashboard-leaderboard-members">Members</div>
                      <div className="dashboard-leaderboard-score">Score</div>
                    </div>
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry._id}
                        className={`dashboard-leaderboard-row ${index < 3 ? `top-${index + 1}` : ""}`}
                      >
                        <div className="dashboard-leaderboard-rank">
                          {index < 3 ? <FaMedal className={`medal-${index + 1}`} /> : index + 1}
                        </div>
                        <div className="dashboard-leaderboard-group">{entry.groupName}</div>
                        <div className="dashboard-leaderboard-members">{entry.members.join(", ")}</div>
                        <div className="dashboard-leaderboard-score">{entry.grade}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="dashboard-empty-state">No leaderboard data available.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "groups" && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>All Groups</h2>
                <div className="dashboard-search">
                  <FaSearch className="dashboard-search-icon" />
                  <input
                    type="text"
                    placeholder="Search groups or members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="dashboard-section-body">
                {loading ? (
                  <p className="dashboard-loading">Loading groups...</p>
                ) : filteredGroups.length > 0 ? (
                  <div className="dashboard-groups-grid">
                    {filteredGroups.map((group) => (
                      <div key={group._id} className="dashboard-group-card">
                        <div className="dashboard-group-card-header">
                          <h3>{group.name}</h3>
                          <span className={`dashboard-group-status ${group.pendingApproval ? "pending" : "approved"}`}>
                            {group.pendingApproval ? "Pending Approval" : "Approved"}
                          </span>
                        </div>
                        <div className="dashboard-group-card-body">
                          <p className="dashboard-group-description">{group.description}</p>
                          <div className="dashboard-group-members">
                            <h4>
                              <FaUserFriends /> Members ({group.members.length})
                            </h4>
                            <ul className="dashboard-members-list">
                              {group.members.map((member, index) => (
                                <li key={index} className="dashboard-member-item">
                                  <div className="dashboard-member-avatar">{member.charAt(0).toUpperCase()}</div>
                                  <span>{member}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="dashboard-group-meta">
                            <p>
                              Created by: <b>{group.createdBy}</b>
                            </p>
                            <p>
                              Created on: <b>{new Date(group.createdAt).toLocaleDateString()}</b>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="dashboard-empty-state">
                    {searchTerm ? "No groups match your search." : "No groups have been created yet."}
                  </p>
                )}
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
                <button className="dashboard-button" onClick={() => setShowNotificationForm(!showNotificationForm)}>
                  <FaPlus /> Create Notification
                </button>
              </div>
              <div className="dashboard-section-body">
                {notificationSuccess && <div className="dashboard-success-message">{notificationSuccess}</div>}

                {showNotificationForm && (
                  <form onSubmit={handleCreateNotification} className="dashboard-form">
                    <div className="dashboard-form-group">
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
                    <div className="dashboard-form-group">
                      <label>Message:</label>
                      <textarea
                        value={notification.message}
                        onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                        placeholder="Enter your notification message here..."
                        rows={4}
                        required
                      />
                    </div>
                    <button type="submit" className="dashboard-button">
                      Send Notification
                    </button>
                  </form>
                )}

                <p className="dashboard-empty-state">
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

export default JudgeDashboard

