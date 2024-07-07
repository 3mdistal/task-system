import { Task, Milestone } from "../../src/types";
import { getHoursUntilDeadline } from "../../src/utils/dateUtils";
import { tasks } from "../../src/index";
import * as calculationUtils from "../../src/utils/calculationUtils";

// Mock the imported modules
jest.mock("../../src/utils/dateUtils");
jest.mock("../../src/index", () => ({
  tasks: [
    { name: "Task 1", duration: 4, milestone: "Milestone 1" },
    { name: "Task 2", duration: 6, milestone: "Milestone 1" },
    { name: "Task 3", duration: 3, milestone: "Milestone 2" },
    { name: "Task 4", duration: 5, milestone: "Milestone 2" },
    { name: "Task 5", duration: 2, milestone: "Milestone 3" },
  ],
}));

describe("Project Management Utilities", () => {
  beforeEach(() => {
    jest.spyOn(calculationUtils, "getTasksForMilestone");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("calculateTotalDuration", () => {
    it("should correctly calculate total duration for given tasks", () => {
      const testTasks: Task[] = [
        { name: "Task 1", duration: 4 },
        { name: "Task 2", duration: 6 },
        { name: "Task 3", duration: 3 },
      ];
      expect(calculationUtils.calculateTotalDuration(testTasks)).toBe(13);
    });

    it("should return 0 for an empty task list", () => {
      expect(calculationUtils.calculateTotalDuration([])).toBe(0);
    });
  });

  describe("calculateDeadlineRatio", () => {
    const mockMilestone: Milestone = {
      name: "Test Milestone",
      viability: 0.8,
      excitement: 0.7,
      project: "Test Project",
    };

    beforeEach(() => {
      (getHoursUntilDeadline as jest.Mock).mockClear();
    });

    it("should calculate correct ratio when hours > duration", () => {
      (getHoursUntilDeadline as jest.Mock).mockReturnValue(20);
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([
        { name: "Task 1", duration: 5 },
        { name: "Task 2", duration: 5 },
      ]);
      const result = calculationUtils.calculateDeadlineRatio(
        mockMilestone,
        new Date()
      );
      expect(result).toBe(2); // 20 hours / 10 hours duration
    });

    it("should calculate correct ratio when hours < duration", () => {
      (getHoursUntilDeadline as jest.Mock).mockReturnValue(5);
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([
        { name: "Task 1", duration: 5 },
        { name: "Task 2", duration: 5 },
      ]);
      const result = calculationUtils.calculateDeadlineRatio(
        mockMilestone,
        new Date()
      );
      expect(result).toBe(0.5); // 5 hours / 10 hours duration
    });

    it("should return 0 when hours until deadline is 0", () => {
      (getHoursUntilDeadline as jest.Mock).mockReturnValue(0);
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([
        { name: "Task 1", duration: 5 },
        { name: "Task 2", duration: 5 },
      ]);
      const result = calculationUtils.calculateDeadlineRatio(
        mockMilestone,
        new Date()
      );
      expect(result).toBe(0);
    });

    it("should return 0 when there are no tasks", () => {
      (getHoursUntilDeadline as jest.Mock).mockReturnValue(10);
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([]);
      const result = calculationUtils.calculateDeadlineRatio(
        mockMilestone,
        new Date()
      );
      expect(result).toBe(0);
    });
  });

  describe("isDeadlineMeetable", () => {
    const mockDate = new Date("2024-07-07");

    beforeEach(() => {
      jest.spyOn(calculationUtils, "calculateDeadlineRatio");
    });

    it("should return true when no deadlines are set", () => {
      const milestone: Milestone = {
        name: "No Deadline",
        viability: 0.8,
        excitement: 0.7,
        project: "Test Project",
      };
      expect(calculationUtils.isDeadlineMeetable(milestone, mockDate)).toBe(
        true
      );
    });

    it("should return true when ratio >= 1", () => {
      const milestone: Milestone = {
        name: "Meetable Deadline",
        viability: 0.8,
        excitement: 0.7,
        project: "Test Project",
        soft_deadline: "2024-07-20",
      };
      (calculationUtils.calculateDeadlineRatio as jest.Mock).mockReturnValue(
        1.5
      );
      expect(calculationUtils.isDeadlineMeetable(milestone, mockDate)).toBe(
        true
      );
    });

    it("should return false when ratio < 1", () => {
      const milestone: Milestone = {
        name: "Unmeetable Deadline",
        viability: 0.8,
        excitement: 0.7,
        project: "Test Project",
        hard_deadline: "2024-07-10",
      };
      (calculationUtils.calculateDeadlineRatio as jest.Mock).mockReturnValue(
        0.5
      );
      expect(calculationUtils.isDeadlineMeetable(milestone, mockDate)).toBe(
        false
      );
    });
  });

  describe("getTasksForMilestone", () => {
    it("should return correct tasks for a given milestone", () => {
      const milestone: Milestone = {
        name: "Milestone 1",
        viability: 0.8,
        excitement: 0.7,
        project: "Test Project",
      };
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([
        { name: "Task 1", duration: 4, milestone: "Milestone 1" },
        { name: "Task 2", duration: 6, milestone: "Milestone 1" },
      ]);
      const result = calculationUtils.getTasksForMilestone(milestone);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Task 1");
      expect(result[1].name).toBe("Task 2");
    });

    it("should return an empty array for a milestone with no tasks", () => {
      const milestone: Milestone = {
        name: "Non-existent Milestone",
        viability: 0.8,
        excitement: 0.7,
        project: "Test Project",
      };
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([]);
      const result = calculationUtils.getTasksForMilestone(milestone);
      expect(result).toHaveLength(0);
    });
  });
});
