import { MilestoneResult } from "./index";

export interface SimulationResult {
  totalDaysLate: number;
  milestonesLate: MilestoneResult[];
  milestonesEarly: MilestoneResult[];
  totalDuration: number;
  weightedAverageRatio: number;
  projectEndDate: Date;
}
