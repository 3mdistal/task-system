import { simulateTaskSequence } from "../../src/services/simulationService";
import { Task, Project, Milestone } from "../../src/types";
import { addDays } from "../../src/utils/dateUtils";

describe("simulationService", () => {
  const mockProject: Project = {
    name: "Test Project",
    deadline: new Date("2024-12-31"),
    deadlineType: "soft",
    excitement: 3,
    viability: 4,
    goal: { name: "Test Goal", projects: () => [], status: "planned" },
    milestones: () => [],
    status: "planned",
  };

  const mockMilestone: Milestone = {
    name: "Test Milestone",
    project: mockProject,
    status: "planned",
    dependencies: [],
    tasks: () => [],
  };

  const createMockTask = (
    name: string,
    duration: number,
    dependencies: Task[] = []
  ): Task => ({
    name,
    duration,
    timeSpent: 0,
    status: "planned",
    milestone: mockMilestone,
    dependencies,
  });

  it("should simulate a simple sequence of tasks", () => {
    const tasks = [
      createMockTask("Task 1", 5),
      createMockTask("Task 2", 3),
      createMockTask("Task 3", 4),
    ];

    const result = simulateTaskSequence(tasks);

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

    const result = simulateTaskSequence([task3, task2, task1]);

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
      project: mockProjectWithDeadline,
    };

    const createMockTaskWithDeadline = (name: string, duration: number) => ({
      ...createMockTask(name, duration),
      milestone: mockMilestoneWithDeadline,
    });

    const tasks = [
      createMockTaskWithDeadline("Task 1", 5),
      createMockTaskWithDeadline("Task 2", 4),
      createMockTaskWithDeadline("Task 3", 3),
    ];

    const result = simulateTaskSequence(tasks);

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
    const task2 = {
      ...createMockTask("Task 2", 3),
      status: "in-flight" as const,
    };

    const result = simulateTaskSequence([task1, task2]);

    expect(result.score).toBeGreaterThan(0);
    // The in-flight task should contribute more to the score
    expect(result.score).toBeGreaterThan(
      result.completedTasks[0].milestone!.project.excitement * 20 +
        result.completedTasks[0].milestone!.project.viability * 20
    );
  });
});
