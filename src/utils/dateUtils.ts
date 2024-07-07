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
  return isNaN(deadline.getTime())
    ? Number.MAX_SAFE_INTEGER
    : Math.ceil((deadline.getTime() - currentDate.getTime()) / MS_PER_DAY);
};

export const getHoursUntilDeadline = (
  milestone: Milestone,
  date: Date
): number => getDaysUntilDeadline(milestone, date) * USABLE_HOURS_PER_DAY;

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
