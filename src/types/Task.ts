import { Status } from "./";

export interface Task {
  id: string;
  name: string;
  status: Status;
  completionDate?: Date;
  dependencyIds: string[];
  duration: number;
  timeSpent: number;
  milestoneId?: string;
  type: "task";
}
