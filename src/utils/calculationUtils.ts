import { Task, Milestone } from "../types";
import { getHoursUntilDeadline } from "./dateUtils";
import { tasks } from "../index";

export const calculateTotalDuration = (tasks: Task[]): number =>
  tasks.reduce((total, task) => total + task.duration, 0);

export const calculateDeadlineRatio = (
  milestone: Milestone,
  date: Date
): number => {
  const milestoneTasks = getTasksForMilestone(milestone);
  const duration = calculateTotalDuration(milestoneTasks);
  const hours = getHoursUntilDeadline(milestone, date);

  if (duration === 0) return 0;
  return hours / duration;
};

export const isDeadlineMeetable = (milestone: Milestone, date: Date): boolean =>
  (!milestone.hard_deadline && !milestone.soft_deadline) ||
  calculateDeadlineRatio(milestone, date) >= 1;

export const getTasksForMilestone = (milestone: Milestone): Task[] =>
  tasks.filter((task) => task.milestone === milestone.name);
