import { Milestone } from "../types";

export const MS_PER_DAY = 1000 * 60 * 60 * 24;
export const USABLE_HOURS_PER_DAY = 3;

export const getDaysUntilDeadline = (
  milestone: Milestone,
  currentDate: Date = new Date()
): number => {
  const deadline = new Date(
    milestone.hard_deadline || milestone.soft_deadline || ""
  );
  if (isNaN(deadline.getTime())) {
    return Number.MAX_SAFE_INTEGER;
  }

  const diffTime = deadline.getTime() - currentDate.getTime();
  const diffDays = diffTime / MS_PER_DAY;

  // If the difference is less than one day and positive, return 0
  if (diffDays > 0 && diffDays < 1) {
    return 0;
  }

  return Math.floor(diffDays);
};

export const getHoursUntilDeadline = (
  milestone: Milestone,
  date: Date = new Date()
): number => {
  const deadline = new Date(
    milestone.hard_deadline || milestone.soft_deadline || ""
  );
  if (isNaN(deadline.getTime())) {
    return Number.MAX_SAFE_INTEGER;
  }

  const diffTime = deadline.getTime() - date.getTime();
  const diffHours = diffTime / (1000 * 60 * 60);

  // If the difference is less than one day and positive, return 0
  if (diffHours > 0 && diffHours < 24) {
    return 0;
  }

  return Math.floor(diffHours * (USABLE_HOURS_PER_DAY / 24));
};

export const addDays = (
  duration: number,
  currentDate: Date
): { date: Date; hoursUsed: number } => {
  const daysToAdd = Math.floor(duration / USABLE_HOURS_PER_DAY);
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + daysToAdd);
  return {
    date: newDate,
    hoursUsed: duration % USABLE_HOURS_PER_DAY,
  };
};
