import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./landingpage";
import AuthPage from "./AuthPage";
import AdminDashboard from "./admindashboard";
import JudgeDashboard from "./judgedashboard";
import MentorDashboard from "./mentordashboard";
import ParticipantDashboard from "./dashboard";
import ParticipateHackathon from "./ParticipateHackathon"; 
import TeamFormation from "./teamformation";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/judge-dashboard" element={<JudgeDashboard />} />
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        <Route path="/participant-dashboard" element={<ParticipantDashboard />} />
        <Route path="/participate-hackathons" element={<ParticipateHackathon />} /> 
        <Route path="/team-formation" element={<TeamFormation/>}/>
      </Routes>
    </Router>
  );
}

export default App;
