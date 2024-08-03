import { Task, Milestone, Project, Goal } from "../types";
import { getHoursUntilDeadline, getDaysUntilDeadline } from "./dateUtils";

export const calculateTasksDuration = (tasks: Task[]): number =>
  tasks.reduce((total, task) => total + task.duration, 0);

export const calculateMilestoneDuration = (milestone: Milestone): number =>
  calculateTasksDuration(milestone.tasks());

export const calculateProjectDuration = (project: Project): number =>
  project
    .milestones()
    .reduce(
      (total, milestone) => total + calculateMilestoneDuration(milestone),
      0
    );

export const getTasksForMilestone = (
  milestone: Milestone,
  allTasks: Task[]
): Task[] => allTasks.filter((task) => task.milestone === milestone);

export const getMilestonesForProject = (
  project: Project,
  allMilestones: Milestone[]
): Milestone[] =>
  allMilestones.filter((milestone) => milestone.project === project);

export const getProjectsForGoal = (
  goal: Goal,
  allProjects: Project[]
): Project[] => allProjects.filter((project) => project.goal === goal);

export const calculateTaskScore = (
  task: Task,
  completionDate: Date
): number => {
  const project = task.milestone?.project;
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
