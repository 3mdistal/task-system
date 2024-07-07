import { Milestone, MilestoneResult, SimulationResult } from "../types";
import { MS_PER_DAY, USABLE_HOURS_PER_DAY, addDays } from "../utils/dateUtils";
import {
  calculateTotalDuration,
  getTasksForMilestone,
} from "../utils/calculationUtils";

export const simulateSequence = (milestones: Milestone[]): SimulationResult => {
  let currentDate = new Date();
  let totalDaysLate = 0;
  let milestonesLate: MilestoneResult[] = [];
  let milestonesEarly: MilestoneResult[] = [];
  let totalDuration = 0;
  let totalWeightedRatio = 0;

  milestones.forEach((milestone, index) => {
    const milestoneDuration = calculateTotalDuration(
      getTasksForMilestone(milestone)
    );
    totalDuration += milestoneDuration;

    const deadline = new Date(
      milestone.hard_deadline || milestone.soft_deadline || ""
    );

    if (!isNaN(deadline.getTime())) {
      const timeUntilDeadline = Math.max(
        0,
        deadline.getTime() - currentDate.getTime()
      );
      const timeNeeded =
        (milestoneDuration * MS_PER_DAY) / USABLE_HOURS_PER_DAY;

      let ratio = timeUntilDeadline / timeNeeded;
      totalWeightedRatio += ratio * milestoneDuration;

      if (timeNeeded > timeUntilDeadline) {
        const daysLate = Math.ceil(
          (timeNeeded - timeUntilDeadline) / MS_PER_DAY
        );
        totalDaysLate += daysLate;
        milestonesLate.push({ milestone, index, daysLate });
        currentDate = new Date(currentDate.getTime() + timeNeeded);
      } else {
        const daysEarly = Math.floor(
          (timeUntilDeadline - timeNeeded) / MS_PER_DAY
        );
        milestonesEarly.push({ milestone, index, daysEarly });
        currentDate = new Date(deadline.getTime());
      }
    } else {
      totalWeightedRatio += milestoneDuration;
      currentDate = new Date(
        currentDate.getTime() +
          (milestoneDuration * MS_PER_DAY) / USABLE_HOURS_PER_DAY
      );
    }
  });

  const weightedAverageRatio =
    totalDuration > 0 ? totalWeightedRatio / totalDuration : 0;

  return {
    totalDaysLate,
    milestonesLate,
    milestonesEarly,
    totalDuration,
    weightedAverageRatio,
    projectEndDate: currentDate,
  };
};
