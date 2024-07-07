import { Milestone } from "./index";

export interface MilestoneResult {
  milestone: Milestone;
  index: number;
  daysLate?: number;
  daysEarly?: number;
}
