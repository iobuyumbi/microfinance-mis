// server\controllers\meetingController.js (REVISED)
const Meeting = require('../models/Meeting');
const Group = require('../models/Group');
const User = require('../models/User'); // Needed for populating attendance
const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const { ErrorResponse } = require('../utils'); // Import custom error class
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
  // Allow past meetings to be scheduled for historical data entry, but warn if in past
  if (meetingDate < new Date() && !req.body.allowPastDate) {
    // Added optional allowPastDate flag
    // return next(new ErrorResponse('Meeting date must be in the future.', 400));
    console.warn(`Meeting scheduled for a past date: ${meetingDate}`);
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
    scheduledBy: req.user.id, // Record who scheduled the meeting
  });

  // Populate for response
  await meeting.populate('group', 'name');
  await meeting.populate('scheduledBy', 'name email');

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
    .populate('scheduledBy', 'name email') // Populate who scheduled it
    .sort({ date: -1 }); // Sort by latest date first

  res.status(200).json({
    success: true,
    count: meetings.length,
    data: meetings,
  });
});

// @desc    Get a single meeting by ID with access control
// @route   GET /api/meetings/:id
// @access  Private (filterDataByRole middleware handles access)
exports.getMeetingById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Meeting ID format.', 400));
  }

  // Combine _id from params with req.dataFilter for robust access control
  const query = { _id: id, ...(req.dataFilter || {}) };

  const meeting = await Meeting.findOne(query)
    .populate('group', 'name location')
    .populate('attendance', 'name email')
    .populate('scheduledBy', 'name email');

  if (!meeting) {
    // If not found, it means either the ID is wrong, or the user doesn't have access
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

  // Combine _id from params with req.dataFilter for robust access control
  const query = { _id: id, ...(req.dataFilter || {}) };
  const meeting = await Meeting.findOne(query);

  if (!meeting) {
    return next(
      new ErrorResponse(
        'Meeting not found or you do not have permission to update.',
        404
      )
    );
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
  await meeting.populate('scheduledBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Meeting updated successfully.',
    data: meeting,
  });
});

// @desc    Mark attendance for a meeting
// @route   POST /api/meetings/:id/attendance
// @access  Private (Admin, Officer, or user with 'can_record_attendance' permission)
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
  } // Combine _id from params with req.dataFilter for robust access control

  const query = { _id: id, ...(req.dataFilter || {}) };
  const meeting = await Meeting.findOne(query);

  if (!meeting) {
    return next(
      new ErrorResponse(
        'Meeting not found or you do not have permission to mark attendance.',
        404
      )
    );
  } // Ensure the user being marked exists

  const userExists = await User.findById(userId);
  if (!userExists) {
    return next(
      new ErrorResponse('User to mark attendance for not found.', 404)
    );
  } // Check if user is ALREADY in attendance before pushing to avoid redundant saves and error.

  const isAlreadyAttended = meeting.attendance.some(
    attendedUserId => attendedUserId.toString() === userId
  );

  if (isAlreadyAttended) {
    return next(
      new ErrorResponse(
        'User already marked as attended for this meeting.',
        400
      )
    );
  } // Use the instance method defined on the Meeting model
  // This method handles pushing the userId and saving the document.

  await meeting.markAttendance(userId); // This correctly uses your model method.
  // Populate for response AFTER saving the meeting

  await meeting.populate('group', 'name');
  await meeting.populate('attendance', 'name email');
  await meeting.populate('scheduledBy', 'name email');

  res.status(200).json({
    success: true,
    message: `Attendance marked for user ${userExists.name} in meeting ${meeting.group.name}.`,
    data: meeting,
  });
});

// @desc    Delete a meeting (soft delete recommended)
// @route   DELETE /api/meetings/:id
// @access  Private (Admin, Officer, or user with 'can_delete_meetings' permission)
exports.deleteMeeting = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Meeting ID format.', 400));
  }

  // Combine _id from params with req.dataFilter for robust access control
  const query = { _id: id, ...(req.dataFilter || {}) };
  const meeting = await Meeting.findOne(query);

  if (!meeting) {
    return next(
      new ErrorResponse(
        'Meeting not found or you do not have permission to delete.',
        404
      )
    );
  }

  // Implement soft delete instead of hard delete for historical purposes
  // Add 'deleted' field and 'deletedAt' to your Meeting model schema if not already present.
  // Also, consider adding a 'status' like 'cancelled' or 'archived' for meetings.
  meeting.status = 'cancelled'; // Or 'archived' if you add that enum value
  meeting.deleted = true; // Assuming a 'deleted' boolean field in schema
  meeting.deletedAt = new Date(); // Assuming a 'deletedAt' Date field in schema
  await meeting.save();

  res.status(200).json({
    success: true,
    message: 'Meeting soft-deleted (status changed to cancelled) successfully.',
    data: {},
  });
});
