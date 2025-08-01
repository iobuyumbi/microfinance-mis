import { api } from "../client";
import { ENDPOINTS } from "../endpoints";

// Mock axios
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ENDPOINTS", () => {
    test("should have all required endpoint categories", () => {
      expect(ENDPOINTS).toHaveProperty("AUTH");
      expect(ENDPOINTS).toHaveProperty("USERS");
      expect(ENDPOINTS).toHaveProperty("LOANS");
      expect(ENDPOINTS).toHaveProperty("GROUPS");
      expect(ENDPOINTS).toHaveProperty("TRANSACTIONS");
      expect(ENDPOINTS).toHaveProperty("SAVINGS");
      expect(ENDPOINTS).toHaveProperty("MEETINGS");
      expect(ENDPOINTS).toHaveProperty("REPORTS");
      expect(ENDPOINTS).toHaveProperty("SETTINGS");
      expect(ENDPOINTS).toHaveProperty("CHAT");
      expect(ENDPOINTS).toHaveProperty("NOTIFICATIONS");
    });

    test("should generate correct user endpoints", () => {
      const userId = "123";
      expect(ENDPOINTS.USERS.BASE).toBe("/users");
      expect(ENDPOINTS.USERS.BY_ID(userId)).toBe(`/users/${userId}`);
      expect(ENDPOINTS.USERS.PROFILE).toBe("/users/profile");
      expect(ENDPOINTS.USERS.GROUPS(userId)).toBe(`/users/${userId}/groups`);
      expect(ENDPOINTS.USERS.FINANCIAL_SUMMARY(userId)).toBe(
        `/users/${userId}/financial-summary`
      );
    });

    test("should generate correct loan endpoints", () => {
      const loanId = "456";
      expect(ENDPOINTS.LOANS.BASE).toBe("/loans");
      expect(ENDPOINTS.LOANS.BY_ID(loanId)).toBe(`/loans/${loanId}`);
      expect(ENDPOINTS.LOANS.APPLY).toBe("/loans");
      expect(ENDPOINTS.LOANS.APPROVE(loanId)).toBe(`/loans/${loanId}/approve`);
      expect(ENDPOINTS.LOANS.STATS).toBe("/loans/stats");
      expect(ENDPOINTS.LOANS.REPAYMENT_SCHEDULE(loanId)).toBe(
        `/loans/${loanId}/repayment-schedule`
      );
      expect(ENDPOINTS.LOANS.PAYMENTS(loanId)).toBe(
        `/loans/${loanId}/payments`
      );
    });

    test("should generate correct group endpoints", () => {
      const groupId = "789";
      const userId = "123";
      expect(ENDPOINTS.GROUPS.BASE).toBe("/groups");
      expect(ENDPOINTS.GROUPS.BY_ID(groupId)).toBe(`/groups/${groupId}`);
      expect(ENDPOINTS.GROUPS.MEMBERS(groupId)).toBe(
        `/groups/${groupId}/members`
      );
      expect(ENDPOINTS.GROUPS.MEMBER(groupId, userId)).toBe(
        `/groups/${groupId}/members/${userId}`
      );
      expect(ENDPOINTS.GROUPS.MEMBER_ROLE(groupId, userId)).toBe(
        `/groups/${groupId}/members/${userId}/role`
      );
      expect(ENDPOINTS.GROUPS.JOIN(groupId)).toBe(`/groups/${groupId}/join`);
    });

    test("should generate correct transaction endpoints", () => {
      const transactionId = "101";
      expect(ENDPOINTS.TRANSACTIONS.BASE).toBe("/transactions");
      expect(ENDPOINTS.TRANSACTIONS.BY_ID(transactionId)).toBe(
        `/transactions/${transactionId}`
      );
    });

    test("should generate correct savings endpoints", () => {
      const savingsId = "202";
      expect(ENDPOINTS.SAVINGS.BASE).toBe("/savings");
      expect(ENDPOINTS.SAVINGS.BY_ID(savingsId)).toBe(`/savings/${savingsId}`);
      expect(ENDPOINTS.SAVINGS.DEPOSIT).toBe("/savings/deposit");
      expect(ENDPOINTS.SAVINGS.WITHDRAW).toBe("/savings/withdraw");
      expect(ENDPOINTS.SAVINGS.TRANSACTIONS(savingsId)).toBe(
        `/savings/${savingsId}/transactions`
      );
    });

    test("should generate correct meeting endpoints", () => {
      const meetingId = "303";
      expect(ENDPOINTS.MEETINGS.BASE).toBe("/meetings");
      expect(ENDPOINTS.MEETINGS.BY_ID(meetingId)).toBe(
        `/meetings/${meetingId}`
      );
    });

    test("should generate correct report endpoints", () => {
      expect(ENDPOINTS.REPORTS.DASHBOARD).toBe("/reports/dashboard");
      expect(ENDPOINTS.REPORTS.FINANCIAL_SUMMARY).toBe(
        "/reports/financial-summary"
      );
      expect(ENDPOINTS.REPORTS.UPCOMING_REPAYMENTS).toBe(
        "/reports/upcoming-repayments"
      );
      expect(ENDPOINTS.REPORTS.DEFAULTERS).toBe("/reports/defaulters");
      expect(ENDPOINTS.REPORTS.TOTAL_LOANS).toBe("/reports/total-loans");
      expect(ENDPOINTS.REPORTS.GROUP_SAVINGS).toBe("/reports/group-savings");
      expect(ENDPOINTS.REPORTS.LOAN_PORTFOLIO_HEALTH).toBe(
        "/reports/loan-portfolio-health"
      );
      expect(ENDPOINTS.REPORTS.MEMBERS).toBe("/reports/members");
      expect(ENDPOINTS.REPORTS.MEMBER_STATS).toBe("/reports/member-stats");
      expect(ENDPOINTS.REPORTS.SAVINGS_STATS).toBe("/reports/savings-stats");
      expect(ENDPOINTS.REPORTS.RECENT_ACTIVITY).toBe(
        "/reports/recent-activity"
      );
      expect(ENDPOINTS.REPORTS.GROUP_SAVINGS_PERFORMANCE).toBe(
        "/reports/group-savings-performance"
      );
      expect(ENDPOINTS.REPORTS.ACTIVE_LOAN_DEFAULTERS).toBe(
        "/reports/active-loan-defaulters"
      );
      expect(ENDPOINTS.REPORTS.EXPORT("loans", "pdf")).toBe(
        "/reports/export/loans/pdf"
      );
    });

    test("should generate correct settings endpoints", () => {
      expect(ENDPOINTS.SETTINGS.BASE).toBe("/settings");
      expect(ENDPOINTS.SETTINGS.RESET).toBe("/settings/reset");
    });

    test("should generate correct chat endpoints", () => {
      const messageId = "404";
      expect(ENDPOINTS.CHAT.CHANNELS).toBe("/chat/channels");
      expect(ENDPOINTS.CHAT.MESSAGES).toBe("/chat/messages");
      expect(ENDPOINTS.CHAT.MESSAGE(messageId)).toBe(
        `/chat/messages/${messageId}`
      );
      expect(ENDPOINTS.CHAT.MARK_READ).toBe("/chat/messages/read");
      expect(ENDPOINTS.CHAT.STATS).toBe("/chat/stats");
    });

    test("should generate correct notification endpoints", () => {
      const notificationId = "505";
      expect(ENDPOINTS.NOTIFICATIONS.BASE).toBe("/notifications");
      expect(ENDPOINTS.NOTIFICATIONS.BY_ID(notificationId)).toBe(
        `/notifications/${notificationId}`
      );
    });
  });

  describe("API Methods", () => {
    test("should have all required API methods", () => {
      expect(api).toHaveProperty("get");
      expect(api).toHaveProperty("post");
      expect(api).toHaveProperty("put");
      expect(api).toHaveProperty("patch");
      expect(api).toHaveProperty("delete");
      expect(api).toHaveProperty("upload");
    });
  });

  describe("Helper Functions", () => {
    test("buildQueryString should work correctly", () => {
      const { buildQueryString } = require("../endpoints");

      expect(buildQueryString({})).toBe("");
      expect(buildQueryString({ page: 1 })).toBe("?page=1");
      expect(buildQueryString({ page: 1, limit: 10 })).toBe("?page=1&limit=10");
      expect(buildQueryString({ search: "test", status: "active" })).toBe(
        "?search=test&status=active"
      );
    });

    test("buildUrl should work correctly", () => {
      const { buildUrl } = require("../endpoints");

      expect(buildUrl("/users", { page: 1 })).toBe("/users?page=1");
      expect(buildUrl("/loans", { status: "active", limit: 10 })).toBe(
        "/loans?status=active&limit=10"
      );
      expect(buildUrl("/groups")).toBe("/groups");
    });
  });
});
