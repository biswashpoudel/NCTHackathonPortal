import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Table, TableHead, TableRow, TableCell, TableBody } from "./components/ui/table";
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "judge",
  });
  const [hackathons, setHackathons] = useState([
    { id: 1, name: "Hackathon 1", participants: 150, teams: 30 },
    { id: 2, name: "Hackathon 2", participants: 200, teams: 40 },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/register", formData);
      alert(res.data.message);
      fetchUsers();
      setFormData({ username: "", email: "", password: "", role: "judge" });
    } catch (err) {
      console.error("Error registering user", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setUsers([]);
    navigate("/", { replace: true });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <Button className="mb-4" onClick={handleLogout}>Logout</Button>
      
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Register a New User</h2>
          <form onSubmit={handleSubmit} className="space-y-2">
            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="user">User</option>
              <option value="judge">Judge</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
            <Button type="submit">Register</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Registered Users</h2>
          <ul>
            {users.map((user) => (
              <li key={user.id}>{user.username} - {user.role}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">Hackathons</h2>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Participants</TableCell>
                <TableCell>Teams</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hackathons.map((hackathon) => (
                <TableRow key={hackathon.id}>
                  <TableCell>{hackathon.id}</TableCell>
                  <TableCell>{hackathon.name}</TableCell>
                  <TableCell>{hackathon.participants}</TableCell>
                  <TableCell>{hackathon.teams}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;