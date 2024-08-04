import { Task, Milestone, Project, Goal } from "../types";
import { getDaysUntilDeadline } from "./dateUtils";

export const calculateTasksDuration = (tasks: Task[]): number =>
  tasks.reduce((total, task) => total + task.duration, 0);

export const calculateMilestoneDuration = (
  milestone: Milestone,
  allTasks: Task[]
): number =>
  calculateTasksDuration(
    allTasks.filter((task) => task.milestoneId === milestone.id)
  );

export const calculateProjectDuration = (
  project: Project,
  allMilestones: Milestone[],
  allTasks: Task[]
): number =>
  project.milestoneIds
    .map((id) => allMilestones.find((m) => m.id === id))
    .filter((milestone): milestone is Milestone => milestone !== undefined)
    .reduce(
      (total, milestone) =>
        total + calculateMilestoneDuration(milestone, allTasks),
      0
    );

export const getTasksForMilestone = (
  milestone: Milestone,
  allTasks: Task[]
): Task[] => allTasks.filter((task) => task.milestoneId === milestone.id);

export const getMilestonesForProject = (
  project: Project,
  allMilestones: Milestone[]
): Milestone[] =>
  allMilestones.filter((milestone) => milestone.projectId === project.id);

export const getProjectsForGoal = (
  goal: Goal,
  allProjects: Project[]
): Project[] => allProjects.filter((project) => project.goalId === goal.id);

export const calculateTaskScore = (
  task: Task,
  completionDate: Date,
  allMilestones: Milestone[],
  allProjects: Project[]
): number => {
  const milestone = allMilestones.find((m) => m.id === task.milestoneId);
  const project = milestone
    ? allProjects.find((p) => p.id === milestone.projectId)
    : undefined;
  if (!project) return 0;

  const daysUntilDeadline = getDaysUntilDeadline(project, completionDate);
  const deadlineScore =
    project.deadlineType === "hard"
      ? daysUntilDeadline >= 0
        ? 100
        : -1000
      : Math.max(-100, daysUntilDeadline * 10);

  return (
    deadlineScore +
    project.excitement * 20 +
    project.viability * 20 +
    (task.status === "in-flight" ? 50 : 0)
  );
};
