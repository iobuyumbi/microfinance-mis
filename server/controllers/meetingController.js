const Meeting = require("../models/Meeting");
const Group = require("../models/Group");

// Utility to check group access for non-admins/officers
const checkGroupAccess = async (groupId, user) => {
  if (["admin", "officer"].includes(user.role)) return true;
  const group = await Group.findById(groupId);
  return group && group.members.includes(user._id);
};

// Schedule meeting
exports.scheduleMeeting = async (req, res, next) => {
  try {
    const { group, date, location, agenda } = req.body;

    if (!(await checkGroupAccess(group, req.user))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const meeting = await Meeting.create({
      group,
      date,
      location,
      agenda,
      attendance: [],
    });
    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
};

// Get all meetings
exports.getAllMeetings = async (req, res, next) => {
  try {
    let meetings;

    if (["admin", "officer"].includes(req.user.role)) {
      meetings = await Meeting.find();
    } else {
      const groupIds = await Group.find({ members: req.user._id }).distinct(
        "_id"
      );
      meetings = await Meeting.find({ group: { $in: groupIds } });
    }
    res
      .status(200)
      .json({ success: true, count: meetings.length, data: meetings });
  } catch (error) {
    next(error);
  }
};

// Get single meeting
exports.getMeetingById = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    if (!(await checkGroupAccess(meeting.group, req.user))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
};

// Update meeting
exports.updateMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    if (!(await checkGroupAccess(meeting.group, req.user))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const allowedFields = ["date", "location", "agenda"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        meeting[field] = req.body[field];
      }
    });

    await meeting.save();

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
};

// Mark attendance
exports.markAttendance = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    if (!(await checkGroupAccess(meeting.group, req.user))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!meeting.attendance.includes(userId)) {
      meeting.attendance.push(userId);
      await meeting.save();
    }
    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
};

// Delete meeting
exports.deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    if (!(await checkGroupAccess(meeting.group, req.user))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await meeting.deleteOne();

    res.status(200).json({ success: true, message: "Meeting deleted" });
  } catch (error) {
    next(error);
  }
};
