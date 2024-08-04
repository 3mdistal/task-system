import { convertObsidianData } from "../../src/utils/obsidianDataConverter";
import rawData from "../../src/data/rawData.json";
import {
  isGoal,
  isProject,
  isMilestone,
  isTask,
} from "../../src/utils/typeGuards";
import { ObsidianDataViewData } from "../../src/types/Obsidian";

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
      expect(goal).toHaveProperty("projects");
      expect(goal).toHaveProperty("status");
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
      expect(project).toHaveProperty("milestones");
      expect(project).toHaveProperty("goal");
    });
  });

  test("converts milestones correctly", () => {
    const { milestones } = convertedData;
    expect(milestones.length).toBeGreaterThan(0);
    milestones.forEach((milestone) => {
      expect(isMilestone(milestone)).toBe(true);
      expect(milestone).toHaveProperty("id");
      expect(milestone).toHaveProperty("name");
      expect(milestone).toHaveProperty("project");
      expect(milestone).toHaveProperty("dependencies");
      expect(milestone).toHaveProperty("status");
      expect(milestone).toHaveProperty("tasks");
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
      expect(task).toHaveProperty("dependencies");
      expect(task).toHaveProperty("duration");
      expect(task).toHaveProperty("timeSpent");
      expect(task).toHaveProperty("milestone");
    });
  });

  test("links projects to goals correctly", () => {
    const { goals, projects } = convertedData;
    projects.forEach((project) => {
      if (project.goal) {
        const linkedGoal = goals.find((g) => g.id === project.goal!.id);
        expect(linkedGoal).toBeDefined();
        expect(linkedGoal!.projects).toContain(project);
      }
    });
  });

  test("links milestones to projects correctly", () => {
    const { projects, milestones } = convertedData;
    milestones.forEach((milestone) => {
      const linkedProject = projects.find((p) => p.id === milestone.project.id);
      expect(linkedProject).toBeDefined();
      expect(linkedProject!.milestones).toContain(milestone);
    });
  });

  test("links tasks to milestones correctly", () => {
    const { milestones, tasks } = convertedData;
    tasks.forEach((task) => {
      if (task.milestone) {
        const linkedMilestone = milestones.find(
          (m) => m.id === task.milestone!.id
        );
        expect(linkedMilestone).toBeDefined();
        expect(linkedMilestone!.tasks).toContain(task);
      }
    });
  });
});
