export interface Task {
  name: string;
  duration: number;
  milestone?: string;
  soft_deadline?: string;
  hard_deadline?: string;
}

export interface Milestone {
  name: string;
  viability: number;
  excitement: number;
  soft_deadline?: string;
  hard_deadline?: string;
  project: string;
}

export interface MilestoneResult {
  milestone: Milestone;
  index: number;
  daysLate?: number;
  daysEarly?: number;
}

export interface SimulationResult {
  totalDaysLate: number;
  milestonesLate: MilestoneResult[];
  milestonesEarly: MilestoneResult[];
  totalDuration: number;
  weightedAverageRatio: number;
  projectEndDate: Date;
}
