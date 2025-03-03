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
  isParticipating: { type: Boolean, default: false },
});
const User = mongoose.model("User", userSchema);

// Group Schema
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  members: [{ type: String }], // Array of usernames
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Group = mongoose.model("Group", groupSchema);

// Submission Schema
const submissionSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  groupName: { type: String, required: true },
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

// Participation Route
app.post("/participate", async (req, res) => {
  const { username } = req.body;
  
  try {
    const user = await User.findOneAndUpdate(
      { username },
      { isParticipating: true },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.status(200).json({ message: "Successfully registered for hackathon", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating participation status", error });
  }
});

// Get All Participating Users
app.get("/participants", async (req, res) => {
  try {
    const participants = await User.find({ isParticipating: true }, { username: 1, email: 1, _id: 0 });
    res.status(200).json(participants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching participants", error });
  }
});

// Create Group
app.post("/groups", async (req, res) => {
  const { name, description, members, createdBy } = req.body;
  
  try {
    // Check if group name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) return res.status(400).json({ message: "Group name already taken" });
    
    // Validate group size
    if (members.length > 5) return res.status(400).json({ message: "Maximum 5 members allowed per group" });
    
    const newGroup = new Group({ name, description, members, createdBy });
    await newGroup.save();
    
    res.status(201).json({ message: "Group created successfully", group: newGroup });
  } catch (error) {
    res.status(500).json({ message: "Error creating group", error });
  }
});

// Get All Groups
app.get("/groups", async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching groups", error });
  }
});

// Get Groups for a specific user
app.get("/user-groups", async (req, res) => {
  const { username } = req.query;
  
  try {
    const groups = await Group.find({ members: username });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user groups", error });
  }
});

// Upload Route
app.post("/upload", upload.single("file"), async (req, res) => {
  const { uploadedBy, groupName } = req.body;
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const submission = new Submission({ 
      filename: req.file.filename, 
      uploadedBy,
      groupName: groupName || "N/A" 
    });
    await submission.save();
    res.status(200).json({ message: "File uploaded successfully", filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: "Error saving file metadata", error });
  }
});

// Get All Submissions 
app.get("/api/submissions", async (req, res) => {
  try {
    const submissions = await Submission.find();
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions", error });
  }
});

// Get User-Specific Submissions
app.get("/submissions", async (req, res) => {
  const { username } = req.query;
  
  try {
    let query = {};
    if (username) {
      query = { uploadedBy: username };
    }
    
    const submissions = await Submission.find(query);
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions", error });
  }
});

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