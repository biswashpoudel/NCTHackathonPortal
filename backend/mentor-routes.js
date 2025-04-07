const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const User = require("../models/User")
const Group = require("../models/Group")
const Notification = require("../models/Notification")
const Submission = require("../models/Submission")

// Get groups assigned to a mentor
router.get("/mentor-assigned-groups", async (req, res) => {
  const { username } = req.query

  if (!username) {
    return res.status(400).json({ message: "Username is required" })
  }

  try {
    // Find the mentor user
    const mentor = await User.findOne({ username, role: "mentor" })

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" })
    }

    // Find groups assigned to this mentor
    // Assuming there's a mentorAssignments collection or a field in the Group model
    const assignedGroups = await Group.find({ assignedMentor: username })

    // Get submissions for each group
    const groupsWithSubmissions = await Promise.all(
      assignedGroups.map(async (group) => {
        const submissions = await Submission.find({ groupName: group.name })
        return {
          ...group.toObject(),
          submissions,
        }
      }),
    )

    res.status(200).json(groupsWithSubmissions)
  } catch (err) {
    console.error("Error fetching mentor assigned groups:", err)
    res.status(500).json({ message: "Error fetching assigned groups", error: err.message })
  }
})

// Assign mentor to group
router.post("/assign-mentor", async (req, res) => {
  const { groupId, mentorUsername } = req.body

  if (!groupId || !mentorUsername) {
    return res.status(400).json({ message: "Group ID and mentor username are required" })
  }

  try {
    // Check if mentor exists
    const mentor = await User.findOne({ username: mentorUsername, role: "mentor" })

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" })
    }

    // Update group with assigned mentor
    const updatedGroup = await Group.findByIdAndUpdate(groupId, { assignedMentor: mentorUsername }, { new: true })

    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Create notification for the group members
    const notification = new Notification({
      message: `${mentorUsername} has been assigned as your mentor`,
      type: "info",
      sender: "admin",
      senderRole: "admin",
      isGlobal: false,
      recipients: updatedGroup.members,
      readBy: [],
    })

    await notification.save()

    // Create notification for the mentor
    const mentorNotification = new Notification({
      message: `You have been assigned as a mentor to the group "${updatedGroup.name}"`,
      type: "info",
      sender: "admin",
      senderRole: "admin",
      isGlobal: false,
      recipients: [mentorUsername],
      readBy: [],
    })

    await mentorNotification.save()

    res.status(200).json({
      message: "Mentor assigned successfully",
      group: updatedGroup,
    })
  } catch (err) {
    console.error("Error assigning mentor:", err)
    res.status(500).json({ message: "Error assigning mentor", error: err.message })
  }
})

// Send message to group
router.post("/mentor-message", async (req, res) => {
  const { mentorUsername, groupId, message } = req.body

  if (!mentorUsername || !groupId || !message) {
    return res.status(400).json({ message: "Mentor username, group ID, and message are required" })
  }

  try {
    // Check if mentor exists
    const mentor = await User.findOne({ username: mentorUsername, role: "mentor" })

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" })
    }

    // Get the group
    const group = await Group.findById(groupId)

    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Check if mentor is assigned to this group
    if (group.assignedMentor !== mentorUsername) {
      return res.status(403).json({ message: "You are not assigned to this group" })
    }

    // Create notification for group members
    const notification = new Notification({
      message,
      type: "info",
      sender: mentorUsername,
      senderRole: "mentor",
      isGlobal: false,
      recipients: group.members,
      readBy: [],
    })

    await notification.save()

    res.status(201).json({
      message: "Message sent successfully",
      notification,
    })
  } catch (err) {
    console.error("Error sending mentor message:", err)
    res.status(500).json({ message: "Error sending message", error: err.message })
  }
})

module.exports = router

