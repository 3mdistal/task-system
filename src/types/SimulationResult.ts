import { ProjectResult } from "./index";

export interface SimulationResult {
  totalDaysLate: number;
  projectsLate: ProjectResult[];
  projectsEarly: ProjectResult[];
  totalDuration: number;
  weightedAverageRatio: number;
  projectEndDate: Date;
}
