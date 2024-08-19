import { optimizeTasks } from "../src/index";
import { checkDeadlineStatus } from "../src/utils/dateUtils";
import { calculateCrunchInfo } from "../src/utils/crunchUtils";
import {
  Project,
  Task,
  Milestone,
  Status,
  Goal,
  ObsidianProject,
} from "../src/types";
import * as optimizationService from "../src/services/optimizationService";
import * as simulationService from "../src/services/simulationService";

jest.mock("../src/services/optimizationService");
jest.mock("../src/services/simulationService");

// Move mock data to a more global scope
const mockGoal: Goal = {
  id: "test-goal-id",
  name: "Test Goal",
  projectIds: [],
  status: "In Progress" as Status,
  type: "goal",
};

const mockProjects: Project[] = [
  {
    id: "project-a-id",
    name: "Project A",
    deadline: new Date("2023-12-31"),
    deadlineType: "hard",
    excitement: 4,
    goalId: mockGoal.id,
    milestoneIds: [],
    status: "In Progress" as Status,
    viability: 3,
    type: "project",
  },
  {
    id: "project-b-id",
    name: "Project B",
    deadline: new Date("2024-01-31"),
    deadlineType: "soft",
    excitement: 3,
    goalId: mockGoal.id,
    milestoneIds: [],
    status: "Not Started" as Status,
    viability: 4,
    type: "project",
  },
];

const mockMilestones: Milestone[] = [
  {
    id: "milestone-a-id",
    name: "Milestone A",
    projectId: mockProjects[0].id,
    dependencyIds: [],
    status: "Not Started" as Status,
    taskIds: [],
    type: "milestone",
  },
  {
    id: "milestone-b-id",
    name: "Milestone B",
    projectId: mockProjects[1].id,
    dependencyIds: [],
    status: "Not Started" as Status,
    taskIds: [],
    type: "milestone",
  },
];

const mockTasks: Task[] = [
  {
    id: "task-1-id",
    name: "Task 1",
    duration: 5,
    timeSpent: 0,
    dependencyIds: [],
    status: "Not Started" as Status,
    completionDate: new Date("2023-12-30"),
    milestoneId: mockMilestones[0].id,
    type: "task",
  },
  {
    id: "task-2-id",
    name: "Task 2",
    duration: 3,
    timeSpent: 0,
    dependencyIds: [],
    status: "Not Started" as Status,
    completionDate: new Date("2024-02-01"),
    milestoneId: mockMilestones[1].id,
    type: "task",
  },
];

function convertToObsidianProject(project: Project): ObsidianProject {
  return {
    file: {
      path: `${project.name}.md`,
      folder: "Projects",
      name: project.name,
      link: { path: `${project.name}.md`, type: "file" },
      outlinks: { values: [], settings: {}, length: 0 },
      inlinks: { values: [], settings: {}, length: 0 },
      etags: { values: [], settings: {}, length: 0 },
      tags: { values: [], settings: {}, length: 0 },
      aliases: { values: [], settings: {}, length: 0 },
      lists: { values: [], settings: {}, length: 0 },
      tasks: { values: [], settings: {}, length: 0 },
      ctime: new Date().toISOString(),
      cday: new Date().toISOString(),
      mtime: new Date().toISOString(),
      mday: new Date().toISOString(),
      size: 0,
      starred: false,
      frontmatter: {},
      ext: ".md",
    },
    type: "project",
    status: project.status,
    deadline: project.deadline?.toISOString(),
    deadlineType: project.deadlineType,
    excitement: project.excitement,
    viability: project.viability,
    goal: project.goalId
      ? { path: `${project.goalId}.md`, type: "file" }
      : undefined,
  };
}

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
    const result = optimizeTasks({
      goals: { values: [], settings: {}, length: 0 },
      projects: {
        values: mockProjects.map(convertToObsidianProject),
        settings: {},
        length: mockProjects.length,
      },
      milestones: { values: [], settings: {}, length: 0 },
      tasks: { values: [], settings: {}, length: 0 },
    });

    expect(result).toHaveProperty("optimizedSequence");
    expect(result).toHaveProperty("statistics");
    expect(result).toHaveProperty("deadlineStatus");
    expect(result).toHaveProperty("crunchInfo");
  });

  it("should call optimizeSequence and simulateTaskSequence", () => {
    optimizeTasks({
      goals: { values: [], settings: {}, length: 0 },
      projects: {
        values: mockProjects.map(convertToObsidianProject),
        settings: {},
        length: mockProjects.length,
      },
      milestones: { values: [], settings: {}, length: 0 },
      tasks: { values: [], settings: {}, length: 0 },
    });

    expect(optimizationService.optimizeSequence).toHaveBeenCalledWith(
      mockProjects.map(convertToObsidianProject),
      mockMilestones,
      mockTasks
    );
    expect(simulationService.simulateTaskSequence).toHaveBeenCalledWith(
      mockTasks,
      mockProjects.map(convertToObsidianProject),
      mockMilestones
    );
  });

  it("should correctly check deadline status", () => {
    const result = optimizeTasks({
      goals: { values: [], settings: {}, length: 0 },
      projects: {
        values: mockProjects.map(convertToObsidianProject),
        settings: {},
        length: mockProjects.length,
      },
      milestones: { values: [], settings: {}, length: 0 },
      tasks: { values: [], settings: {}, length: 0 },
    });

    expect(result.deadlineStatus).toEqual({
      allHardDeadlinesMet: true,
      allSoftDeadlinesMet: false,
      missedHardDeadlines: [],
      missedSoftDeadlines: ["Project B: 2024-01-31T00:00:00.000Z"],
    });
  });

  it("should calculate crunch info", () => {
    const result = optimizeTasks({
      goals: { values: [], settings: {}, length: 0 },
      projects: {
        values: mockProjects.map(convertToObsidianProject),
        settings: {},
        length: mockProjects.length,
      },
      milestones: { values: [], settings: {}, length: 0 },
      tasks: { values: [], settings: {}, length: 0 },
    });

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
    const result = optimizeTasks({
      goals: { values: [], settings: {}, length: 0 },
      projects: {
        values: mockProjects.map(convertToObsidianProject),
        settings: {},
        length: mockProjects.length,
      },
      milestones: { values: [], settings: {}, length: 0 },
      tasks: { values: [], settings: {}, length: 0 },
    });

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

    const result = checkDeadlineStatus(completedTasks, mockProjects);

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

    const result = checkDeadlineStatus(completedTasks, mockProjects);

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
        milestoneId: undefined,
      },
    ];

    const result = checkDeadlineStatus(completedTasks, mockProjects);

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
