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
    dependencyIds: string[] = [],
    goalId?: string
  ): Task => ({
    id: Math.random().toString(36).substr(2, 9),
    name,
    duration,
    dependencyIds,
    status: "planned",
    timeSpent: 0,
    milestoneId: undefined,
    goalId,
    type: "task",
  });

  // Helper function to create mock projects
  const createMockProject = (
    name: string,
    deadline: Date,
    deadlineType: "hard" | "soft"
  ): Project => ({
    id: Math.random().toString(36).substr(2, 9),
    name,
    deadline,
    deadlineType,
    excitement: 3,
    viability: 4,
    status: "planned",
    goalId: undefined,
    milestoneIds: [],
    type: "project",
  });

  // Helper function to create mock goals
  const createMockGoal = (name: string): Goal => ({
    id: Math.random().toString(36).substr(2, 9),
    name,
    projectIds: [],
    status: "planned",
    type: "goal",
  });

  // Helper function to create mock milestones
  function createMockMilestone(name: string, projectId: string): Milestone {
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      projectId,
      dependencyIds: [],
      status: "planned",
      taskIds: [],
      type: "milestone",
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
      id: Math.random().toString(36).substr(2, 9),
      name: "Test Milestone",
      projectId: mockProject.id,
      dependencyIds: [],
      status: "planned",
      taskIds: [],
      type: "milestone",
    };

    const tasks = [
      { ...createMockTask("Task 1", 2), milestoneId: mockMilestone.id },
      { ...createMockTask("Task 2", 3), milestoneId: mockMilestone.id },
      { ...createMockTask("Task 3", 1), milestoneId: mockMilestone.id },
    ];

    mockProject.milestoneIds = [mockMilestone.id];
    mockMilestone.taskIds = tasks.map((t) => t.id);

    const mockSimulationResult: SimulationResult = {
      score: 100,
      completedTasks: tasks,
      endDate: new Date("2023-12-15"),
    };

    (simulateTaskSequence as jest.Mock).mockReturnValue(mockSimulationResult);

    const result = optimizeSequence([mockProject], [], [mockMilestone], tasks);

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
      id: Math.random().toString(36).substr(2, 9),
      name: "Test Milestone",
      projectId: mockProject.id,
      dependencyIds: [],
      status: "planned",
      taskIds: [],
      type: "milestone",
    };

    const task1 = {
      ...createMockTask("Task 1", 2),
      milestoneId: mockMilestone.id,
    };
    const task2 = {
      ...createMockTask("Task 2", 3, [task1.id]),
      milestoneId: mockMilestone.id,
    };
    const task3 = {
      ...createMockTask("Task 3", 1, [task2.id]),
      milestoneId: mockMilestone.id,
    };

    const tasks = [task1, task2, task3];

    mockProject.milestoneIds = [mockMilestone.id];
    mockMilestone.taskIds = tasks.map((t) => t.id);

    const mockSimulationResult: SimulationResult = {
      score: 100,
      completedTasks: tasks,
      endDate: new Date("2023-12-15"),
    };

    (simulateTaskSequence as jest.Mock).mockReturnValue(mockSimulationResult);

    const result = optimizeSequence([mockProject], [], [mockMilestone], tasks);

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
      id: Math.random().toString(36).substr(2, 9),
      name: "Milestone 1",
      projectId: project1.id,
      dependencyIds: [],
      status: "planned",
      taskIds: [],
      type: "milestone",
    };

    const milestone2: Milestone = {
      id: Math.random().toString(36).substr(2, 9),
      name: "Milestone 2",
      projectId: project2.id,
      dependencyIds: [],
      status: "planned",
      taskIds: [],
      type: "milestone",
    };

    const tasks1 = [
      { ...createMockTask("Task 1", 2), milestoneId: milestone1.id },
      { ...createMockTask("Task 2", 3), milestoneId: milestone1.id },
    ];

    const tasks2 = [
      { ...createMockTask("Task 3", 1), milestoneId: milestone2.id },
      { ...createMockTask("Task 4", 4), milestoneId: milestone2.id },
    ];

    project1.milestoneIds = [milestone1.id];
    project2.milestoneIds = [milestone2.id];
    milestone1.taskIds = tasks1.map((t) => t.id);
    milestone2.taskIds = tasks2.map((t) => t.id);

    const mockSimulationResult: SimulationResult = {
      score: 100,
      completedTasks: [...tasks1, ...tasks2],
      endDate: new Date("2024-01-15"),
    };

    (simulateTaskSequence as jest.Mock).mockReturnValue(mockSimulationResult);

    const result = optimizeSequence(
      [project1, project2],
      [],
      [milestone1, milestone2],
      [...tasks1, ...tasks2]
    );

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
      id: Math.random().toString(36).substr(2, 9),
      name: "Test Milestone",
      projectId: mockProject.id,
      dependencyIds: [],
      status: "planned",
      taskIds: [],
      type: "milestone",
    };

    const tasks = [
      { ...createMockTask("Task 1", 2), milestoneId: mockMilestone.id },
      { ...createMockTask("Task 2", 3), milestoneId: mockMilestone.id },
      { ...createMockTask("Task 3", 1), milestoneId: mockMilestone.id },
    ];

    mockProject.milestoneIds = [mockMilestone.id];
    mockMilestone.taskIds = tasks.map((t) => t.id);

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

    const result = optimizeSequence([mockProject], [], [mockMilestone], tasks);

    expect(result).toEqual([tasks[2], tasks[0], tasks[1]]);
    expect(simulateTaskSequence).toHaveBeenCalledTimes(3);
  });

  it("should handle multiple projects with different goals", () => {
    const goal1 = createMockGoal("Goal 1");
    const goal2 = createMockGoal("Goal 2");

    const project1 = createMockProject(
      "Project 1",
      new Date("2023-12-31"),
      "soft"
    );
    project1.goalId = goal1.id;
    const project2 = createMockProject(
      "Project 2",
      new Date("2024-01-31"),
      "hard"
    );
    project2.goalId = goal2.id;

    const milestone1 = createMockMilestone("Milestone 1", project1.id);
    const milestone2 = createMockMilestone("Milestone 2", project2.id);

    const tasks1 = [
      { ...createMockTask("Task 1", 2), milestoneId: milestone1.id },
      { ...createMockTask("Task 2", 3), milestoneId: milestone1.id },
    ];

    const tasks2 = [
      { ...createMockTask("Task 3", 1), milestoneId: milestone2.id },
      { ...createMockTask("Task 4", 4), milestoneId: milestone2.id },
    ];

    project1.milestoneIds = [milestone1.id];
    project2.milestoneIds = [milestone2.id];
    milestone1.taskIds = tasks1.map((t) => t.id);
    milestone2.taskIds = tasks2.map((t) => t.id);

    const allTasks = [...tasks1, ...tasks2];

    (simulateTaskSequence as jest.Mock).mockImplementation((tasks) => ({
      score: 100,
      completedTasks: tasks,
      endDate: new Date("2024-01-15"),
    }));

    const result = optimizeSequence(
      [project1, project2],
      [goal1, goal2],
      [milestone1, milestone2],
      allTasks
    );

    expect(result).toHaveLength(4);
    expect(result).toEqual(expect.arrayContaining(allTasks));

    // Update the assertions to use the correct properties
    const projectSequence = result.map((task) => {
      const milestone = [milestone1, milestone2].find(
        (m) => m.id === task.milestoneId
      );
      return milestone
        ? [project1, project2].find((p) => p.id === milestone.projectId)?.name
        : undefined;
    });

    const goalSequence = result.map((task) => {
      const milestone = [milestone1, milestone2].find(
        (m) => m.id === task.milestoneId
      );
      const project = milestone
        ? [project1, project2].find((p) => p.id === milestone.projectId)
        : undefined;
      return project
        ? [goal1, goal2].find((g) => g.id === project.goalId)?.name
        : undefined;
    });

    // Check if tasks from different projects are interleaved
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
      const milestone = [milestone1, milestone2].find(
        (m) => m.id === task.milestoneId
      );
      const project = milestone
        ? [project1, project2].find((p) => p.id === milestone.projectId)
        : undefined;
      if (milestone?.projectId === project1.id) {
        expect(project?.goalId).toBe(goal1.id);
      } else if (milestone?.projectId === project2.id) {
        expect(project?.goalId).toBe(goal2.id);
      } else {
        fail("Task associated with unknown project");
      }
    });
  });

  it("should handle complex scenarios with multiple projects and overlapping goals", () => {
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

    project1.goalId = goal1.id;
    project2.goalId = goal2.id;
    project3.goalId = goal3.id;

    const milestone1 = createMockMilestone("Milestone 1", project1.id);
    const milestone2 = createMockMilestone("Milestone 2", project2.id);
    const milestone3 = createMockMilestone("Milestone 3", project3.id);
    const milestone4 = createMockMilestone("Milestone 4", project1.id); // Additional milestone for project1

    const tasks = [
      {
        ...createMockTask("Task 1", 2, [], goal1.id),
        milestoneId: milestone1.id,
      },
      {
        ...createMockTask("Task 2", 3, [], goal2.id),
        milestoneId: milestone2.id,
      },
      {
        ...createMockTask("Task 3", 1, [], goal3.id),
        milestoneId: milestone3.id,
      },
      {
        ...createMockTask("Task 4", 4, [], goal2.id),
        milestoneId: milestone1.id,
      }, // Task in project1 but contributes to goal2
      {
        ...createMockTask("Task 5", 2, [], goal1.id),
        milestoneId: milestone2.id,
      }, // Task in project2 but contributes to goal1
      {
        ...createMockTask("Task 6", 3, [], goal3.id),
        milestoneId: milestone4.id,
      }, // Task in project1 but contributes to goal3
    ];

    project1.milestoneIds = [milestone1.id, milestone4.id];
    project2.milestoneIds = [milestone2.id];
    project3.milestoneIds = [milestone3.id];

    milestone1.taskIds = [tasks[0].id, tasks[3].id];
    milestone2.taskIds = [tasks[1].id, tasks[4].id];
    milestone3.taskIds = [tasks[2].id];
    milestone4.taskIds = [tasks[5].id];

    (simulateTaskSequence as jest.Mock).mockImplementation((tasks) => ({
      score: 100,
      completedTasks: tasks,
      endDate: new Date("2024-03-15"),
    }));

    const result = optimizeSequence(
      [project1, project2, project3],
      [goal1, goal2, goal3],
      [milestone1, milestone2, milestone3, milestone4],
      tasks
    );

    expect(result).toHaveLength(6);
    expect(result).toEqual(expect.arrayContaining(tasks));

    const projectSequence = result.map((task) => {
      const milestone = [milestone1, milestone2, milestone3, milestone4].find(
        (m) => m.id === task.milestoneId
      );
      return milestone
        ? [project1, project2, project3].find(
            (p) => p.id === milestone.projectId
          )?.name
        : undefined;
    });
    const goalSequence = result.map((task) => {
      const milestone = [milestone1, milestone2, milestone3, milestone4].find(
        (m) => m.id === task.milestoneId
      );
      const project = milestone
        ? [project1, project2, project3].find(
            (p) => p.id === milestone.projectId
          )
        : undefined;
      return project
        ? [goal1, goal2, goal3].find((g) => g.id === project.goalId)?.name
        : undefined;
    });

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
      expect(task.milestoneId).toBeDefined();
      const milestone = [milestone1, milestone2, milestone3, milestone4].find(
        (m) => m.id === task.milestoneId
      );
      const project = milestone
        ? [project1, project2, project3].find(
            (p) => p.id === milestone.projectId
          )
        : undefined;
      expect(project?.goalId).toBeDefined();
    });

    // Verify that simulateTaskSequence was called for each strategy
    expect(simulateTaskSequence).toHaveBeenCalledTimes(3);
  });
});
