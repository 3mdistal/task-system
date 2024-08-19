import { Task, Project } from "./index";

export type SimulationState = {
  currentDate: Date;
  totalScore: number;
  completedTasks: Task[];
  projectDeadlines: Map<string, Date>;
};
