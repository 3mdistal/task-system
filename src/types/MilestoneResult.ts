import { Project } from "./index";

export interface ProjectResult {
  project: Project;
  index: number;
  daysLate?: number;
  daysEarly?: number;
}
