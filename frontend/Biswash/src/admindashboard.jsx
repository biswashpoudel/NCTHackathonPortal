import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [pendingParticipations, setPendingParticipations] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchPendingParticipations();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const fetchPendingParticipations = async () => {
    try {
      const res = await axios.get("https://ncthackathonportal.onrender.com/participants?isApproved=null");
      setPendingParticipations(res.data);
    } catch (err) {
      console.error("Error fetching pending participation requests:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      await axios.post("https://ncthackathonportal.onrender.com/register", formData);
      alert("User  registered successfully!");
      fetchUsers();
      setFormData({ username: "", email: "", password: "", role: "user" });
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to register user");
    }
  };

  // Approve participation request
  const approveParticipation = async (username) => {
    try {
      await axios.post("https://ncthackathonportal.onrender.com/approve-participation", { username });
      alert(`Participation request for ${username} approved.`);
      fetchPendingParticipations();  // Re-fetch the list of pending participations to update the UI
      fetchUsers(); // Update user list to reflect changes
    } catch (err) {
      console.error('Error approving participation', err);
      alert('Error approving participation');
    }
  };

  // Reject participation request
  const rejectParticipation = async (username) => {
    try {
      await axios.post("https://ncthackathonportal.onrender.com/approve-participation", { username, isApproved: false });
      alert(`Participation request for ${username} rejected.`);
      fetchPendingParticipations();  // Re-fetch the list of pending participations to update the UI
    } catch (err) {
      console.error('Error rejecting participation', err);
      alert('Error rejecting participation');
    }
  };

  // Approve group creation request
  const approveGroup = async (groupId) => {
    try {
      await axios.post("https://ncthackathonportal.onrender.com/approve-group", { groupId });
      alert(`Group creation request approved.`);
      fetchGroups(); // Refresh groups list
    } catch (err) {
      console.error('Error approving group creation', err);
    }
  };

  // Reject group creation request
  const rejectGroup = async (groupId) => {
    try {
      await axios.post("https://ncthackathonportal.onrender.com/approve-group", { groupId, pendingApproval: null });
      alert(`Group creation request rejected.`);
      fetchGroups(); // Refresh groups list
    } catch (err) {
      console.error('Error rejecting group creation', err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* User Registration Form */}
      <form onSubmit={handleSubmit} className="admin-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User </option>
          <option value="judge">Judge</option>
          <option value="mentor">Mentor</option>
          <option value="admin">Admin</option>
        </select>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit">Register User</button>
      </form>

      {/* Registered Users */}
      <h3>Registered Users</h3>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pending Participation Requests */}
      <h3>Pending Participation Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingParticipations.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>
                <button onClick={() => approveParticipation(user.username)}>Approve</button>
                <button onClick={() => rejectParticipation(user.username)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pending Group Creation Requests */}
      <h3>Pending Group Creation Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {groups.filter(group => group.pendingApproval === true).map((group) => (
            <tr key={group._id}>
              <td>{group.name}</td>
              <td>
                <button onClick={() => approveGroup(group._id)}>Approve</button>
                <button onClick={() => rejectGroup(group._id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;