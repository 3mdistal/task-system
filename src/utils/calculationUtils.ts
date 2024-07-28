import { Task, Milestone, Project, Goal } from "../types";
import { getHoursUntilDeadline } from "./dateUtils";

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

export const calculateDeadlineRatio = (
  project: Project,
  date: Date
): number => {
  if (project.milestones().length === 0) return 0;

  const duration = calculateProjectDuration(project);
  const hours = getHoursUntilDeadline(project, date);

  if (duration === 0) return 0;
  return hours / duration; // todo: make the ratio approach 1 (100% busy) instead of what it currently is
};

export const isDeadlineMeetable = (project: Project, date: Date): boolean => {
  if (!project.deadline) return true;
  return calculateDeadlineRatio(project, date) >= 1;
};

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
