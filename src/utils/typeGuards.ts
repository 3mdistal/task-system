import { Goal, Project, Milestone, Task } from "../types";

export function isGoal(item: any): item is Goal {
  return item && item.type === "goal";
}

export function isProject(item: any): item is Project {
  return item && item.type === "project";
}

export function isMilestone(item: any): item is Milestone {
  return item && item.type === "milestone";
}

export function isTask(item: any): item is Task {
  return item && item.type === "task";
}
