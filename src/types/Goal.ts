import { Project, Status } from "./";

export interface Goal {
  name: string;
  projects: () => Project[];
  status: Status;
}
