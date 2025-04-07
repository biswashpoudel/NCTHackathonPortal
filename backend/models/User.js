const mongoose = require("mongoose")

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["user", "judge", "mentor", "admin"], default: "user" },
  isParticipating: { type: String, default: "false" }, // can be 'false', 'pending', or 'true'
  isApproved: { type: Boolean, default: false }, // User approval status
})

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

