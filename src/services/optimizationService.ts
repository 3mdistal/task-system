import { Project, Task, Goal, Milestone } from "../types";
import { simulateTaskSequence } from "./simulationService";

export interface SimulationResult {
  score: number;
  completedTasks: Task[];
  endDate: Date;
}

export const optimizeSequence = (projects: Project[]): Task[] => {
  const allTasks = getAllTasksFromProjects(projects);
  const goals = getUniqueGoals(allTasks);
  const projectsSet = getUniqueProjects(allTasks);
  const milestones = getUniqueMilestones(allTasks);

  const strategies = [
    {
      name: "goals",
      items: goals,
      getItem: (task: Task) => task.milestone?.project.goal,
    },
    {
      name: "projects",
      items: projectsSet,
      getItem: (task: Task) => task.milestone?.project,
    },
    {
      name: "milestones",
      items: milestones,
      getItem: (task: Task) => task.milestone,
    },
  ];

  let bestResult = tryOptimizationStrategies(allTasks, strategies);

  return bestResult.completedTasks;
};

const tryOptimizationStrategies = (
  allTasks: Task[],
  strategies: OptimizationStrategy[]
): SimulationResult => {
  let bestResult: SimulationResult = {
    score: 0,
    completedTasks: [],
    endDate: new Date(),
  };

  for (const strategy of strategies) {
    const result = tryStrategy(allTasks, strategy);
    if (result.score > bestResult.score) {
      bestResult = result;
    }
    if (areAllDeadlinesMet(result.completedTasks)) {
      break;
    }
  }

  return bestResult;
};

interface OptimizationStrategy {
  name: string;
  items: any[];
  getItem: (task: Task) => any;
}

const tryStrategy = (
  allTasks: Task[],
  strategy: OptimizationStrategy
): SimulationResult => {
  const sequence = generateAlternatingSequence(
    allTasks,
    strategy.items,
    strategy.getItem
  );
  return simulateTaskSequence(sequence);
};

const generateAlternatingSequence = <T>(
  tasks: Task[],
  items: T[],
  getItem: (task: Task) => T | undefined
): Task[] => {
  const sequence: Task[] = [];
  const remainingTasks = new Set(tasks);
  let currentIndex = 0;

  while (remainingTasks.size > 0) {
    const currentItem = items[currentIndex % items.length];
    const task = Array.from(remainingTasks).find(
      (t) => getItem(t) === currentItem
    );

    if (task) {
      sequence.push(task);
      remainingTasks.delete(task);
    }

    currentIndex++;
    if (currentIndex >= items.length * 2) {
      // If we've gone through the list twice without finding a matching task, add any remaining tasks
      sequence.push(...Array.from(remainingTasks));
      break;
    }
  }

  return sequence;
};

const areAllDeadlinesMet = (completedTasks: Task[]): boolean => {
  const projectCompletionDates = new Map<Project, Date>();

  for (const task of completedTasks) {
    const project = task.milestone?.project;
    if (project) {
      const completionDate = projectCompletionDates.get(project) || new Date(0);
      projectCompletionDates.set(
        project,
        new Date(
          Math.max(
            completionDate.getTime(),
            task.completionDate?.getTime() || 0
          )
        )
      );
    }
  }

  for (const [project, completionDate] of projectCompletionDates.entries()) {
    if (project.deadline && completionDate > project.deadline) {
      return false;
    }
  }

  return true;
};

const getAllTasksFromProjects = (projects: Project[]): Task[] => {
  return projects.flatMap((project) =>
    project.milestones().flatMap((milestone) => milestone.tasks())
  );
};

const getUniqueGoals = (tasks: Task[]): Goal[] => {
  const goals = new Set<Goal>();
  tasks.forEach((task) => {
    if (task.milestone?.project.goal) {
      goals.add(task.milestone.project.goal);
    }
  });
  return Array.from(goals);
};

const getUniqueProjects = (tasks: Task[]): Project[] => {
  const projects = new Set<Project>();
  tasks.forEach((task) => {
    if (task.milestone?.project) {
      projects.add(task.milestone.project);
    }
  });
  return Array.from(projects);
};

const getUniqueMilestones = (tasks: Task[]): Milestone[] => {
  const milestones = new Set<Milestone>();
  tasks.forEach((task) => {
    if (task.milestone) {
      milestones.add(task.milestone);
    }
  });
  return Array.from(milestones);
};
