const mongoose = require("mongoose")

// Submission Schema
const submissionSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  groupName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  feedback: { type: String, default: "" },
  grade: { type: Number, default: null },
})

module.exports = mongoose.model("Submission", submissionSchema)

