const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const User = require("./models/User")
const Group = require("./models/Group")
const Notification = require("./models/Notification")
const Submission = require("./models/Submission")

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
  const { mentorId, groupIds, mentorUsername, groupId } = req.body

  // Support both formats: either mentorId+groupIds or mentorUsername+groupId
  if ((!mentorId && !mentorUsername) || (!groupIds && !groupId)) {
    return res.status(400).json({ message: "Mentor information and group information are required" })
  }

  try {
    // Find the mentor - support both ID and username methods
    let mentor
    if (mentorId) {
      mentor = await User.findById(mentorId)
    } else if (mentorUsername) {
      mentor = await User.findOne({ username: mentorUsername, role: "mentor" })
    }

    if (!mentor || mentor.role !== "mentor") {
      return res.status(404).json({ message: "Mentor not found" })
    }

    // Handle both single group ID and array of group IDs
    const groupIdsToUpdate = groupIds || [groupId]

    // Update each group with the assigned mentor
    for (const gId of groupIdsToUpdate) {
      await Group.findByIdAndUpdate(gId, { assignedMentor: mentor.username })
    }

    // Get the updated groups
    const groups = await Group.find({ _id: { $in: groupIdsToUpdate } })

    // Create notifications for the mentor and group members
    for (const group of groups) {
      // Notification for mentor
      const notification = new Notification({
        message: `You have been assigned as a mentor to the group "${group.name}"`,
        type: "info",
        sender: "admin",
        senderRole: "admin",
        isGlobal: false,
        recipients: [mentor.username],
        readBy: [],
      })
      await notification.save()

      // Notification for group members
      const memberNotification = new Notification({
        message: `${mentor.username} has been assigned as your mentor`,
        type: "info",
        sender: "admin",
        senderRole: "admin",
        isGlobal: false,
        recipients: group.members,
        readBy: [],
      })
      await memberNotification.save()
    }

    res.status(200).json({
      message: "Mentor assigned to groups successfully",
      mentor: mentor.username,
      groups: groups.map((group) => group.name),
    })
  } catch (error) {
    console.error("Error assigning mentor to groups:", error)
    res.status(500).json({ message: "Error assigning mentor to groups", error: error.message })
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

