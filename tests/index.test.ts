import { optimizeTasks } from "../src/index";
import {
  Project,
  Task,
  Milestone,
  Status,
  Goal,
  ObsidianDataViewData,
} from "../src/types";

describe("optimizeTasks", () => {
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
      milestoneIds: ["milestone-a-id"],
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
      milestoneIds: ["milestone-b-id"],
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

  it("should correctly check deadline status", () => {
    const mockConvertData = jest.fn().mockReturnValue({
      projects: mockProjects,
      goals: [mockGoal],
      milestones: mockMilestones,
      tasks: mockTasks,
    });

    const mockOptimize = jest.fn().mockReturnValue(mockTasks);

    const mockSimulate = jest.fn().mockReturnValue({
      score: 100,
      completedTasks: mockTasks,
      endDate: new Date("2024-02-01"),
    });

    const result = optimizeTasks(
      {} as ObsidianDataViewData,
      mockConvertData,
      mockOptimize,
      mockSimulate
    );

    expect(result.deadlineStatus).toEqual({
      allHardDeadlinesMet: true,
      allSoftDeadlinesMet: false,
      missedHardDeadlines: [],
      missedSoftDeadlines: ["Project B: 2024-01-31T00:00:00.000Z"],
    });
  });
});
