import { simulateTaskSequence } from "../../src/services/simulationService";
import { Goal, Milestone, Project, Task } from "../../src/types";
import { addDays } from "../../src/utils/dateUtils";

describe("simulationService", () => {
  const mockGoal: Goal = {
    id: "goal1",
    name: "Test Goal",
    projectIds: ["project1"],
    status: "planned",
    type: "goal",
  };

  const mockProject: Project = {
    id: "project1",
    name: "Test Project",
    deadline: new Date("2024-12-31"),
    deadlineType: "soft",
    excitement: 3,
    viability: 4,
    goalId: "goal1",
    milestoneIds: ["milestone1"],
    status: "planned",
    type: "project",
  };

  const mockMilestone: Milestone = {
    id: "milestone1",
    name: "Test Milestone",
    projectId: "project1",
    dependencyIds: [],
    status: "planned",
    taskIds: [],
    type: "milestone",
  };

  const createMockTask = (
    name: string,
    duration: number,
    dependencies: Task[] = []
  ): Task => ({
    id: `task-${name}`,
    name,
    duration,
    timeSpent: 0,
    status: "planned",
    milestoneId: "milestone1",
    dependencyIds: dependencies.map((d) => d.id),
    type: "task",
  });

  it("should simulate a simple sequence of tasks", () => {
    const tasks = [
      createMockTask("Task 1", 5),
      createMockTask("Task 2", 3),
      createMockTask("Task 3", 4),
    ];

    const result = simulateTaskSequence(
      tasks,
      [mockProject],
      [mockGoal],
      [mockMilestone]
    );

    console.log(
      "Completed tasks:",
      result.completedTasks.map((t) => t.name)
    );
    console.log(
      "Completion dates:",
      result.completedTasks.map((t) => t.completionDate)
    );
    expect(result.completedTasks).toHaveLength(3);
    expect(result.score).toBeGreaterThan(0);
    expect(result.endDate).toBeInstanceOf(Date);
  });

  it("should respect task dependencies", () => {
    const task1 = createMockTask("Task 1", 5);
    const task2 = createMockTask("Task 2", 3, [task1]);
    const task3 = createMockTask("Task 3", 4, [task2]);

    const result = simulateTaskSequence(
      [task3, task2, task1],
      [mockProject],
      [mockGoal],
      [mockMilestone]
    );

    console.log(
      "Completed tasks:",
      result.completedTasks.map((t) => t.name)
    );
    console.log(
      "Completion dates:",
      result.completedTasks.map((t) => t.completionDate)
    );
    expect(result.completedTasks).toHaveLength(3);
    expect(result.completedTasks[0].name).toBe("Task 1");
    expect(result.completedTasks[1].name).toBe("Task 2");
    expect(result.completedTasks[2].name).toBe("Task 3");
  });

  it("should handle tasks that exceed project deadline", () => {
    const { date: projectDeadline } = addDays(10, new Date());
    const mockProjectWithDeadline: Project = {
      ...mockProject,
      deadline: projectDeadline,
    };
    const mockMilestoneWithDeadline: Milestone = {
      ...mockMilestone,
      projectId: mockProjectWithDeadline.id,
    };

    const createMockTaskWithDeadline = (
      name: string,
      duration: number
    ): Task => ({
      ...createMockTask(name, duration),
      milestoneId: mockMilestoneWithDeadline.id,
    });

    const tasks = [
      createMockTaskWithDeadline("Task 1", 5),
      createMockTaskWithDeadline("Task 2", 4),
      createMockTaskWithDeadline("Task 3", 3),
    ];

    const result = simulateTaskSequence(
      tasks,
      [mockProjectWithDeadline],
      [mockGoal],
      [mockMilestoneWithDeadline]
    );

    console.log(
      "Completed tasks:",
      result.completedTasks.map((t) => t.name)
    );
    console.log(
      "Completion dates:",
      result.completedTasks.map((t) => t.completionDate)
    );
    expect(result.completedTasks.length).toBeGreaterThan(0);
    expect(result.completedTasks.length).toBeLessThanOrEqual(3);
    expect(
      result.completedTasks[
        result.completedTasks.length - 1
      ].completionDate!.getTime()
    ).toBeGreaterThanOrEqual(projectDeadline.getTime());
  });

  it("should calculate correct score based on task completion", () => {
    const task1 = createMockTask("Task 1", 2);
    const task2: Task = {
      ...createMockTask("Task 2", 3),
      status: "in-flight",
    };

    const result = simulateTaskSequence(
      [task1, task2],
      [mockProject],
      [mockGoal],
      [mockMilestone]
    );

    expect(result.score).toBeGreaterThan(0);
    // The in-flight task should contribute more to the score
    const milestone = mockMilestone;
    const project = mockProject;
    expect(result.score).toBeGreaterThan(
      project.excitement * 20 + project.viability * 20
    );
  });
});
