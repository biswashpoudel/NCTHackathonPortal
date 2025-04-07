"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import {
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
  FaUserFriends,
  FaSearch,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlus,
  FaPaperPlane,
  FaCode,
} from "react-icons/fa"
import "./mentordashboard.css"

const MentorDashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const username = queryParams.get("username")

  const [activeTab, setActiveTab] = useState("hackathons")
  const [assignedGroups, setAssignedGroups] = useState([])
  const [allGroups, setAllGroups] = useState([])
  const [hackathons, setHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [notification, setNotification] = useState({
    message: "",
    type: "info",
    recipients: [],
  })
  const [notificationSuccess, setNotificationSuccess] = useState("")

  const dropdownRef = useRef(null)
  const sidebarRef = useRef(null)

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
    fetchHackathons()
    fetchAssignedGroups()
    fetchAllGroups()
    fetchNotifications()
  }, [username, navigate])

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

  const fetchHackathons = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE_URL}/hackathons`)
      setHackathons(res.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching hackathons", err)
      setError("Failed to load hackathons. Please try again.")
      setLoading(false)
    }
  }

  const fetchAssignedGroups = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE_URL}/mentor-assigned-groups?username=${username}`)
      setAssignedGroups(res.data || [])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching assigned groups", err)
      setAssignedGroups([])
      setLoading(false)
    }
  }

  const fetchAllGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/groups`)
      setAllGroups(res.data)
    } catch (err) {
      console.error("Error fetching all groups", err)
      setAllGroups([])
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications?username=${username}`)
      setNotifications(res.data)

      const unread = res.data.filter((notification) => !notification.isRead).length
      setUnreadCount(unread)
    } catch (err) {
      console.error("Error fetching notifications", err)
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/unread-notification-count?username=${username}`)
      setUnreadCount(res.data.count)
    } catch (err) {
      console.error("Error fetching unread count", err)
      setUnreadCount(0)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${API_BASE_URL}/mark-notification-read`, {
        notificationId,
        username,
      })

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification,
        ),
      )

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Error marking notification as read", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/mark-all-notifications-read`, {
        username,
      })

      // Update local state
      setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Error marking all notifications as read", err)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!selectedGroup || !newMessage.trim()) {
      return
    }

    try {
      await axios.post(`${API_BASE_URL}/create-notification`, {
        message: newMessage,
        type: "info",
        sender: username,
        senderRole: "mentor",
        isGlobal: false,
        recipients: selectedGroup.members,
      })

      setNewMessage("")
      alert("Message sent successfully!")
    } catch (err) {
      console.error("Error sending message", err)
      alert("Failed to send message. Please try again.")
    }
  }

  const handleCreateNotification = async (e) => {
    e.preventDefault()

    if (!notification.message.trim() || notification.recipients.length === 0) {
      alert("Please enter a message and select at least one group")
      return
    }

    try {
      // Flatten all members from selected groups
      const allRecipients = notification.recipients.flatMap((groupId) => {
        const group = allGroups.find((g) => g._id === groupId)
        return group ? group.members : []
      })

      await axios.post(`${API_BASE_URL}/create-notification`, {
        message: notification.message,
        type: notification.type,
        sender: username,
        senderRole: "mentor",
        isGlobal: false,
        recipients: allRecipients,
      })

      setNotificationSuccess("Notification sent successfully!")
      setNotification({ message: "", type: "info", recipients: [] })

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

  // Filter groups based on search term
  const filteredGroups = allGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.members.some((member) => member.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Check if a group is assigned to the current mentor
  const isGroupAssigned = (groupId) => {
    return assignedGroups.some((group) => group._id === groupId)
  }

  const menuItems = [
    { id: "hackathons", label: "Hackathons", icon: <FaLaptopCode /> },
    { id: "assigned-groups", label: "My Groups", icon: <FaUserFriends /> },
    { id: "all-groups", label: "All Groups", icon: <FaUsers /> },
    { id: "messages", label: "Messages", icon: <FaComments /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "code-sandbox", label: "Code Sandbox", icon: <FaCode /> },
  ]

  return (
    <div className="mentor-dashboard-wrapper">
      <div className="mentor-dashboard-navbar">
        <div className="mentor-dashboard-navbar-left">
          <button className="mentor-dashboard-menu-toggle" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <h2 className="mentor-dashboard-greeting">Hi, {username}</h2>
        </div>

        <div className="mentor-dashboard-navbar-right">
          <div className="mentor-dashboard-notification-container">
            <button
              className="mentor-dashboard-notification-button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell />
              {unreadCount > 0 && <span className="mentor-dashboard-notification-badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="mentor-dashboard-notification-dropdown">
                <div className="mentor-dashboard-notification-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button className="mentor-dashboard-notification-mark-all" onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="mentor-dashboard-notification-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`mentor-dashboard-notification-item ${!notification.isRead ? "unread" : ""}`}
                        onClick={() => markAsRead(notification._id)}
                      >
                        <div className="mentor-dashboard-notification-icon">
                          {notification.type === "info" && <FaInfoCircle className="notification-icon-info" />}
                          {notification.type === "warning" && (
                            <FaExclamationTriangle className="notification-icon-warning" />
                          )}
                          {notification.type === "announcement" && (
                            <FaBell className="notification-icon-announcement" />
                          )}
                          {notification.type === "success" && <FaCheckCircle className="notification-icon-success" />}
                        </div>
                        <div className="mentor-dashboard-notification-content">
                          <p className="mentor-dashboard-notification-message">{notification.message}</p>
                          <div className="mentor-dashboard-notification-meta">
                            <span className="mentor-dashboard-notification-sender">
                              {notification.sender} ({notification.senderRole})
                            </span>
                            <span className="mentor-dashboard-notification-time">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {!notification.isRead && <div className="mentor-dashboard-notification-unread-indicator"></div>}
                      </div>
                    ))
                  ) : (
                    <p className="mentor-dashboard-notification-empty">No notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mentor-dashboard-profile-container" ref={dropdownRef}>
            <div className="mentor-dashboard-profile-icon" onClick={toggleProfileDropdown}>
              {username ? username.charAt(0).toUpperCase() : "M"}
            </div>

            {showProfileDropdown && (
              <div className="mentor-dashboard-profile-dropdown">
                <div className="mentor-dashboard-dropdown-header">{username}</div>
                <ul className="mentor-dashboard-dropdown-menu">
                  <li onClick={() => navigate("/edit-profile")}>
                    <FaUserEdit className="mentor-dashboard-dropdown-icon" />
                    Edit Profile
                  </li>
                  <li onClick={() => navigate("/settings")}>
                    <FaCog className="mentor-dashboard-dropdown-icon" />
                    Settings
                  </li>
                  <li onClick={handleLogout} style={{ color: "red" }}>
                    <FaSignOutAlt style={{ color: "red" }} className="mentor-dashboard-dropdown-icon" />
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mentor-dashboard-main">
        <div className={`mentor-dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`} ref={sidebarRef}>
          <button className="mentor-dashboard-sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>

          <ul className="mentor-dashboard-sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)}>
                <span className="mentor-dashboard-menu-icon">{item.icon}</span>
                <span className="mentor-dashboard-menu-text">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mentor-dashboard-content">
          {activeTab === "hackathons" && (
            <div className="mentor-dashboard-section">
              <div className="mentor-dashboard-section-header">
                <h2>Available Hackathons</h2>
              </div>
              <div className="mentor-dashboard-section-body">
                {loading ? (
                  <p className="mentor-dashboard-loading">Loading hackathons...</p>
                ) : error ? (
                  <p className="mentor-dashboard-error">{error}</p>
                ) : hackathons.length > 0 ? (
                  <div className="mentor-dashboard-hackathons-grid">
                    {hackathons.map((hackathon) => (
                      <div key={hackathon._id} className="mentor-dashboard-hackathon-card">
                        <div className="mentor-dashboard-hackathon-header">
                          <h3>{hackathon.title}</h3>
                          <span className={`mentor-dashboard-hackathon-status ${hackathon.status}`}>
                            {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                          </span>
                        </div>
                        <div className="mentor-dashboard-hackathon-body">
                          <p>{hackathon.description}</p>
                          <div className="mentor-dashboard-hackathon-dates">
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
                        <div className="mentor-dashboard-hackathon-footer">
                          <button className="mentor-dashboard-button" onClick={() => setActiveTab("assigned-groups")}>
                            View Assigned Groups
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mentor-dashboard-empty-state">No hackathons are currently available.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "assigned-groups" && (
            <div className="mentor-dashboard-section">
              <div className="mentor-dashboard-section-header">
                <h2>My Assigned Groups</h2>
              </div>
              <div className="mentor-dashboard-section-body">
                {loading ? (
                  <p className="mentor-dashboard-loading">Loading assigned groups...</p>
                ) : assignedGroups.length > 0 ? (
                  <div className="mentor-dashboard-groups-grid">
                    {assignedGroups.map((group) => (
                      <div key={group._id} className="mentor-dashboard-group-card">
                        <div className="mentor-dashboard-group-card-header">
                          <h3>{group.name}</h3>
                        </div>
                        <div className="mentor-dashboard-group-card-body">
                          <p className="mentor-dashboard-group-description">{group.description}</p>
                          <div className="mentor-dashboard-group-members">
                            <h4>
                              <FaUserFriends /> Members ({group.members.length})
                            </h4>
                            <ul className="mentor-dashboard-members-list">
                              {group.members.map((member, index) => (
                                <li key={index} className="mentor-dashboard-member-item">
                                  <div className="mentor-dashboard-member-avatar">{member.charAt(0).toUpperCase()}</div>
                                  <span>{member}</span>
                                  {member === group.createdBy && (
                                    <span className="mentor-dashboard-member-badge">Creator</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mentor-dashboard-group-submissions">
                            <h4>Submissions</h4>
                            {group.submissions && group.submissions.length > 0 ? (
                              <ul className="mentor-dashboard-submissions-list">
                                {group.submissions.map((submission) => (
                                  <li key={submission._id} className="mentor-dashboard-submission-item">
                                    <span>{submission.filename}</span>
                                    <span>{new Date(submission.date).toLocaleDateString()}</span>
                                    <a
                                      href={`${API_BASE_URL}/download/${submission.filename}`}
                                      className="mentor-dashboard-download-button"
                                    >
                                      Download
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No submissions yet</p>
                            )}
                          </div>
                        </div>
                        <div className="mentor-dashboard-group-card-footer">
                          <button
                            className="mentor-dashboard-button"
                            onClick={() => {
                              setSelectedGroup(group)
                              setActiveTab("messages")
                            }}
                          >
                            <FaComments /> Message Group
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mentor-dashboard-empty-state">You don't have any assigned groups yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "all-groups" && (
            <div className="mentor-dashboard-section">
              <div className="mentor-dashboard-section-header">
                <h2>All Groups</h2>
                <div className="mentor-dashboard-search">
                  <FaSearch className="mentor-dashboard-search-icon" />
                  <input
                    type="text"
                    placeholder="Search groups or members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="mentor-dashboard-section-body">
                {loading ? (
                  <p className="mentor-dashboard-loading">Loading groups...</p>
                ) : filteredGroups.length > 0 ? (
                  <div className="mentor-dashboard-groups-grid">
                    {filteredGroups.map((group) => (
                      <div key={group._id} className="mentor-dashboard-group-card">
                        <div className="mentor-dashboard-group-card-header">
                          <h3>{group.name}</h3>
                          {isGroupAssigned(group._id) && (
                            <span className="mentor-dashboard-assigned-badge">Assigned to you</span>
                          )}
                        </div>
                        <div className="mentor-dashboard-group-card-body">
                          <p className="mentor-dashboard-group-description">{group.description}</p>
                          <div className="mentor-dashboard-group-members">
                            <h4>
                              <FaUserFriends /> Members ({group.members.length})
                            </h4>
                            <ul className="mentor-dashboard-members-list">
                              {group.members.map((member, index) => (
                                <li key={index} className="mentor-dashboard-member-item">
                                  <div className="mentor-dashboard-member-avatar">{member.charAt(0).toUpperCase()}</div>
                                  <span>{member}</span>
                                  {member === group.createdBy && (
                                    <span className="mentor-dashboard-member-badge">Creator</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mentor-dashboard-empty-state">
                    {searchTerm ? "No groups match your search." : "No groups have been created yet."}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="mentor-dashboard-section">
              <div className="mentor-dashboard-section-header">
                <h2>Messages</h2>
                <button
                  className="mentor-dashboard-button"
                  onClick={() => setShowNotificationForm(!showNotificationForm)}
                >
                  <FaPlus /> Create Group Notification
                </button>
              </div>
              <div className="mentor-dashboard-section-body">
                {notificationSuccess && <div className="mentor-dashboard-success-message">{notificationSuccess}</div>}

                {showNotificationForm && (
                  <form onSubmit={handleCreateNotification} className="mentor-dashboard-form">
                    <div className="mentor-dashboard-form-group">
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
                    <div className="mentor-dashboard-form-group">
                      <label>Select Groups:</label>
                      <div className="mentor-dashboard-checkbox-group">
                        {assignedGroups.map((group) => (
                          <div key={group._id} className="mentor-dashboard-checkbox-item">
                            <input
                              type="checkbox"
                              id={`group-${group._id}`}
                              checked={notification.recipients.includes(group._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNotification({
                                    ...notification,
                                    recipients: [...notification.recipients, group._id],
                                  })
                                } else {
                                  setNotification({
                                    ...notification,
                                    recipients: notification.recipients.filter((id) => id !== group._id),
                                  })
                                }
                              }}
                            />
                            <label htmlFor={`group-${group._id}`}>{group.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mentor-dashboard-form-group">
                      <label>Message:</label>
                      <textarea
                        value={notification.message}
                        onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                        placeholder="Enter your notification message here..."
                        rows={4}
                        required
                      />
                    </div>
                    <button type="submit" className="mentor-dashboard-button">
                      Send Notification
                    </button>
                  </form>
                )}

                <div className="mentor-dashboard-messaging-container">
                  <div className="mentor-dashboard-groups-sidebar">
                    <h3>Your Groups</h3>
                    <ul className="mentor-dashboard-groups-list">
                      {assignedGroups.map((group) => (
                        <li
                          key={group._id}
                          className={`mentor-dashboard-group-item ${selectedGroup && selectedGroup._id === group._id ? "active" : ""}`}
                          onClick={() => setSelectedGroup(group)}
                        >
                          <div className="mentor-dashboard-group-avatar">{group.name.charAt(0).toUpperCase()}</div>
                          <div className="mentor-dashboard-group-info">
                            <span className="mentor-dashboard-group-name">{group.name}</span>
                            <span className="mentor-dashboard-group-members-count">{group.members.length} members</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mentor-dashboard-messaging-main">
                    {selectedGroup ? (
                      <>
                        <div className="mentor-dashboard-messaging-header">
                          <h3>{selectedGroup.name}</h3>
                          <p>{selectedGroup.members.join(", ")}</p>
                        </div>
                        <div className="mentor-dashboard-messaging-body">
                          <p className="mentor-dashboard-messaging-info">
                            Messages sent here will be delivered as notifications to all members of {selectedGroup.name}
                            .
                          </p>
                        </div>
                        <form className="mentor-dashboard-messaging-form" onSubmit={handleSendMessage}>
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Send a message to ${selectedGroup.name}...`}
                            required
                          />
                          <button type="submit" className="mentor-dashboard-send-button">
                            <FaPaperPlane /> Send
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="mentor-dashboard-messaging-empty">
                        <FaComments className="mentor-dashboard-messaging-empty-icon" />
                        <p>Select a group to start messaging</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="mentor-dashboard-section">
              <div className="mentor-dashboard-section-header">
                <h2>Notifications</h2>
              </div>
              <div className="mentor-dashboard-section-body">
                <div className="mentor-dashboard-notifications-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`mentor-dashboard-notification-card ${!notification.isRead ? "unread" : ""}`}
                        onClick={() => markAsRead(notification._id)}
                      >
                        <div className="mentor-dashboard-notification-icon">
                          {notification.type === "info" && <FaInfoCircle className="notification-icon-info" />}
                          {notification.type === "warning" && (
                            <FaExclamationTriangle className="notification-icon-warning" />
                          )}
                          {notification.type === "announcement" && (
                            <FaBell className="notification-icon-announcement" />
                          )}
                          {notification.type === "success" && <FaCheckCircle className="notification-icon-success" />}
                        </div>
                        <div className="mentor-dashboard-notification-content">
                          <p className="mentor-dashboard-notification-message">{notification.message}</p>
                          <div className="mentor-dashboard-notification-meta">
                            <span className="mentor-dashboard-notification-sender">
                              {notification.sender} ({notification.senderRole})
                            </span>
                            <span className="mentor-dashboard-notification-time">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {!notification.isRead && <div className="mentor-dashboard-notification-unread-indicator"></div>}
                      </div>
                    ))
                  ) : (
                    <p className="mentor-dashboard-empty-state">You have no notifications.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "code-sandbox" && (
            <div className="mentor-dashboard-section">
              <div className="mentor-dashboard-section-header">
                <h2>Code Sandbox</h2>
              </div>
              <div className="mentor-dashboard-section-body">
                <p className="mentor-dashboard-empty-state">
                  The code sandbox feature will be available soon. This will allow you to review and provide feedback on
                  code submissions from your assigned groups.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MentorDashboard

