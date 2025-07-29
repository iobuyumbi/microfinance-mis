// server\controllers\meetingController.js
const Meeting = require('../models/Meeting');
const Group = require('../models/Group');
const User = require('../models/User'); // Needed for populating attendance
const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const ErrorResponse = require('../utils/errorResponse'); // Import custom error class
const mongoose = require('mongoose'); // For ObjectId validation

// @desc    Schedule a new meeting
// @route   POST /api/meetings
// @access  Private (Admin, Officer, or user with 'can_schedule_meetings' permission)
exports.scheduleMeeting = asyncHandler(async (req, res, next) => {
  const { group: groupId, date, location, agenda } = req.body;

  // 1. Basic Validation
  if (!groupId || !date) {
    return next(
      new ErrorResponse('Group ID and meeting date are required.', 400)
    );
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }
  const meetingDate = new Date(date);
  if (isNaN(meetingDate.getTime())) {
    return next(new ErrorResponse('Invalid date format.', 400));
  }
  if (meetingDate < new Date()) {
    // Meetings should be scheduled for the future
    return next(new ErrorResponse('Meeting date must be in the future.', 400));
  }

  // 2. Ensure group exists
  const groupExists = await Group.findById(groupId);
  if (!groupExists) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  // 3. Create the meeting
  const meeting = await Meeting.create({
    group: groupId,
    date: meetingDate,
    location,
    agenda,
    status: 'scheduled', // Default status for new meetings
    attendance: [], // Initialize empty attendance
  });

  // Populate for response
  await meeting.populate('group', 'name');

  res.status(201).json({
    success: true,
    message: 'Meeting scheduled successfully.',
    data: meeting,
  });
});

// @desc    Get all meetings (system-wide or filtered by user/group)
// @route   GET /api/meetings
// @access  Private (filterDataByRole middleware handles access)
exports.getAllMeetings = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware
  const query = req.dataFilter || {};

  const meetings = await Meeting.find(query)
    .populate('group', 'name')
    .populate('attendance', 'name email') // Populate attendees
    .sort({ date: -1 }); // Sort by latest date first

  res.status(200).json({
    success: true,
    count: meetings.length,
    data: meetings,
  });
});

// @desc    Get a single meeting by ID with access control
// @route   GET /api/meetings/:id
// @access  Private (authorizeGroupAccess middleware handles access for meeting's group)
exports.getMeetingById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Meeting ID format.', 400));
  }

  let query = { _id: id };
  // Apply data filter from middleware (if any)
  if (req.dataFilter) {
    Object.assign(query, req.dataFilter);
  }

  const meeting = await Meeting.findOne(query)
    .populate('group', 'name location')
    .populate('attendance', 'name email');

  if (!meeting) {
    return next(
      new ErrorResponse('Meeting not found or you do not have access.', 404)
    );
  }

  res.status(200).json({
    success: true,
    data: meeting,
  });
});

// @desc    Update meeting details
// @route   PUT /api/meetings/:id
// @access  Private (Admin, Officer, or user with 'can_edit_meeting_info' permission)
exports.updateMeeting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { date, location, agenda, status } = req.body; // Added status update

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Meeting ID format.', 400));
  }

  const meeting = await Meeting.findById(id);
  if (!meeting) {
    return next(new ErrorResponse('Meeting not found.', 404));
  }

  // Update allowed fields
  if (date !== undefined) {
    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) {
      return next(new ErrorResponse('Invalid date format.', 400));
    }
    meeting.date = newDate;
  }
  if (location !== undefined) meeting.location = location;
  if (agenda !== undefined) meeting.agenda = agenda;
  if (status !== undefined) {
    const validStatuses = ['scheduled', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return next(
        new ErrorResponse(
          `Invalid status provided. Must be one of: ${validStatuses.join(', ')}.`,
          400
        )
      );
    }
    meeting.status = status;
  }

  await meeting.save();

  // Populate for response
  await meeting.populate('group', 'name');
  await meeting.populate('attendance', 'name email');

  res.status(200).json({
    success: true,
    message: 'Meeting updated successfully.',
    data: meeting,
  });
});

// @desc    Mark attendance for a meeting
// @route   PUT /api/meetings/:id/attendance
// @access  Private (Admin, Officer, or user with 'can_record_attendance' permission)
exports.markAttendance = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Meeting ID
  const { userId } = req.body; // User ID to mark attendance for

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Meeting ID format.', 400));
  }
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return next(
      new ErrorResponse('Valid User ID is required to mark attendance.', 400)
    );
  }

  const meeting = await Meeting.findById(id);
  if (!meeting) {
    return next(new ErrorResponse('Meeting not found.', 404));
  }

  // Ensure the user being marked exists (optional but good)
  const userExists = await User.findById(userId);
  if (!userExists) {
    return next(
      new ErrorResponse('User to mark attendance for not found.', 404)
    );
  }

  // Use the instance method defined on the Meeting model
  await meeting.markAttendance(userId); // This method handles uniqueness and saving

  // Populate for response
  await meeting.populate('group', 'name');
  await meeting.populate('attendance', 'name email');

  res.status(200).json({
    success: true,
    message: `Attendance marked for user ${userExists.name} in meeting ${meeting.group.name}.`,
    data: meeting,
  });
});

// @desc    Delete a meeting
// @route   DELETE /api/meetings/:id
// @access  Private (Admin, Officer, or user with 'can_delete_meetings' permission)
exports.deleteMeeting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Meeting ID format.', 400));
  }

  const meeting = await Meeting.findById(id);
  if (!meeting) {
    return next(new ErrorResponse('Meeting not found.', 404));
  }

  // For meetings, a hard delete might be acceptable if no complex audit trail is needed.
  // However, if meetings are critical historical records, consider a soft delete (e.g., status: 'cancelled').
  await meeting.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Meeting deleted successfully.',
    data: {},
  });
});
