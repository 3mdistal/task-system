import {
  optimizeTasks,
  checkDeadlineStatus,
  calculateCrunchInfo,
} from "../src/index";
import { Project, Task, Milestone, Status, Goal } from "../src/types";
import * as optimizationService from "../src/services/optimizationService";
import * as simulationService from "../src/services/simulationService";

jest.mock("../src/services/optimizationService");
jest.mock("../src/services/simulationService");

// Move mock data to a more global scope
const mockGoal: Goal = {
  name: "Test Goal",
  projects: () => [],
  status: "In Progress" as Status,
};

const mockProjects: Project[] = [
  {
    name: "Project A",
    deadline: new Date("2023-12-31"),
    deadlineType: "hard",
    excitement: 4,
    goal: mockGoal,
    milestones: () => [],
    status: "In Progress" as Status,
    viability: 3,
  },
  {
    name: "Project B",
    deadline: new Date("2024-01-31"),
    deadlineType: "soft",
    excitement: 3,
    goal: mockGoal,
    milestones: () => [],
    status: "Not Started" as Status,
    viability: 4,
  },
];

const mockMilestones: Milestone[] = [
  {
    dependencies: [],
    name: "Milestone A",
    project: mockProjects[0],
    status: "Not Started" as Status,
    tasks: () => [],
  },
  {
    dependencies: [],
    name: "Milestone B",
    project: mockProjects[1],
    status: "Not Started" as Status,
    tasks: () => [],
  },
];

const mockTasks: Task[] = [
  {
    name: "Task 1",
    duration: 5,
    timeSpent: 0,
    dependencies: [],
    status: "Not Started" as Status,
    completionDate: new Date("2023-12-30"),
    milestone: mockMilestones[0],
    goal: mockGoal,
  },
  {
    name: "Task 2",
    duration: 3,
    timeSpent: 0,
    dependencies: [],
    status: "Not Started" as Status,
    completionDate: new Date("2024-02-01"),
    milestone: mockMilestones[1],
    goal: mockGoal,
  },
];

describe("optimizeTasks", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (optimizationService.optimizeSequence as jest.Mock).mockReturnValue(
      mockTasks
    );
    (simulationService.simulateTaskSequence as jest.Mock).mockReturnValue({
      score: 100,
      completedTasks: mockTasks,
      endDate: new Date("2024-02-01"),
    });
  });

  it("should return an optimization result", () => {
    const result = optimizeTasks(mockProjects);

    expect(result).toHaveProperty("optimizedSequence");
    expect(result).toHaveProperty("statistics");
    expect(result).toHaveProperty("deadlineStatus");
    expect(result).toHaveProperty("crunchInfo");
  });

  it("should call optimizeSequence and simulateTaskSequence", () => {
    optimizeTasks(mockProjects);

    expect(optimizationService.optimizeSequence).toHaveBeenCalledWith(
      mockProjects
    );
    expect(simulationService.simulateTaskSequence).toHaveBeenCalledWith(
      mockTasks
    );
  });

  it("should correctly check deadline status", () => {
    const result = optimizeTasks(mockProjects);

    expect(result.deadlineStatus).toEqual({
      allHardDeadlinesMet: true,
      allSoftDeadlinesMet: false,
      missedHardDeadlines: [],
      missedSoftDeadlines: ["Project B: 2024-01-31T00:00:00.000Z"],
    });
  });

  it("should calculate crunch info", () => {
    const result = optimizeTasks(mockProjects);

    expect(result.crunchInfo).toEqual({
      earliestCrunch: -32,
      latestCrunch: -1,
      averageCrunch: -16,
      crunchByProject: {
        "Project A": -32,
        "Project B": -1,
      },
    });
  });

  it("should handle invalid simulation result", () => {
    (simulationService.simulateTaskSequence as jest.Mock).mockReturnValueOnce(
      undefined
    );
    const result = optimizeTasks(mockProjects);

    expect(result).toEqual({
      optimizedSequence: [],
      statistics: {
        score: 0,
        completedTasks: [],
        endDate: expect.any(Date),
      },
      deadlineStatus: {
        allHardDeadlinesMet: false,
        allSoftDeadlinesMet: false,
        missedHardDeadlines: [],
        missedSoftDeadlines: [],
      },
      crunchInfo: {
        earliestCrunch: 0,
        latestCrunch: 0,
        averageCrunch: 0,
        crunchByProject: {},
      },
    });
  });
});

describe("checkDeadlineStatus", () => {
  it("should correctly identify met and missed deadlines", () => {
    const completedTasks: Task[] = [
      {
        ...mockTasks[0],
        completionDate: new Date("2023-12-30"),
      },
      {
        ...mockTasks[1],
        completionDate: new Date("2024-02-01"),
      },
    ];

    const result = checkDeadlineStatus(completedTasks);

    expect(result).toEqual({
      allHardDeadlinesMet: true,
      allSoftDeadlinesMet: false,
      missedHardDeadlines: [],
      missedSoftDeadlines: ["Project B: 2024-01-31T00:00:00.000Z"],
    });
  });

  it("should handle tasks without completion dates", () => {
    const completedTasks: Task[] = [
      {
        ...mockTasks[0],
        completionDate: undefined,
      },
    ];

    const result = checkDeadlineStatus(completedTasks);

    expect(result).toEqual({
      allHardDeadlinesMet: true,
      allSoftDeadlinesMet: true,
      missedHardDeadlines: [],
      missedSoftDeadlines: [],
    });
  });

  it("should handle tasks without milestones", () => {
    const completedTasks: Task[] = [
      {
        ...mockTasks[0],
        completionDate: new Date("2023-12-30"),
        milestone: undefined,
      },
    ];

    const result = checkDeadlineStatus(completedTasks);

    expect(result).toEqual({
      allHardDeadlinesMet: true,
      allSoftDeadlinesMet: true,
      missedHardDeadlines: [],
      missedSoftDeadlines: [],
    });
  });
});

describe("calculateCrunchInfo", () => {
  it("should calculate correct crunch info", () => {
    const projects: Project[] = [
      {
        ...mockProjects[0],
        deadline: new Date("2024-01-15"),
      },
      {
        ...mockProjects[1],
        deadline: new Date("2024-01-31"),
      },
    ];
    const endDate = new Date("2024-01-20");

    const result = calculateCrunchInfo(projects, endDate);

    expect(result).toEqual({
      earliestCrunch: -5,
      latestCrunch: 11,
      averageCrunch: 3,
      crunchByProject: {
        "Project A": -5,
        "Project B": 11,
      },
    });
  });

  it("should handle projects without deadlines", () => {
    const projects: Project[] = [
      {
        ...mockProjects[0],
        deadline: undefined,
      },
      {
        ...mockProjects[1],
        deadline: new Date("2024-01-31"),
      },
    ];
    const endDate = new Date("2024-01-20");

    const result = calculateCrunchInfo(projects, endDate);

    expect(result).toEqual({
      earliestCrunch: 11,
      latestCrunch: 11,
      averageCrunch: 11,
      crunchByProject: {
        "Project B": 11,
      },
    });
  });

  it("should return default values when no projects have deadlines", () => {
    const projects: Project[] = [
      {
        ...mockProjects[0],
        deadline: undefined,
      },
      {
        ...mockProjects[1],
        deadline: undefined,
      },
    ];
    const endDate = new Date("2024-01-20");

    const result = calculateCrunchInfo(projects, endDate);

    expect(result).toEqual({
      earliestCrunch: 0,
      latestCrunch: 0,
      averageCrunch: 0,
      crunchByProject: {},
    });
  });
});
