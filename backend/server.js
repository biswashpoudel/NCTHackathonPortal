const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Serve static files from uploads folder

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error("Error connecting to MongoDB:", err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["user", "judge", "mentor", "admin"], default: "user" },
});
const User = mongoose.model("User", userSchema);

const participantSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  college: { type: String, required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
});

const Participant = mongoose.model("Participant", participantSchema);

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logo: { type: String },
  description: { type: String },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: "Participant", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Participant" }],
});

const Team = mongoose.model("Team", teamSchema);



// Submission Schema
const submissionSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  date: { type: Date, default: Date.now },
  feedback: { type: String, default: "" },
  grade: { type: Number, default: null },
});
const Submission = mongoose.model("Submission", submissionSchema);

// Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Registration Route
app.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role: role || "user" });

    await newUser.save();
    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Upload Route
app.post("/upload", upload.single("file"), async (req, res) => {
  const { uploadedBy } = req.body;
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const submission = new Submission({ filename: req.file.filename, uploadedBy });
    await submission.save();
    res.status(200).json({ message: "File uploaded successfully", filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: "Error saving file metadata", error });
  }
});
app.post("/hackathon-participants", async (req, res) => {
  const { studentId, firstName, lastName, email, college } = req.body;

  try {
    const existingParticipant = await Participant.findOne({ email });
    if (existingParticipant) return res.status(400).json({ message: "You are already registered!" });

    const newParticipant = new Participant({ studentId, firstName, lastName, email, college });
    await newParticipant.save();

    res.status(201).json({ message: "Successfully registered for the hackathon!", participant: newParticipant });
  } catch (error) {
    res.status(500).json({ message: "Error registering for hackathon", error });
  }
});

app.post("/team-formation", async (req, res) => {
  const { name, logo, description, leaderId } = req.body;

  try {
    const leader = await Participant.findById(leaderId);
    if (!leader) return res.status(404).json({ message: "Leader not found" });

    const team = new Team({ name, logo, description, leader: leaderId, members: [leaderId] });
    await team.save();

    leader.teamId = team._id;
    await leader.save();

    res.status(201).json({ message: "Team created successfully!", team });
  } catch (error) {
    res.status(500).json({ message: "Error creating team", error });
  }
});
app.post("/join-team", async (req, res) => {
  const { teamId, participantId } = req.body;

  try {
    const team = await Team.findById(teamId).populate("members");
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.members.length >= 5) return res.status(400).json({ message: "Team is already full" });

    const participant = await Participant.findById(participantId);
    if (!participant) return res.status(404).json({ message: "Participant not found" });

    team.members.push(participantId);
    participant.teamId = teamId;

    await team.save();
    await participant.save();

    res.status(200).json({ message: "Joined team successfully!", team });
  } catch (error) {
    res.status(500).json({ message: "Error joining team", error });
  }
});
app.get("/teams", async (req, res) => {
  try {
    const teams = await Team.find().populate("members", "firstName lastName email");
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams", error });
  }
});

// Get All Submissions
const getSubmissions = async () => {
  try {
    const response = await axios.get('https://ncthackathonportal.onrender.com/api/submissions');
    console.log(response.data); // Check the response
    setSubmissions(response.data); // Use the data in your state
  } catch (error) {
    console.error('Error fetching submissions:', error);
  }
};

// Submit Feedback & Grade (Judge)
app.post("/submit-feedback", async (req, res) => {
  const { submissionId, feedback, grade } = req.body;
  if (!submissionId || grade === undefined || feedback === undefined) {
    return res.status(400).json({ message: "Submission ID, grade, and feedback are required" });
  }

  try {
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { feedback, grade },
      { new: true }
    );

    if (!updatedSubmission) return res.status(404).json({ message: "Submission not found" });

    res.status(200).json({ message: "Feedback submitted successfully!", submission: updatedSubmission });
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error });
  }
});

// Get Graded Submissions for Users
app.get("/results", async (req, res) => {
  try {
    const results = await Submission.find({ grade: { $ne: null } });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Error fetching results", error });
  }
});

// File Download Route
app.get("/download/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "uploads", filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
