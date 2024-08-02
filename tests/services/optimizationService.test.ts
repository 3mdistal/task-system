import { optimizeSequence } from "../../src/services/optimizationService";
import type { Goal, Project, Task, Milestone } from "../../src/types";
import * as simulationService from "../../src/services/simulationService";

jest.mock("../../src/services/simulationService");

describe("optimizeSequence", () => {
  // Mock implementation of simulateTaskSequence
  const mockSimulateTaskSequence =
    simulationService.simulateTaskSequence as jest.MockedFunction<
      typeof simulationService.simulateTaskSequence
    >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return an empty array when given no projects", () => {
    const result = optimizeSequence([]);
    expect(result).toEqual([]);
  });

  it("should return the optimal sequence for a single project with one task", () => {
    const task: Task = {
      name: "Task 1",
      duration: 1,
      timeSpent: 0,
      dependencies: [],
      status: "planned",
    };
    const milestone: Milestone = {
      name: "Milestone 1",
      tasks: () => [task],
      dependencies: [],
      project: {} as Project,
      status: "planned",
    };
    const project: Project = {
      name: "Project 1",
      milestones: () => [milestone],
      excitement: 1,
      viability: 1,
      goal: {} as Goal,
      status: "planned",
    };

    mockSimulateTaskSequence.mockReturnValue({
      score: 10,
      completedTasks: [task],
      endDate: new Date(),
    });

    const result = optimizeSequence([project]);
    expect(result).toEqual([task]);
    expect(mockSimulateTaskSequence).toHaveBeenCalledTimes(1);
  });

  it("should return the optimal sequence for multiple projects", () => {
    const task1: Task = {
      name: "Task 1",
      duration: 1,
      timeSpent: 0,
      dependencies: [],
      status: "planned",
    };
    const task2: Task = {
      name: "Task 2",
      duration: 2,
      timeSpent: 0,
      dependencies: [],
      status: "planned",
    };
    const task3: Task = {
      name: "Task 3",
      duration: 3,
      timeSpent: 0,
      dependencies: [],
      status: "planned",
    };

    const milestone1: Milestone = {
      name: "Milestone 1",
      tasks: () => [task1],
      dependencies: [],
      project: {} as Project,
      status: "planned",
    };
    const milestone2: Milestone = {
      name: "Milestone 2",
      tasks: () => [task2, task3],
      dependencies: [],
      project: {} as Project,
      status: "planned",
    };

    const project1: Project = {
      name: "Project 1",
      milestones: () => [milestone1],
      excitement: 1,
      viability: 1,
      goal: {} as Goal,
      status: "planned",
    };
    const project2: Project = {
      name: "Project 2",
      milestones: () => [milestone2],
      excitement: 1,
      viability: 1,
      goal: {} as Goal,
      status: "planned",
    };

    mockSimulateTaskSequence.mockImplementation((sequence) => {
      // Simulate different scores based on the sequence
      if (
        sequence[0] === task2 &&
        sequence[1] === task1 &&
        sequence[2] === task3
      ) {
        return { score: 100, completedTasks: sequence, endDate: new Date() };
      }
      return { score: 50, completedTasks: sequence, endDate: new Date() };
    });

    const result = optimizeSequence([project1, project2]);
    expect(result).toEqual([task2, task1, task3]);
    expect(mockSimulateTaskSequence).toHaveBeenCalledTimes(6); // 3! permutations
  });

  it("should handle projects with no tasks", () => {
    const emptyProject: Project = {
      name: "Empty Project",
      milestones: () => [],
      excitement: 1,
      viability: 1,
      goal: {} as Goal,
      status: "planned",
    };
    const task: Task = {
      name: "Task 1",
      duration: 1,
      timeSpent: 0,
      dependencies: [],
      status: "planned",
    };
    const milestone: Milestone = {
      name: "Milestone 1",
      tasks: () => [task],
      dependencies: [],
      project: {} as Project,
      status: "planned",
    };
    const nonEmptyProject: Project = {
      name: "Non-Empty Project",
      milestones: () => [milestone],
      excitement: 1,
      viability: 1,
      goal: {} as Goal,
      status: "planned",
    };

    mockSimulateTaskSequence.mockReturnValue({
      score: 10,
      completedTasks: [task],
      endDate: new Date(),
    });

    const result = optimizeSequence([emptyProject, nonEmptyProject]);
    expect(result).toEqual([task]);
    expect(mockSimulateTaskSequence).toHaveBeenCalledTimes(1);
  });

  it("should return the sequence with the highest score", () => {
    const task1: Task = {
      name: "Task 1",
      duration: 1,
      timeSpent: 0,
      dependencies: [],
      status: "planned",
    };
    const task2: Task = {
      name: "Task 2",
      duration: 2,
      timeSpent: 0,
      dependencies: [],
      status: "planned",
    };
    const milestone: Milestone = {
      name: "Milestone 1",
      tasks: () => [task1, task2],
      dependencies: [],
      project: {} as Project,
      status: "planned",
    };
    const project: Project = {
      name: "Project 1",
      milestones: () => [milestone],
      excitement: 1,
      viability: 1,
      goal: {} as Goal,
      status: "planned",
    };

    mockSimulateTaskSequence
      .mockReturnValueOnce({
        score: 50,
        completedTasks: [task1, task2],
        endDate: new Date(),
      })
      .mockReturnValueOnce({
        score: 100,
        completedTasks: [task2, task1],
        endDate: new Date(),
      });

    const result = optimizeSequence([project]);
    expect(result).toEqual([task2, task1]);
    expect(mockSimulateTaskSequence).toHaveBeenCalledTimes(2);
  });
});
