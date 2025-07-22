const ChatMessage = require("../models/ChatMessage");
const Group = require("../models/Group");

// Get all chat messages for a group
exports.getGroupChats = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    // Only allow if user is in group or admin/officer
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    const isMember = group.members.some((id) => id.toString() === req.user._id.toString());
    if (!isMember && !["admin", "officer"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const messages = await ChatMessage.find({ group: groupId }).populate("sender", "name email").sort({ timestamp: 1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// Post a new chat message to a group
exports.postGroupChat = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message is required" });
    // Only allow if user is in group or admin/officer
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    const isMember = group.members.some((id) => id.toString() === req.user._id.toString());
    if (!isMember && !["admin", "officer"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const chat = await ChatMessage.create({
      group: groupId,
      sender: req.user._id,
      message,
    });
    await chat.populate("sender", "name email");
    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
}; 