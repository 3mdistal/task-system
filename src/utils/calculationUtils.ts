import { Task, Milestone } from "../types";
import { getHoursUntilDeadline } from "./dateUtils";

export const calculateTotalDuration = (tasks: Task[]): number =>
  tasks.reduce((total, task) => total + task.duration, 0);

export const calculateDeadlineRatio = (
  milestone: Milestone,
  date: Date
): number => {
  const duration = calculateTotalDuration(getTasksForMilestone(milestone));
  const hours = getHoursUntilDeadline(milestone, date);
  return hours === 0 ? 0 : hours / duration;
};

export const isDeadlineMeetable = (milestone: Milestone, date: Date): boolean =>
  (!milestone.hard_deadline && !milestone.soft_deadline) ||
  calculateDeadlineRatio(milestone, date) >= 1;

export const getTasksForMilestone = (milestone: Milestone): Task[] =>
  tasks.filter((task) => task.milestone === milestone.name);

// You'll need to import or define your tasks array here
const tasks: Task[] = [
  // ... your tasks here
];
