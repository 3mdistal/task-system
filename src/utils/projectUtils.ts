import {
  CrunchInfo,
  Milestone,
  OptimizationResult,
  Project,
  Task,
} from "../types";
import { getDaysUntilDeadline } from "./dateUtils";

export function getProjectDeadline(
  task: Task,
  tasks: Task[],
  getItemId: (task: Task) => string | undefined
): Date | undefined {
  const deadlineStr = getItemId(task);
  return deadlineStr ? new Date(deadlineStr) : undefined;
}

export function checkDeadlineStatus(
  completedTasks: Task[],
  projects: Project[]
): OptimizationResult["deadlineStatus"] {
  const missedHardDeadlines: string[] = [];
  const missedSoftDeadlines: string[] = [];

  projects.forEach((project) => {
    if (project.deadline) {
      const projectTasks = completedTasks.filter(
        (task) =>
          task.milestoneId && project.milestoneIds.includes(task.milestoneId)
      );
      const lastTaskCompletionDate = Math.max(
        ...projectTasks.map((task) => task.completionDate?.getTime() || 0)
      );

      if (lastTaskCompletionDate > project.deadline.getTime()) {
        if (project.deadlineType === "hard") {
          missedHardDeadlines.push(
            `${project.name}: ${project.deadline.toISOString()}`
          );
        } else {
          missedSoftDeadlines.push(
            `${project.name}: ${project.deadline.toISOString()}`
          );
        }
      }
    }
  });

  return {
    allHardDeadlinesMet: missedHardDeadlines.length === 0,
    allSoftDeadlinesMet: missedSoftDeadlines.length === 0,
    missedHardDeadlines,
    missedSoftDeadlines,
  };
}

export function calculateCrunchInfo(
  projects: Project[],
  endDate: Date
): CrunchInfo {
  const crunchByProject: { [key: string]: number } = {};
  let totalCrunch = 0;
  let projectsWithDeadlines = 0;

  projects.forEach((project) => {
    if (project.deadline) {
      const crunch = Math.max(
        Math.min(getDaysUntilDeadline(project, endDate), 3650),
        -3650
      );
      crunchByProject[project.name] = crunch;
      totalCrunch += crunch;
      projectsWithDeadlines++;
    }
  });

  const earliestCrunch =
    projectsWithDeadlines > 0 ? Math.min(...Object.values(crunchByProject)) : 0;
  const latestCrunch =
    projectsWithDeadlines > 0 ? Math.max(...Object.values(crunchByProject)) : 0;
  const averageCrunch =
    projectsWithDeadlines > 0 ? totalCrunch / projectsWithDeadlines : 0;

  return {
    earliestCrunch,
    latestCrunch,
    averageCrunch,
    crunchByProject,
  };
}
