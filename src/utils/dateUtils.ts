import type { Project, Task, OptimizationResult } from "../types";

export const MS_PER_DAY = 1000 * 60 * 60 * 24;
export const USABLE_HOURS_PER_DAY = 3;

export const getDaysUntilDeadline = (
  project: Project,
  currentDate: Date = new Date()
): number => {
  const { deadline } = project;

  if (!deadline) {
    return Number.MAX_SAFE_INTEGER;
  }

  // Use UTC to avoid DST issues
  const deadlineUTC = Date.UTC(
    deadline.getUTCFullYear(),
    deadline.getUTCMonth(),
    deadline.getUTCDate()
  );
  const currentUTC = Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate()
  );
  const diffTime = deadlineUTC - currentUTC;
  const diffDays = diffTime / MS_PER_DAY;

  return Math.floor(diffDays);
};

export const getHoursUntilDeadline = (
  project: Project,
  date: Date = new Date()
): number => {
  const { deadline } = project;
  if (!deadline) {
    return Number.MAX_SAFE_INTEGER;
  }

  // Use getTime() to get milliseconds since epoch, which accounts for time zones and DST
  const diffTime = deadline.getTime() - date.getTime();
  const diffHours = diffTime / (1000 * 60 * 60);

  // Convert actual hours to "usable" hours
  const usableHours = diffHours * (USABLE_HOURS_PER_DAY / 24);

  // For very small positive differences, always return 1
  if (usableHours > 0 && usableHours < 1) {
    return 1;
  }

  // Round to the nearest usable hour, but never round up to the next day
  return (
    Math.sign(usableHours) *
    (usableHours >= 0
      ? Math.min(
          Math.floor(Math.abs(usableHours)),
          Math.floor(Math.abs(diffHours) * (USABLE_HOURS_PER_DAY / 24))
        )
      : Math.ceil(Math.abs(usableHours)))
  );
};

export const addDays = (
  duration: number,
  currentDate: Date
): { date: Date; hoursUsed: number } => {
  const daysToAdd = Math.floor(duration / USABLE_HOURS_PER_DAY);
  const hoursUsed = duration % USABLE_HOURS_PER_DAY;

  const newDate = new Date(currentDate);
  newDate.setUTCDate(newDate.getUTCDate() + daysToAdd);

  return {
    date: newDate,
    hoursUsed,
  };
};

export function checkDeadlineStatus(
  completedTasks: Task[],
  projects: Project[]
): OptimizationResult["deadlineStatus"] {
  const status = {
    allHardDeadlinesMet: true,
    allSoftDeadlinesMet: true,
    missedHardDeadlines: [] as string[],
    missedSoftDeadlines: [] as string[],
  };

  completedTasks.forEach((task) => {
    if (task.milestoneId) {
      const project = projects.find((p) =>
        p.milestoneIds.includes(task.milestoneId!)
      );
      if (project && project.deadline && task.completionDate) {
        if (task.completionDate > project.deadline) {
          if (project.deadlineType === "hard") {
            status.allHardDeadlinesMet = false;
            status.missedHardDeadlines.push(
              `${project.name}: ${project.deadline.toISOString()}`
            );
          } else {
            status.allSoftDeadlinesMet = false;
            status.missedSoftDeadlines.push(
              `${project.name}: ${project.deadline.toISOString()}`
            );
          }
        }
      }
    }
  });

  return status;
}
