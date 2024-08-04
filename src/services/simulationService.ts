import { Task, Project, SimulationState, Milestone } from "../types";
import { addDays } from "../utils/dateUtils";
import { calculateTaskScore } from "../utils/calculationUtils";
import type { SimulationResult } from "./optimizationService";

export const simulateTaskSequence = (
  tasks: Task[],
  projects: Project[],
  milestones: Milestone[]
): SimulationResult => {
  const state = initializeSimulation(projects);
  const remainingTasks = [...tasks];

  while (remainingTasks.length > 0) {
    let taskProcessed = false;

    for (let i = 0; i < remainingTasks.length; i++) {
      const task = remainingTasks[i];
      if (canStartTask(task, state.completedTasks)) {
        processTask(task, state, projects, milestones);
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
  milestones: Milestone[]
): void => {
  const { projectId, newDate } = getProjectAndNewDate(task, state, milestones);
  updateSimulationState(task, newDate, state, projects, milestones);
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
  milestones: Milestone[]
): void => {
  state.currentDate = newDate;
  state.totalScore += calculateTaskScore(task, newDate, milestones, projects);
  state.completedTasks.push({ ...task, completionDate: newDate });

  const milestone = milestones.find((m) => m.id === task.milestoneId);
  const project = projects.find((p) => p.id === milestone?.projectId);
  if (
    project &&
    isProjectCompleted(project, state.completedTasks, milestones)
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
  milestones: Milestone[]
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
