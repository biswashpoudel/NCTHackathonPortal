import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./judgedashboard.css";

const JudgeDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");
  const navigate = useNavigate(); 
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username");

  useEffect(() => {
    axios.get("http://localhost:5000/submissions")
      .then((res) => {
        setSubmissions(res.data);
      })
      .catch((err) => console.error("Error fetching submissions", err));
  }, []);

  const handleLogout = () => {
    navigate("/"); 
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleGradeChange = (e) => {
    setGrade(e.target.value);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSubmission || grade === "") {
      alert("Please select a submission and provide a grade.");
      return;
    }

    const payload = {
      submissionId: selectedSubmission._id,
      feedback,
      grade: parseInt(grade),
    };

    try {
      await axios.post("http://localhost:5000/submit-feedback", payload);
      alert("Feedback and grade submitted successfully!");

      const updatedSubmissions = await axios.get("http://localhost:5000/submissions");
      setSubmissions(updatedSubmissions.data);
      setSelectedSubmission(null);
      setFeedback("");
      setGrade("");
    } catch (error) {
      alert("Failed to submit feedback and grade");
    }
  };

  return (
    <div className="judge-dashboard">
      <h1> Welcome, {username}
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
      </h1>
     

      <h2>Submissions</h2>
      <ul>
        {submissions.length > 0 ? (
          submissions.map((submission) => (
            <li key={submission._id}>
              <p>
                <strong>{submission.filename}</strong> uploaded by {submission.uploadedBy}
              </p>
              <a href={`http://localhost:5000/download/${submission.filename}`} download>
                <button>Download</button>
              </a>
              <button onClick={() => setSelectedSubmission(submission)}>Provide Feedback</button>
            </li>
          ))
        ) : (
          <p>No submissions yet</p>
        )}
      </ul>

      {selectedSubmission && (
        <div className="feedback-form">
          <h3>Provide Feedback for {selectedSubmission.filename}</h3>
          <textarea
            value={feedback}
            onChange={handleFeedbackChange}
            placeholder="Enter feedback here..."
          />
          <br />
          <input
            type="number"
            value={grade}
            onChange={handleGradeChange}
            placeholder="Enter grade (out of 100)"
            max="100"
            min="0"
          />
          <br />
          <button onClick={handleSubmitFeedback}>Submit Feedback and Grade</button>
        </div>
      )}
    </div>
  );
};

export default JudgeDashboard;
