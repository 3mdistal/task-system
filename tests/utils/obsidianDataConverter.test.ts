import { convertObsidianData } from "../../src/utils/obsidian/obsidianDataConverter";
import rawData from "../../src/data/rawData.json";
import {
  isGoal,
  isProject,
  isMilestone,
  isTask,
} from "../../src/utils/typeGuards";
import { ObsidianDataViewData } from "../../src/types/Obsidian";
import {
  ensureValidStatus,
  ensureValidExcitement,
  ensureValidViability,
} from "../../src/utils/obsidian/obsidianHelpers";

describe("obsidianDataConverter", () => {
  const convertedData = convertObsidianData(rawData as ObsidianDataViewData);

  test("converts raw data to the correct structure", () => {
    expect(convertedData).toHaveProperty("goals");
    expect(convertedData).toHaveProperty("projects");
    expect(convertedData).toHaveProperty("milestones");
    expect(convertedData).toHaveProperty("tasks");
  });

  test("converts goals correctly", () => {
    const { goals } = convertedData;
    expect(goals.length).toBeGreaterThan(0);
    goals.forEach((goal) => {
      expect(isGoal(goal)).toBe(true);
      expect(goal).toHaveProperty("id");
      expect(goal).toHaveProperty("name");
      expect(goal).toHaveProperty("projectIds");
      expect(goal).toHaveProperty("status");
      expect(goal.type).toBe("goal");
    });
  });

  test("converts projects correctly", () => {
    const { projects } = convertedData;
    expect(projects.length).toBeGreaterThan(0);
    projects.forEach((project) => {
      expect(isProject(project)).toBe(true);
      expect(project).toHaveProperty("id");
      expect(project).toHaveProperty("name");
      expect(project).toHaveProperty("deadline");
      expect(project).toHaveProperty("deadlineType");
      expect(project).toHaveProperty("excitement");
      expect(project).toHaveProperty("viability");
      expect(project).toHaveProperty("status");
      expect(project).toHaveProperty("milestoneIds");
      expect(project).toHaveProperty("goalId");
      expect(project.type).toBe("project");
    });
  });

  test("converts milestones correctly", () => {
    const { milestones } = convertedData;
    expect(milestones.length).toBeGreaterThan(0);
    milestones.forEach((milestone) => {
      expect(isMilestone(milestone)).toBe(true);
      expect(milestone).toHaveProperty("id");
      expect(milestone).toHaveProperty("name");
      expect(milestone).toHaveProperty("projectId");
      expect(milestone).toHaveProperty("dependencyIds");
      expect(milestone).toHaveProperty("status");
      expect(milestone).toHaveProperty("taskIds");
      expect(milestone.type).toBe("milestone");
    });
  });

  test("converts tasks correctly", () => {
    const { tasks } = convertedData;
    expect(tasks.length).toBeGreaterThan(0);
    tasks.forEach((task) => {
      expect(isTask(task)).toBe(true);
      expect(task).toHaveProperty("id");
      expect(task).toHaveProperty("name");
      expect(task).toHaveProperty("status");
      expect(task).toHaveProperty("completionDate");
      expect(task).toHaveProperty("dependencyIds");
      expect(task).toHaveProperty("duration");
      expect(task).toHaveProperty("timeSpent");
      expect(task).toHaveProperty("milestoneId");
      expect(task.type).toBe("task");
    });
  });

  test("Entities are correctly linked and invalid references are removed", () => {
    const { goals, projects, milestones, tasks } = convertedData;

    projects.forEach((project) => {
      if (project.goalId) {
        const linkedGoal = goals.find((g) => g.id === project.goalId);
        expect(linkedGoal).toBeDefined();
        expect(linkedGoal!.projectIds).toContain(project.id);
      }
    });

    milestones.forEach((milestone) => {
      if (milestone.projectId) {
        const linkedProject = projects.find(
          (p) => p.id === milestone.projectId
        );
        expect(linkedProject).toBeDefined();
        expect(linkedProject!.milestoneIds).toContain(milestone.id);
      }
      milestone.dependencyIds.forEach((depId) => {
        expect(milestones.some((m) => m.id === depId)).toBe(true);
      });
    });

    tasks.forEach((task) => {
      if (task.milestoneId) {
        const linkedMilestone = milestones.find(
          (m) => m.id === task.milestoneId
        );
        expect(linkedMilestone).toBeDefined();
        expect(linkedMilestone!.taskIds).toContain(task.id);
      }
      task.dependencyIds.forEach((depId) => {
        expect(tasks.some((t) => t.id === depId)).toBe(true);
      });
    });
  });

  test("links milestones to projects correctly", () => {
    const { projects, milestones } = convertedData;
    milestones.forEach((milestone) => {
      if (milestone.projectId) {
        const linkedProject = projects.find(
          (p) => p.id === milestone.projectId
        );
        expect(linkedProject).toBeDefined();
        expect(linkedProject!.milestoneIds).toContain(milestone.id);
      }
    });
  });

  test("links tasks to milestones correctly", () => {
    const { milestones, tasks } = convertedData;
    tasks.forEach((task) => {
      if (task.milestoneId) {
        const linkedMilestone = milestones.find(
          (m) => m.id === task.milestoneId
        );
        expect(linkedMilestone).toBeDefined();
        expect(linkedMilestone!.taskIds).toContain(task.id);
      }
    });
  });
});

describe("obsidianHelpers", () => {
  test("ensureValidStatus returns valid status", () => {
    expect(ensureValidStatus("raw")).toBe("raw");
    expect(ensureValidStatus("backlog")).toBe("backlog");
    expect(ensureValidStatus("planned")).toBe("planned");
    expect(ensureValidStatus("in-flight")).toBe("in-flight");
    expect(ensureValidStatus("complete")).toBe("complete");
    expect(ensureValidStatus("archived")).toBe("archived");
    expect(ensureValidStatus("invalid")).toBe("backlog");
    expect(ensureValidStatus(undefined)).toBe("backlog");
  });

  test("ensureValidExcitement returns valid excitement", () => {
    expect(ensureValidExcitement(1)).toBe(1);
    expect(ensureValidExcitement(3)).toBe(3);
    expect(ensureValidExcitement(5)).toBe(5);
    expect(ensureValidExcitement(0)).toBe(3);
    expect(ensureValidExcitement(6)).toBe(3);
    expect(ensureValidExcitement("invalid")).toBe(3);
    expect(ensureValidExcitement(undefined)).toBe(3);
  });

  test("ensureValidViability returns valid viability", () => {
    expect(ensureValidViability(1)).toBe(1);
    expect(ensureValidViability(3)).toBe(3);
    expect(ensureValidViability(5)).toBe(5);
    expect(ensureValidViability(0)).toBe(3);
    expect(ensureValidViability(6)).toBe(3);
    expect(ensureValidViability("invalid")).toBe(3);
    expect(ensureValidViability(undefined)).toBe(3);
  });
});

describe("obsidianDataConverter edge cases", () => {
  test("handles completely empty input data", () => {
    const emptyData = {} as ObsidianDataViewData;
    const result = convertObsidianData(emptyData);
    expect(result.goals).toEqual([]);
    expect(result.projects).toEqual([]);
    expect(result.milestones).toEqual([]);
    expect(result.tasks).toEqual([]);
  });

  test("handles input with empty arrays", () => {
    const emptyArraysData: ObsidianDataViewData = {
      goals: { values: [], settings: {}, length: 0 },
      projects: { values: [], settings: {}, length: 0 },
      milestones: { values: [], settings: {}, length: 0 },
      tasks: { values: [], settings: {}, length: 0 },
    };
    const result = convertObsidianData(emptyArraysData);
    expect(result.goals).toEqual([]);
    expect(result.projects).toEqual([]);
    expect(result.milestones).toEqual([]);
    expect(result.tasks).toEqual([]);
  });

  test("handles partial data with only goals", () => {
    const partialData: Partial<ObsidianDataViewData> = {
      goals: {
        values: [
          {
            name: "Goal 1",
            id: "goal1",
            type: "goal",
            status: "planned",
          },
        ],
        settings: {},
        length: 1,
      },
    };
    const result = convertObsidianData(partialData as ObsidianDataViewData);
    expect(result.goals.length).toBe(1);
    expect(result.goals[0].name).toBe("Goal 1");
    expect(result.projects).toEqual([]);
    expect(result.milestones).toEqual([]);
    expect(result.tasks).toEqual([]);
  });

  test("handles partial data with only projects", () => {
    const partialData: Partial<ObsidianDataViewData> = {
      projects: {
        values: [
          {
            name: "Project 1",
            id: "project1",
            type: "project",
            status: "planned",
            excitement: 3,
            viability: 4,
          },
        ],
        settings: {},
        length: 1,
      },
    };
    const result = convertObsidianData(partialData as ObsidianDataViewData);
    expect(result.goals).toEqual([]);
    expect(result.projects.length).toBe(1);
    expect(result.projects[0].name).toBe("Project 1");
    expect(result.milestones).toEqual([]);
    expect(result.tasks).toEqual([]);
  });

  test("handles partial data with only milestones", () => {
    const partialData: Partial<ObsidianDataViewData> = {
      milestones: {
        values: [
          {
            name: "Milestone 1",
            id: "milestone1",
            type: "milestone",
            status: "planned",
            project: { path: "nonexistent-project", type: "file" },
          },
        ],
        settings: {},
        length: 1,
      },
    };
    const result = convertObsidianData(partialData as ObsidianDataViewData);
    expect(result.goals).toEqual([]);
    expect(result.projects).toEqual([]);
    expect(result.milestones.length).toBe(1);
    expect(result.milestones[0].name).toBe("Milestone 1");
    expect(result.tasks).toEqual([]);
  });

  test("handles partial data with only tasks", () => {
    const partialData: Partial<ObsidianDataViewData> = {
      tasks: {
        values: [
          {
            name: "Task 1",
            id: "task1",
            type: "task",
            status: "planned",
            duration: 2,
            timeSpent: 0,
          },
        ],
        settings: {},
        length: 1,
      },
    };
    const result = convertObsidianData(partialData as ObsidianDataViewData);
    expect(result.goals).toEqual([]);
    expect(result.projects).toEqual([]);
    expect(result.milestones).toEqual([]);
    expect(result.tasks.length).toBe(1);
    expect(result.tasks[0].name).toBe("Task 1");
  });
});
