import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./judgedashboard.css";

const JudgeDashboard = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [grade, setGrade] = useState(0);
    const [username, setUsername] = useState(localStorage.getItem("username"));

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await axios.get('https://ncthackathonportal.onrender.com/api/submissions');
                setSubmissions(response.data);
            } catch (error) {
                console.error('Error fetching submissions:', error);
            }
        };
        fetchSubmissions();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("username");
        navigate("/");
    };

    const selectSubmission = (submission) => {
        setSelectedSubmission(submission);
        setFeedback(submission.feedback || '');
        setGrade(submission.grade || 0);
    };

    const handleGradeChange = (e) => {
        const value = Math.max(0, Math.min(100, Number(e.target.value)));
        setGrade(value);
    };

    const handleSubmitFeedback = async () => {
        if (!selectedSubmission) return alert("No submission selected");
        if (grade < 0 || grade > 100) return alert("Grade must be between 0 and 100");

        try {
            const response = await axios.put("https://ncthackathonportal.onrender.com/api/submit-feedback", {
                submissionId: selectedSubmission._id,
                feedback,
                grade,
                judgeUsername: username
            });
            alert(response.data.message);
            setSubmissions(prevSubmissions => prevSubmissions.map(sub => sub._id === selectedSubmission._id ? response.data.submission : sub));
            setSelectedSubmission(null);
            setFeedback('');
            setGrade(0);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Failed to submit feedback");
        }
    };

    return (
        <div className="judge-dashboard">
            <div className="dashboard-header">
                <h1>Welcome, {username}</h1>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
            
            <h2>Submissions</h2>
            <ul className="submission-list">
                {submissions.map((submission) => (
                    <li key={submission._id} onClick={() => selectSubmission(submission)}>
                        {submission.projectTitle} - {submission.teamName}
                    </li>
                ))}
            </ul>
            
            {selectedSubmission && (
                <div className="feedback-section">
                    <h3>Grading: {selectedSubmission.projectTitle} - {selectedSubmission.teamName}</h3>
                    <p><strong>Previous Feedback:</strong> {selectedSubmission.feedback || "None"}</p>
                    <p><strong>Grade Given:</strong> {selectedSubmission.grade !== null ? selectedSubmission.grade : "Not graded yet"}</p>
                    <textarea 
                        value={feedback} 
                        onChange={(e) => setFeedback(e.target.value)} 
                        placeholder="Enter feedback"
                    />
                    <input 
                        type="number" 
                        value={grade} 
                        onChange={handleGradeChange} 
                        min="0" 
                        max="100"
                    />
                    <button onClick={handleSubmitFeedback}>Submit Feedback</button>
                </div>
            )}
        </div>
    );
};

export default JudgeDashboard;
