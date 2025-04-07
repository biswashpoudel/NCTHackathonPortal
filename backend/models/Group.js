const mongoose = require("mongoose")

// Group Schema
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  members: [{ type: String }], // Array of usernames
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  pendingApproval: { type: Boolean, default: true }, // Field to track if group is awaiting admin approval
  assignedMentor: { type: String, default: null },
})

module.exports = mongoose.model("Group", groupSchema)

