import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TeamFormation = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [teamData, setTeamData] = useState({
    teamName: "",
    logo: "",
    description: "",
    members: [],
  });

  useEffect(() => {
    fetchTeams();
    fetchRegisteredUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await axios.get("http://localhost:5000/teams");
      setTeams(res.data);
    } catch (err) {
      console.error("Error fetching teams", err);
    }
  };

  const fetchRegisteredUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/hackathon-participants");
      setRegisteredUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleChange = (e) => {
    setTeamData({ ...teamData, [e.target.name]: e.target.value });
  };

  const handleMemberSelect = (e) => {
    const selectedMembers = Array.from(e.target.selectedOptions, (option) => option.value);
    if (selectedMembers.length <= 5) {
      setTeamData({ ...teamData, members: selectedMembers });
    } else {
      alert("A team can have a maximum of 5 members.");
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/team-formation", teamData);
      alert("Team created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating team", err);
      alert("Failed to create team. Try again.");
    }
  };

  return (
    <div className="team-formation-container">
      <h2>Team Formation</h2>
      <form onSubmit={handleCreateTeam}>
        <input type="text" name="teamName" placeholder="Team Name" onChange={handleChange} required />
        <input type="text" name="logo" placeholder="Logo URL" onChange={handleChange} required />
        <textarea name="description" placeholder="Short Bio/Description" onChange={handleChange} required />
        <select multiple onChange={handleMemberSelect}>
          {registeredUsers.map((user) => (
            <option key={user.studentId} value={user.studentId}>
              {user.firstName} {user.lastName} ({user.email})
            </option>
          ))}
        </select>
        <button type="submit">Create Team</button>
      </form>

      <h2>Join an Existing Team</h2>
      <ul>
        {teams.map((team) => (
          <li key={team._id}>
            {team.teamName} - {team.description}
            <button>Join Team</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamFormation;
