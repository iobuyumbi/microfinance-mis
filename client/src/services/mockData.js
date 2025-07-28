// src/services/mockData.js
// Mock data for development when backend is not available

export const mockUsers = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    status: "active",
    phone: "+1234567890",
    address: "123 Main St, City, State",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "officer",
    status: "active",
    phone: "+1234567891",
    address: "456 Oak Ave, City, State",
    createdAt: "2024-01-02T00:00:00.000Z",
  },
  {
    _id: "3",
    name: "Bob Wilson",
    email: "bob@example.com",
    role: "leader",
    status: "active",
    phone: "+1234567892",
    address: "789 Pine Rd, City, State",
    createdAt: "2024-01-03T00:00:00.000Z",
  },
  {
    _id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    role: "member",
    status: "active",
    phone: "+1234567893",
    address: "321 Elm St, City, State",
    createdAt: "2024-01-04T00:00:00.000Z",
  },
];

export const mockGroups = [
  {
    _id: "group1",
    name: "Community Group 1",
    location: "Downtown",
    meetingFrequency: "monthly",
    createdBy: "3",
    members: ["3", "4"],
    totalSavings: 5000,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "group2",
    name: "Community Group 2",
    location: "Uptown",
    meetingFrequency: "weekly",
    createdBy: "2",
    members: ["2", "4"],
    totalSavings: 3000,
    createdAt: "2024-01-02T00:00:00.000Z",
  },
];

export const mockLoans = [
  {
    _id: "loan1",
    memberId: "4",
    groupId: "group1",
    amount: 1000,
    status: "active",
    interestRate: 5,
    term: 12,
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    _id: "loan2",
    memberId: "3",
    groupId: "group1",
    amount: 2000,
    status: "pending",
    interestRate: 5,
    term: 24,
    createdAt: "2024-01-20T00:00:00.000Z",
  },
];

export const mockSavings = [
  {
    _id: "saving1",
    memberId: "4",
    groupId: "group1",
    amount: 500,
    type: "contribution",
    status: "completed",
    createdAt: "2024-01-10T00:00:00.000Z",
  },
  {
    _id: "saving2",
    memberId: "3",
    groupId: "group1",
    amount: 1000,
    type: "contribution",
    status: "completed",
    createdAt: "2024-01-12T00:00:00.000Z",
  },
];

export const mockMeetings = [
  {
    _id: "meeting1",
    groupId: "group1",
    title: "Monthly Group Meeting",
    description: "Regular monthly meeting to discuss group activities",
    date: "2024-02-01T10:00:00.000Z",
    status: "scheduled",
    attendees: ["3", "4"],
    createdAt: "2024-01-25T00:00:00.000Z",
  },
  {
    _id: "meeting2",
    groupId: "group2",
    title: "Weekly Check-in",
    description: "Weekly progress check and planning",
    date: "2024-01-30T14:00:00.000Z",
    status: "completed",
    attendees: ["2", "4"],
    createdAt: "2024-01-28T00:00:00.000Z",
  },
];

export const mockTransactions = [
  {
    _id: "trans1",
    type: "loan_disbursement",
    amount: 1000,
    memberId: "4",
    groupId: "group1",
    description: "Loan disbursement for business",
    status: "completed",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    _id: "trans2",
    type: "savings_contribution",
    amount: 500,
    memberId: "4",
    groupId: "group1",
    description: "Monthly savings contribution",
    status: "completed",
    createdAt: "2024-01-10T00:00:00.000Z",
  },
];

// Helper function to simulate API delay
export const simulateApiDelay = (ms = 500) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Helper function to simulate API errors
export const simulateApiError = (probability = 0.1) => {
  if (Math.random() < probability) {
    throw new Error("Simulated API error");
  }
};

// Mock service responses
export const createMockResponse = (data, success = true) => {
  return {
    data,
    success,
    message: success ? "Success" : "Error",
    timestamp: new Date().toISOString(),
  };
};
