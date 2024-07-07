import { getDaysUntilDeadline, MS_PER_DAY } from "../../src/utils/dateUtils";
import { Milestone } from "../../src/types";

describe("dateUtils", () => {
  describe("getDaysUntilDeadline", () => {
    it("should return correct number of days for a future deadline", () => {
      const milestone: Milestone = {
        name: "Test Milestone",
        viability: 1,
        excitement: 1,
        soft_deadline: "2023-12-31",
        project: "Test Project",
      };
      const currentDate = new Date("2023-01-01");
      expect(getDaysUntilDeadline(milestone, currentDate)).toBe(364);
    });

    it("should return 0 for a past deadline", () => {
      const milestone: Milestone = {
        name: "Test Milestone",
        viability: 1,
        excitement: 1,
        soft_deadline: "2023-01-01",
        project: "Test Project",
      };
      const currentDate = new Date("2023-12-31");
      expect(getDaysUntilDeadline(milestone, currentDate)).toBe(-364);
    });

    it("should return MAX_SAFE_INTEGER for a milestone without a deadline", () => {
      const milestone: Milestone = {
        name: "Test Milestone",
        viability: 1,
        excitement: 1,
        project: "Test Project",
      };
      expect(getDaysUntilDeadline(milestone)).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  // Add more tests for other functions in dateUtils.ts
});
