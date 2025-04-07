const mongoose = require("mongoose")

// Notification Schema
const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "warning", "announcement", "success"], default: "info" },
  sender: { type: String, required: true },
  senderRole: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isGlobal: { type: Boolean, default: true },
  recipients: [{ type: String }], // Array of usernames if not global
  readBy: [{ type: String }], // Array of usernames who have read the notification
})

module.exports = mongoose.model("Notification", notificationSchema)

