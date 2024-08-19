import { Status } from "./";

export interface Goal {
  id: string;
  name: string;
  projectIds: string[];
  status: Status;
  type: "goal";
}
