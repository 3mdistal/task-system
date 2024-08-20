import { Task, Project, SimulationState, Milestone, Goal } from "../types";
import { addDays } from "../utils/dateUtils";
import { calculateTaskScore } from "../utils/calculationUtils";
import type { SimulationResult } from "./optimizationService";
import { logger } from "../utils/logger";

export const simulateTaskSequence = (
  tasks: Task[],
  projects: Project[],
  goals: Goal[],
  milestones: Milestone[]
): SimulationResult => {
  const state = initializeSimulation(projects);
  const remainingTasks = [...tasks];

  while (remainingTasks.length > 0) {
    let taskProcessed = false;

    for (let i = 0; i < remainingTasks.length; i++) {
      const task = remainingTasks[i];
      if (canStartTask(task, state.completedTasks)) {
        processTask(task, state, projects, milestones, goals);
        remainingTasks.splice(i, 1);
        i--; // Adjust index after removing task
        taskProcessed = true;
      }
    }

    if (!taskProcessed) {
      logger.warn("No tasks could be processed. Breaking loop.");
      break;
    }
  }

  return finalizeSimulation(state);
};

const initializeSimulation = (projects: Project[]): SimulationState => ({
  currentDate: new Date(),
  totalScore: 0,
  completedTasks: [],
  projectDeadlines: new Map(
    projects.map((project) => [
      project.id,
      project.deadline || new Date(8640000000000000),
    ])
  ),
});

const processTask = (
  task: Task,
  state: SimulationState,
  projects: Project[],
  milestones: Milestone[],
  goals: Goal[]
): void => {
  const { projectId, newDate } = getProjectAndNewDate(task, state, milestones);
  updateSimulationState(task, newDate, state, projects, milestones, goals);
};

const getProjectAndNewDate = (
  task: Task,
  state: SimulationState,
  milestones: Milestone[]
) => {
  const milestone = milestones.find((m) => m.id === task.milestoneId);
  const projectId = milestone?.projectId;
  const { date: newDate } = addDays(task.duration, state.currentDate);
  return { projectId, newDate };
};

const updateSimulationState = (
  task: Task,
  newDate: Date,
  state: SimulationState,
  projects: Project[],
  milestones: Milestone[],
  goals: Goal[]
): void => {
  state.currentDate = newDate;
  state.totalScore += calculateTaskScore(task, newDate, milestones, projects);
  state.completedTasks.push({ ...task, completionDate: newDate });

  const milestone = milestones.find((m) => m.id === task.milestoneId);
  const project = projects.find((p) => p.id === milestone?.projectId);
  if (
    project &&
    isProjectCompleted(project, state.completedTasks, milestones, goals)
  ) {
    state.projectDeadlines.set(project.id, newDate);
  }
};

const finalizeSimulation = (state: SimulationState): SimulationResult => ({
  score: state.totalScore,
  completedTasks: state.completedTasks,
  endDate: state.currentDate,
});

const canStartTask = (task: Task, completedTasks: Task[]): boolean => {
  return task.dependencyIds.every((depId) =>
    completedTasks.some((completedTask) => completedTask.id === depId)
  );
};

const isProjectCompleted = (
  project: Project,
  completedTasks: Task[],
  milestones: Milestone[],
  goals: Goal[]
): boolean => {
  const projectMilestones = milestones.filter(
    (m) => m.projectId === project.id
  );
  const projectTasks = projectMilestones.flatMap(
    (milestone) => milestone.taskIds
  );
  return projectTasks.every((taskId) =>
    completedTasks.some((completedTask) => completedTask.id === taskId)
  );
};
