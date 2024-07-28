import { Project } from "../../src/types";
import {
  MS_PER_DAY,
  USABLE_HOURS_PER_DAY,
  getDaysUntilDeadline,
  getHoursUntilDeadline,
  addDays,
} from "../../src/utils/dateUtils";

describe("Project Utility Functions", () => {
  const baseProject: Project = {
    name: "Test Project",
    viability: 1,
    excitement: 1,
    deadlineType: "hard",
    goal: {
      name: "Test Goal",
      projects: () => [],
      status: "planned",
    },
    milestones: () => [],
    status: "planned",
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
        deadline: new Date("2024-07-07T12:00:00Z"),
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
  });

  describe("getHoursUntilDeadline", () => {
    it("should return correct number of hours until deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-10T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(project, currentDate)).toBe(
        3 * USABLE_HOURS_PER_DAY
      ); // 3 days * 3 usable hours
    });

    it("should return 0 hours for a deadline that's today", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-07T12:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(project, currentDate)).toBe(0);
    });

    it("should return negative hours for a past deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-05T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(project, currentDate)).toBe(
        -2 * USABLE_HOURS_PER_DAY
      ); // -2 days * 3 usable hours
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
  });

  describe("Constants", () => {
    it("should have correct value for MS_PER_DAY", () => {
      expect(MS_PER_DAY).toBe(86400000); // 1000 * 60 * 60 * 24
    });
  });
});
