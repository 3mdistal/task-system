import { Goal, Milestone, Status } from "./";

export interface Project {
  deadline?: Date;
  deadlineType?: "soft" | "hard";
  excitement: 1 | 2 | 3 | 4 | 5;
  goal: Goal;
  milestones: () => Milestone[];
  name: string;
  status: Status;
  viability: 1 | 2 | 3 | 4 | 5;
}
