import type { Status, Task } from "./";
import { Project } from "./Project";

export interface Milestone {
  dependencies: Array<Milestone | Task>;
  name: string;
  project: Project;
  status: Status;
  tasks: () => Task[];
}
