import {
  optimizeSequence,
  SimulationResult,
} from "../../src/services/optimizationService";
import { Project, Task, Milestone, Goal } from "../../src/types";
import { simulateTaskSequence } from "../../src/services/simulationService";

// Mock simulateTaskSequence
jest.mock("../../src/services/simulationService");

describe("optimizationService", () => {
  // Helper function to create mock tasks
  const createMockTask = (
    name: string,
    duration: number,
    dependencies: Task[] = [],
    goal?: Goal
  ): Task => ({
    name,
    duration,
    dependencies,
    status: "planned",
    timeSpent: 0,
    milestone: undefined,
    goal,
  });

  // Helper function to create mock projects
  const createMockProject = (
    name: string,
    deadline: Date,
    deadlineType: "hard" | "soft"
  ): Project => ({
    name,
    deadline,
    deadlineType,
    excitement: 3,
    viability: 4,
    status: "planned",
    goal: {} as Goal,
    milestones: () => [],
  });

  // Helper function to create mock goals
  const createMockGoal = (name: string): Goal => ({
    name,
    projects: () => [],
    status: "planned",
  });

  // Helper function to create mock milestones
  function createMockMilestone(name: string, project: Project): Milestone {
    return {
      name,
      project,
      dependencies: [],
      status: "planned",
      tasks: () => [],
    };
  }

  beforeEach(() => {
    // Reset mock before each test
    (simulateTaskSequence as jest.Mock).mockClear();
  });

  it("should return an optimized sequence of tasks", () => {
    const mockProject = createMockProject(
      "Test Project",
      new Date("2023-12-31"),
      "soft"
    );
    const mockMilestone: Milestone = {
      name: "Test Milestone",
      project: mockProject,
      dependencies: [],
      status: "planned",
      tasks: () => [],
    };

    const tasks = [
      { ...createMockTask("Task 1", 2), milestone: mockMilestone },
      { ...createMockTask("Task 2", 3), milestone: mockMilestone },
      { ...createMockTask("Task 3", 1), milestone: mockMilestone },
    ];

    mockProject.milestones = () => [mockMilestone];
    mockMilestone.tasks = () => tasks;

    const mockSimulationResult: SimulationResult = {
      score: 100,
      completedTasks: tasks,
      endDate: new Date("2023-12-15"),
    };

    (simulateTaskSequence as jest.Mock).mockReturnValue(mockSimulationResult);

    const result = optimizeSequence([mockProject]);

    expect(result).toEqual(tasks);
    expect(simulateTaskSequence).toHaveBeenCalledTimes(3); // Once for each strategy
  });

  it("should respect task dependencies", () => {
    const mockProject = createMockProject(
      "Test Project",
      new Date("2023-12-31"),
      "soft"
    );
    const mockMilestone: Milestone = {
      name: "Test Milestone",
      project: mockProject,
      dependencies: [],
      status: "planned",
      tasks: () => [],
    };

    const task1 = { ...createMockTask("Task 1", 2), milestone: mockMilestone };
    const task2 = {
      ...createMockTask("Task 2", 3, [task1]),
      milestone: mockMilestone,
    };
    const task3 = {
      ...createMockTask("Task 3", 1, [task2]),
      milestone: mockMilestone,
    };

    const tasks = [task1, task2, task3];

    mockProject.milestones = () => [mockMilestone];
    mockMilestone.tasks = () => tasks;

    const mockSimulationResult: SimulationResult = {
      score: 100,
      completedTasks: tasks,
      endDate: new Date("2023-12-15"),
    };

    (simulateTaskSequence as jest.Mock).mockReturnValue(mockSimulationResult);

    const result = optimizeSequence([mockProject]);

    expect(result[0]).toBe(task1);
    expect(result[1]).toBe(task2);
    expect(result[2]).toBe(task3);
  });

  it("should handle multiple projects", () => {
    const project1 = createMockProject(
      "Project 1",
      new Date("2023-12-31"),
      "soft"
    );
    const project2 = createMockProject(
      "Project 2",
      new Date("2024-01-31"),
      "hard"
    );

    const milestone1: Milestone = {
      name: "Milestone 1",
      project: project1,
      dependencies: [],
      status: "planned",
      tasks: () => [],
    };

    const milestone2: Milestone = {
      name: "Milestone 2",
      project: project2,
      dependencies: [],
      status: "planned",
      tasks: () => [],
    };

    const tasks1 = [
      { ...createMockTask("Task 1", 2), milestone: milestone1 },
      { ...createMockTask("Task 2", 3), milestone: milestone1 },
    ];

    const tasks2 = [
      { ...createMockTask("Task 3", 1), milestone: milestone2 },
      { ...createMockTask("Task 4", 4), milestone: milestone2 },
    ];

    project1.milestones = () => [milestone1];
    project2.milestones = () => [milestone2];
    milestone1.tasks = () => tasks1;
    milestone2.tasks = () => tasks2;

    const mockSimulationResult: SimulationResult = {
      score: 100,
      completedTasks: [...tasks1, ...tasks2],
      endDate: new Date("2024-01-15"),
    };

    (simulateTaskSequence as jest.Mock).mockReturnValue(mockSimulationResult);

    const result = optimizeSequence([project1, project2]);

    expect(result).toHaveLength(4);
    expect(result).toEqual(expect.arrayContaining([...tasks1, ...tasks2]));
  });

  it("should return the best sequence when multiple strategies are tried", () => {
    const mockProject = createMockProject(
      "Test Project",
      new Date("2023-12-31"),
      "soft"
    );
    const mockMilestone: Milestone = {
      name: "Test Milestone",
      project: mockProject,
      dependencies: [],
      status: "planned",
      tasks: () => [],
    };

    const tasks = [
      { ...createMockTask("Task 1", 2), milestone: mockMilestone },
      { ...createMockTask("Task 2", 3), milestone: mockMilestone },
      { ...createMockTask("Task 3", 1), milestone: mockMilestone },
    ];

    mockProject.milestones = () => [mockMilestone];
    mockMilestone.tasks = () => tasks;

    const mockSimulationResults: SimulationResult[] = [
      {
        score: 80,
        completedTasks: [tasks[0], tasks[1], tasks[2]],
        endDate: new Date("2023-12-15"),
      },
      {
        score: 100,
        completedTasks: [tasks[2], tasks[0], tasks[1]],
        endDate: new Date("2023-12-14"),
      },
      {
        score: 90,
        completedTasks: [tasks[1], tasks[2], tasks[0]],
        endDate: new Date("2023-12-16"),
      },
    ];

    (simulateTaskSequence as jest.Mock)
      .mockReturnValueOnce(mockSimulationResults[0])
      .mockReturnValueOnce(mockSimulationResults[1])
      .mockReturnValueOnce(mockSimulationResults[2]);

    const result = optimizeSequence([mockProject]);

    expect(result).toEqual([tasks[2], tasks[0], tasks[1]]);
    expect(simulateTaskSequence).toHaveBeenCalledTimes(3);
  });

  it("should handle multiple projects with different goals", () => {
    const createMockGoal = (name: string): Goal => ({
      name,
      projects: () => [],
      status: "planned",
    });

    const goal1 = createMockGoal("Goal 1");
    const goal2 = createMockGoal("Goal 2");

    const project1 = createMockProject(
      "Project 1",
      new Date("2023-12-31"),
      "soft"
    );
    project1.goal = goal1;
    const project2 = createMockProject(
      "Project 2",
      new Date("2024-01-31"),
      "hard"
    );
    project2.goal = goal2;

    const milestone1: Milestone = {
      name: "Milestone 1",
      project: project1,
      dependencies: [],
      status: "planned",
      tasks: () => [],
    };

    const milestone2: Milestone = {
      name: "Milestone 2",
      project: project2,
      dependencies: [],
      status: "planned",
      tasks: () => [],
    };

    const tasks1 = [
      { ...createMockTask("Task 1", 2), milestone: milestone1 },
      { ...createMockTask("Task 2", 3), milestone: milestone1 },
    ];

    const tasks2 = [
      { ...createMockTask("Task 3", 1), milestone: milestone2 },
      { ...createMockTask("Task 4", 4), milestone: milestone2 },
    ];

    project1.milestones = () => [milestone1];
    project2.milestones = () => [milestone2];
    milestone1.tasks = () => tasks1;
    milestone2.tasks = () => tasks2;

    const allTasks = [...tasks1, ...tasks2];

    (simulateTaskSequence as jest.Mock).mockImplementation((tasks) => ({
      score: 100,
      completedTasks: tasks,
      endDate: new Date("2024-01-15"),
    }));

    const result = optimizeSequence([project1, project2]);

    expect(result).toHaveLength(4);
    expect(result).toEqual(expect.arrayContaining(allTasks));

    // Check if tasks from different projects are interleaved
    const projectSequence = result.map((task) => task.milestone?.project.name);
    expect(projectSequence).not.toEqual([
      "Project 1",
      "Project 1",
      "Project 2",
      "Project 2",
    ]);
    expect(projectSequence).not.toEqual([
      "Project 2",
      "Project 2",
      "Project 1",
      "Project 1",
    ]);

    // Check if tasks from different goals are interleaved
    const goalSequence = result.map(
      (task) => task.milestone?.project.goal?.name
    );
    expect(goalSequence).not.toEqual(["Goal 1", "Goal 1", "Goal 2", "Goal 2"]);
    expect(goalSequence).not.toEqual(["Goal 2", "Goal 2", "Goal 1", "Goal 1"]);

    // Check that there's at least one alternation between projects and goals
    expect(
      projectSequence.some(
        (project, index) => index > 0 && project !== projectSequence[index - 1]
      )
    ).toBeTruthy();
    expect(
      goalSequence.some(
        (goal, index) => index > 0 && goal !== goalSequence[index - 1]
      )
    ).toBeTruthy();

    // Verify that simulateTaskSequence was called for each strategy
    expect(simulateTaskSequence).toHaveBeenCalledTimes(3);

    // Verify that tasks maintain their project and goal associations
    result.forEach((task) => {
      if (task.milestone?.project === project1) {
        expect(task.milestone.project.goal).toBe(goal1);
      } else if (task.milestone?.project === project2) {
        expect(task.milestone.project.goal).toBe(goal2);
      } else {
        fail("Task associated with unknown project");
      }
    });
  });

  it("should handle complex scenarios with multiple projects and overlapping goals", () => {
    const createMockGoal = (name: string): Goal => ({
      name,
      projects: () => [],
      status: "planned",
    });

    const goal1 = createMockGoal("Goal 1");
    const goal2 = createMockGoal("Goal 2");
    const goal3 = createMockGoal("Goal 3");

    const project1 = createMockProject(
      "Project 1",
      new Date("2023-12-31"),
      "soft"
    );
    const project2 = createMockProject(
      "Project 2",
      new Date("2024-01-31"),
      "hard"
    );
    const project3 = createMockProject(
      "Project 3",
      new Date("2024-02-28"),
      "soft"
    );

    project1.goal = goal1;
    project2.goal = goal2;
    project3.goal = goal3;

    const milestone1 = createMockMilestone("Milestone 1", project1);
    const milestone2 = createMockMilestone("Milestone 2", project2);
    const milestone3 = createMockMilestone("Milestone 3", project3);
    const milestone4 = createMockMilestone("Milestone 4", project1); // Additional milestone for project1

    const tasks = [
      { ...createMockTask("Task 1", 2, [], goal1), milestone: milestone1 },
      { ...createMockTask("Task 2", 3, [], goal2), milestone: milestone2 },
      { ...createMockTask("Task 3", 1, [], goal3), milestone: milestone3 },
      { ...createMockTask("Task 4", 4, [], goal2), milestone: milestone1 }, // Task in project1 but contributes to goal2
      { ...createMockTask("Task 5", 2, [], goal1), milestone: milestone2 }, // Task in project2 but contributes to goal1
      { ...createMockTask("Task 6", 3, [], goal3), milestone: milestone4 }, // Task in project1 but contributes to goal3
    ];

    project1.milestones = () => [milestone1, milestone4];
    project2.milestones = () => [milestone2];
    project3.milestones = () => [milestone3];

    milestone1.tasks = () => [tasks[0], tasks[3]];
    milestone2.tasks = () => [tasks[1], tasks[4]];
    milestone3.tasks = () => [tasks[2]];
    milestone4.tasks = () => [tasks[5]];

    (simulateTaskSequence as jest.Mock).mockImplementation((tasks) => ({
      score: 100,
      completedTasks: tasks,
      endDate: new Date("2024-03-15"),
    }));

    const result = optimizeSequence([project1, project2, project3]);

    expect(result).toHaveLength(6);
    expect(result).toEqual(expect.arrayContaining(tasks));

    const projectSequence = result.map((task) => task.milestone?.project.name);
    const goalSequence = result.map((task) => task.goal?.name);

    // Check if tasks from different projects are interleaved
    expect(new Set(projectSequence.slice(0, 3)).size).toBeGreaterThan(1);
    expect(new Set(projectSequence.slice(-3)).size).toBeGreaterThan(1);

    // Check if tasks from different goals are interleaved
    expect(new Set(goalSequence.slice(0, 3)).size).toBeGreaterThan(1);
    expect(new Set(goalSequence.slice(-3)).size).toBeGreaterThan(1);

    // Check that there's at least one alternation between projects and goals
    expect(
      projectSequence.some(
        (project, index) => index > 0 && project !== projectSequence[index - 1]
      )
    ).toBeTruthy();
    expect(
      goalSequence.some(
        (goal, index) => index > 0 && goal !== goalSequence[index - 1]
      )
    ).toBeTruthy();

    // Verify that tasks maintain their correct associations
    result.forEach((task) => {
      expect(task.milestone?.project).toBeDefined();
      expect(task.goal).toBeDefined();
    });

    // Verify that simulateTaskSequence was called for each strategy
    expect(simulateTaskSequence).toHaveBeenCalledTimes(3);
  });
});
