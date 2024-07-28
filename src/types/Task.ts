import { Milestone } from "./";
import { Status } from "./";

export interface Task {
  dependencies: Array<Task>;
  duration: number;
  timeSpent: number;
  milestone?: Milestone;
  name: string;
  status: Status;
}
