import { Project } from "../../src/types";
import {
  MS_PER_DAY,
  USABLE_HOURS_PER_DAY,
  getDaysUntilDeadline,
  getHoursUntilDeadline,
  addDays,
} from "../../src/utils/dateUtils";

describe("Date Utility Functions", () => {
  const baseProject: Project = {
    id: "test-project-id",
    name: "Test Project",
    viability: 1,
    excitement: 1,
    deadlineType: "hard",
    goalId: "test-goal-id",
    milestoneIds: [],
    status: "planned",
    type: "project",
  };

  describe("getDaysUntilDeadline", () => {
    it("should return correct number of days for a future hard deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-10T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(project, currentDate)).toBe(3);
    });

    it("should return correct number of days for a future soft deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-10T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(project, currentDate)).toBe(3);
    });

    it("should return MAX_SAFE_INTEGER for invalid date", () => {
      const project: Project = {
        ...baseProject,
        deadline: undefined,
      };
      expect(getDaysUntilDeadline(project)).toBe(Number.MAX_SAFE_INTEGER);
    });

    it("should return 0 for a deadline that's today", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-07T23:59:59Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(project, currentDate)).toBe(0);
    });

    it("should return negative days for a past deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-05T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(project, currentDate)).toBe(-2);
    });

    it("should use current date when not provided", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-10T00:00:00Z"),
      };
      const mockDate = new Date("2024-07-07T00:00:00Z");
      jest.useFakeTimers().setSystemTime(mockDate);
      expect(getDaysUntilDeadline(project)).toBe(3);
      jest.useRealTimers();
    });

    it("should handle daylight saving time changes", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-03-11T00:00:00Z"), // Day after DST change in the US
      };
      const currentDate = new Date("2024-03-09T00:00:00Z"); // Two days before DST change
      expect(getDaysUntilDeadline(project, currentDate)).toBe(2);
    });

    it("should handle leap years", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-03-01T00:00:00Z"), // March 1st of a leap year
      };
      const currentDate = new Date("2024-02-28T00:00:00Z"); // February 28th of a leap year
      expect(getDaysUntilDeadline(project, currentDate)).toBe(2);
    });

    it("should handle different time zones", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-10T22:00:00Z"), // 10 PM UTC
      };
      const currentDate = new Date("2024-07-10T01:00:00-07:00"); // 1 AM PDT (UTC-7)
      expect(getDaysUntilDeadline(project, currentDate)).toBe(0);
    });
  });

  describe("getHoursUntilDeadline", () => {
    it("should return correct number of hours until deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-10T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(project, currentDate)).toBe(9); // 3 days * 3 usable hours
    });

    it("should return 2 hours for a deadline that's today", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-07T23:59:59Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(project, currentDate)).toBe(2);
    });

    it("should return negative hours for a past deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-05T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(project, currentDate)).toBe(-6); // -2 days * 3 usable hours
    });

    it("should handle daylight saving time changes", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-03-11T03:00:00Z"), // 3 AM UTC after DST change
      };
      const currentDate = new Date("2024-03-10T01:00:00-08:00"); // 1 AM PST before DST change
      expect(getHoursUntilDeadline(project, currentDate)).toBe(2);
    });

    it("should handle leap years", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-03-01T00:00:00Z"), // March 1st of a leap year
      };
      const currentDate = new Date("2024-02-29T00:00:00Z"); // February 29th of a leap year
      expect(getHoursUntilDeadline(project, currentDate)).toBe(3);
    });

    it("should handle different time zones", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-10T22:00:00Z"), // 10 PM UTC
      };
      const currentDate = new Date("2024-07-10T14:00:00-07:00"); // 2 PM PDT (UTC-7)
      expect(getHoursUntilDeadline(project, currentDate)).toBe(1);
    });
  });

  describe("addDays", () => {
    it("should add correct number of days for full days", () => {
      const currentDate = new Date("2024-07-07T00:00:00Z");
      const result = addDays(3 * USABLE_HOURS_PER_DAY, currentDate); // 3 full days
      expect(result.date).toEqual(new Date("2024-07-10T00:00:00Z"));
      expect(result.hoursUsed).toBe(0);
    });

    it("should add correct number of days with remaining hours", () => {
      const currentDate = new Date("2024-07-07T00:00:00Z");
      const result = addDays(3 * USABLE_HOURS_PER_DAY + 1, currentDate); // 3 full days + 1 hour
      expect(result.date).toEqual(new Date("2024-07-10T00:00:00Z"));
      expect(result.hoursUsed).toBe(1);
    });

    it("should handle duration less than one day", () => {
      const currentDate = new Date("2024-07-07T00:00:00Z");
      const result = addDays(2, currentDate);
      expect(result.date).toEqual(new Date("2024-07-07T00:00:00Z"));
      expect(result.hoursUsed).toBe(2);
    });

    it("should handle zero duration", () => {
      const currentDate = new Date("2024-07-07T00:00:00Z");
      const result = addDays(0, currentDate);
      expect(result.date).toEqual(new Date("2024-07-07T00:00:00Z"));
      expect(result.hoursUsed).toBe(0);
    });

    it("should handle adding days across daylight saving time change", () => {
      const currentDate = new Date("2024-03-09T12:00:00Z"); // Before DST change
      const result = addDays(4 * USABLE_HOURS_PER_DAY, currentDate);
      expect(result.date).toEqual(new Date("2024-03-13T12:00:00Z"));
      expect(result.hoursUsed).toBe(0);
    });

    it("should handle adding days across a leap year boundary", () => {
      const currentDate = new Date("2024-02-28T12:00:00Z");
      const result = addDays(3 * USABLE_HOURS_PER_DAY, currentDate);
      expect(result.date).toEqual(new Date("2024-03-02T12:00:00Z"));
      expect(result.hoursUsed).toBe(0);
    });

    it("should handle large durations", () => {
      const currentDate = new Date("2024-07-07T00:00:00Z");
      const result = addDays(365 * USABLE_HOURS_PER_DAY, currentDate); // 1 year
      expect(result.date).toEqual(new Date("2025-07-07T00:00:00Z"));
      expect(result.hoursUsed).toBe(0);
    });

    it("should handle fractional days", () => {
      const currentDate = new Date("2024-07-07T00:00:00Z");
      const result = addDays(3.5 * USABLE_HOURS_PER_DAY, currentDate);
      expect(result.date).toEqual(new Date("2024-07-10T00:00:00Z"));
      expect(result.hoursUsed).toBe(1.5);
    });
  });

  describe("Constants", () => {
    it("should have correct value for MS_PER_DAY", () => {
      expect(MS_PER_DAY).toBe(86400000); // 1000 * 60 * 60 * 24
    });

    it("should have correct value for USABLE_HOURS_PER_DAY", () => {
      expect(USABLE_HOURS_PER_DAY).toBe(3);
    });
  });
});
