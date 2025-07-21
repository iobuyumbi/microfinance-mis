const Group = require("../models/Group");
const User = require("../models/User");

// Create a new group
exports.createGroup = async (req, res, next) => {
  try {
    const { name, members } = req.body;

    const group = new Group({
      name,
      createdBy: req.user._id,
      members: members && members.length > 0 ? members : [req.user._id],
    });

    await group.save();

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

// Get all groups - Admin & Officer only
exports.getAllGroups = async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "officer") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const groups = await Group.find().populate("members", "name email");
    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
};

// Get a group by ID - accessible to members or admin/officer
exports.getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      "members",
      "name email"
    );
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const isMember = group.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (req.user.role !== "admin" && req.user.role !== "officer" && !isMember) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

// Update group details - only by admins, officers, or group members
exports.updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const isMember = group.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (req.user.role !== "admin" && req.user.role !== "officer" && !isMember) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    group.name = req.body.name || group.name;
    await group.save();

    res
      .status(200)
      .json({ success: true, message: "Group updated", data: group });
  } catch (error) {
    next(error);
  }
};

// Delete a group - only creator, admin or officer
exports.deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const isCreator = group.createdBy.toString() === req.user._id.toString();

    if (
      req.user.role !== "admin" &&
      req.user.role !== "officer" &&
      !isCreator
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await group.deleteOne();

    res.status(200).json({ success: true, message: "Group deleted" });
  } catch (error) {
    next(error);
  }
};

// Add a member to a group
exports.addMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const alreadyMember = group.members.some((m) => m.toString() === userId);
    if (alreadyMember) {
      return res
        .status(400)
        .json({ success: false, message: "User already a member" });
    }

    group.members.push(userId);
    await group.save();

    res
      .status(200)
      .json({ success: true, message: "Member added", data: group });
  } catch (error) {
    next(error);
  }
};

// Remove a member from a group
exports.removeMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    const { userId } = req.body;

    const userExists = group.members.some((m) => m.toString() === userId);
    if (!userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User is not a member" });
    }

    // Optional: prevent removing the last member
    if (group.members.length === 1) {
      return res.status(400).json({
        success: false,
        message: "Group must have at least one member",
      });
    }

    group.members = group.members.filter((m) => m.toString() !== userId);
    await group.save();

    res
      .status(200)
      .json({ success: true, message: "Member removed", data: group });
  } catch (error) {
    next(error);
  }
};
