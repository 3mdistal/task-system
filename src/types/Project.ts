import { Status } from "./";

export interface Project {
  id: string;
  name: string;
  deadline?: Date;
  deadlineType?: "soft" | "hard";
  excitement: 1 | 2 | 3 | 4 | 5;
  goalId?: string;
  milestoneIds: string[];
  status: Status;
  viability: 1 | 2 | 3 | 4 | 5;
  type: "project";
}
