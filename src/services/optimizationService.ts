import { Project, Task, Goal, Milestone } from "../types";
import { simulateTaskSequence } from "./simulationService";

export interface SimulationResult {
  score: number;
  completedTasks: Task[];
  endDate: Date;
}

export const optimizeSequence = (projects: Project[]): Task[] => {
  const allTasks = getAllTasksFromProjects(projects);

  const strategies: OptimizationStrategy[] = [
    {
      name: "goals",
      items: new Map(getUniqueGoals(allTasks).map((goal) => [goal, true])),
      getItem: (task: Task) => task.milestone?.project.goal,
    },
    {
      name: "projects",
      items: new Map(
        getUniqueProjects(allTasks).map((project) => [project, true])
      ),
      getItem: (task: Task) => task.milestone?.project,
    },
    {
      name: "milestones",
      items: new Map(
        getUniqueMilestones(allTasks).map((milestone) => [milestone, true])
      ),
      getItem: (task: Task) => task.milestone,
    },
  ];

  const result = tryOptimizationStrategies(allTasks, strategies);

  return result.completedTasks;
};

const tryOptimizationStrategies = (
  allTasks: Task[],
  strategies: OptimizationStrategy[]
): SimulationResult => {
  let bestResult: SimulationResult = {
    score: -Infinity,
    completedTasks: [],
    endDate: new Date(),
  };

  for (const strategy of strategies) {
    const alternatingSequence = generateAlternatingSequence(
      allTasks,
      strategy.items,
      strategy.getItem
    );
    const result = simulateTaskSequence(alternatingSequence);

    if (
      result.score > bestResult.score ||
      (result.score === bestResult.score &&
        countProjectChanges(result.completedTasks) >
          countProjectChanges(bestResult.completedTasks))
    ) {
      bestResult = result;
    }
  }

  return bestResult;
};

const generateAlternatingSequence = (
  tasks: Task[],
  items: Map<any, boolean>,
  getItem: (task: Task) => any
): Task[] => {
  const sequence: Task[] = [];
  const remainingTasks = new Set(tasks);
  const itemsArray = Array.from(items.keys());
  let currentIndex = 0;
  let cycleCount = 0;

  while (remainingTasks.size > 0) {
    let taskAdded = false;
    for (let i = 0; i < itemsArray.length; i++) {
      const currentItem = itemsArray[(currentIndex + i) % itemsArray.length];
      const task = Array.from(remainingTasks).find(
        (t) => getItem(t) === currentItem
      );

      if (task) {
        sequence.push(task);
        remainingTasks.delete(task);
        taskAdded = true;
        break;
      }
    }

    if (!taskAdded) {
      cycleCount++;
      if (cycleCount >= 2) {
        const nextTask = remainingTasks.values().next().value;
        if (nextTask) {
          sequence.push(nextTask);
          remainingTasks.delete(nextTask);
        }
      }
    } else {
      cycleCount = 0;
    }

    currentIndex = (currentIndex + 1) % itemsArray.length;
  }

  return sequence;
};

const countProjectChanges = (sequence: Task[]): number => {
  let changes = 0;
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i].milestone?.project !== sequence[i - 1].milestone?.project) {
      changes++;
    }
  }
  return changes;
};

interface OptimizationStrategy {
  name: string;
  items: Map<any, boolean>;
  getItem: (task: Task) => any;
}

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
