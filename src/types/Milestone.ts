import type { Status } from "./";

export interface Milestone {
  id: string;
  name: string;
  projectId?: string;
  dependencyIds: string[];
  status: Status;
  taskIds: string[];
  type: "milestone";
}
