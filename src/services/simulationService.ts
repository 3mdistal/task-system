import { Task, Project, SimulationState } from "../types";
import { USABLE_HOURS_PER_DAY } from "../utils/dateUtils";
import { calculateTaskScore } from "../utils/calculationUtils";
import type { SimulationResult } from "./optimizationService";

export const simulateTaskSequence = (tasks: Task[]): SimulationResult => {
  const state = initializeSimulation();

  for (const task of tasks) {
    if (canStartTask(task, state.completedTasks)) {
      processTask(task, state);
    }
  }

  return finalizeSimulation(state);
};

const initializeSimulation = (): SimulationState => ({
  currentDate: new Date(),
  totalScore: 0,
  completedTasks: [],
  projectDeadlines: new Map<Project, Date>(),
});

const processTask = (task: Task, state: SimulationState): void => {
  const { project, newDate } = getProjectAndNewDate(task, state);

  if (isTaskAfterDeadline(project, newDate, state.projectDeadlines)) {
    return; // Skip this task
  }

  updateSimulationState(task, newDate, state);
};

const getProjectAndNewDate = (task: Task, state: SimulationState) => {
  const project = task.milestone?.project;
  if (project && !state.projectDeadlines.has(project)) {
    state.projectDeadlines.set(
      project,
      project.deadline || new Date(8640000000000000)
    );
  }
  const { date: newDate } = addDays(task.duration, state.currentDate);
  return { project, newDate };
};

const isTaskAfterDeadline = (
  project: Project | undefined,
  newDate: Date,
  projectDeadlines: Map<Project, Date>
): boolean => (project ? newDate > projectDeadlines.get(project)! : false);

const updateSimulationState = (
  task: Task,
  newDate: Date,
  state: SimulationState
): void => {
  state.currentDate = newDate;
  state.totalScore += calculateTaskScore(task, newDate);
  state.completedTasks.push({ ...task, completionDate: newDate });

  const project = task.milestone?.project;
  if (project && isProjectCompleted(project, state.completedTasks)) {
    state.projectDeadlines.set(project, newDate);
  }
};

const finalizeSimulation = (state: SimulationState): SimulationResult => ({
  score: state.totalScore,
  completedTasks: state.completedTasks,
  endDate: state.currentDate,
});

const canStartTask = (task: Task, completedTasks: Task[]): boolean => {
  return task.dependencies.every((dep) => completedTasks.includes(dep));
};

const isProjectCompleted = (
  project: Project,
  completedTasks: Task[]
): boolean => {
  const projectTasks = project
    .milestones()
    .flatMap((milestone) => milestone.tasks());
  return projectTasks.every((task) => completedTasks.includes(task));
};

const addDays = (
  duration: number,
  currentDate: Date
): { date: Date; hoursUsed: number } => {
  const daysToAdd = Math.floor(duration / USABLE_HOURS_PER_DAY);
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + daysToAdd);
  return {
    date: newDate,
    hoursUsed: duration % USABLE_HOURS_PER_DAY,
  };
};
