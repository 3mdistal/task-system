import { Task, Project, SimulationState } from "../types";
import { addDays } from "../utils/dateUtils";
import { calculateTaskScore } from "../utils/calculationUtils";
import type { SimulationResult } from "./optimizationService";

export const simulateTaskSequence = (tasks: Task[]): SimulationResult => {
  const state = initializeSimulation();
  const remainingTasks = [...tasks];

  while (remainingTasks.length > 0) {
    let taskProcessed = false;

    for (let i = 0; i < remainingTasks.length; i++) {
      const task = remainingTasks[i];
      if (canStartTask(task, state.completedTasks)) {
        processTask(task, state);
        remainingTasks.splice(i, 1);
        i--; // Adjust index after removing task
        taskProcessed = true;
      }
    }

    if (!taskProcessed) {
      console.warn("No tasks could be processed. Breaking loop.");
      break;
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
  return task.dependencies.every((dep) =>
    completedTasks.some((completedTask) => completedTask.name === dep.name)
  );
};

const isProjectCompleted = (
  project: Project,
  completedTasks: Task[]
): boolean => {
  const projectTasks = project
    .milestones()
    .flatMap((milestone) => milestone.tasks());
  return projectTasks.every((task) =>
    completedTasks.some((completedTask) => completedTask.name === task.name)
  );
};
