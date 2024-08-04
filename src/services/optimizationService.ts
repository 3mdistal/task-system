import { Project, Task, Goal, Milestone } from "../types";
import { simulateTaskSequence } from "./simulationService";

export interface SimulationResult {
  score: number;
  completedTasks: Task[];
  endDate: Date;
}

export const optimizeSequence = (
  projects: Project[],
  milestones: Milestone[],
  tasks: Task[]
): Task[] => {
  const allTasks = getAllTasksFromProjects(projects, milestones, tasks);

  const strategies: OptimizationStrategy[] = [
    {
      name: "goals",
      items: getUniqueGoals(allTasks, milestones, projects),
      getItemId: (task: Task) => {
        const milestone = milestones.find((m) => m.id === task.milestoneId);
        if (milestone) {
          const project = projects.find((p) => p.id === milestone.projectId);
          return project?.goalId;
        }
        return undefined;
      },
    },
    {
      name: "projects",
      items: getUniqueProjects(allTasks, milestones),
      getItemId: (task: Task) => {
        const milestone = milestones.find((m) => m.id === task.milestoneId);
        return milestone?.projectId;
      },
    },
    {
      name: "milestones",
      items: getUniqueMilestones(allTasks),
      getItemId: (task: Task) => task.milestoneId,
    },
  ];

  const result = tryOptimizationStrategies(
    allTasks,
    strategies,
    projects,
    milestones
  );

  return result.completedTasks;
};

const tryOptimizationStrategies = (
  allTasks: Task[],
  strategies: OptimizationStrategy[],
  projects: Project[],
  milestones: Milestone[]
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
      strategy.getItemId
    );
    const result = simulateTaskSequence(
      alternatingSequence,
      projects,
      milestones
    );
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
  items: Set<string>,
  getItemId: (task: Task) => string | undefined
): Task[] => {
  const sequence: Task[] = [];
  const remainingTasks = new Set(tasks);
  const itemsArray = Array.from(items);
  let currentIndex = 0;
  let cycleCount = 0;

  while (remainingTasks.size > 0) {
    let taskAdded = false;
    for (let i = 0; i < itemsArray.length; i++) {
      const currentItemId = itemsArray[(currentIndex + i) % itemsArray.length];
      const task = Array.from(remainingTasks).find(
        (t) => getItemId(t) === currentItemId
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
    if (sequence[i].milestoneId !== sequence[i - 1].milestoneId) {
      changes++;
    }
  }
  return changes;
};

interface OptimizationStrategy {
  name: string;
  items: Set<string>;
  getItemId: (task: Task) => string | undefined;
}

const getAllTasksFromProjects = (
  projects: Project[],
  milestones: Milestone[],
  tasks: Task[]
): Task[] => {
  return projects.flatMap((project) =>
    project.milestoneIds.flatMap((milestoneId) => {
      const milestone = milestones.find((m) => m.id === milestoneId);
      return milestone
        ? milestone.taskIds
            .map((taskId) => tasks.find((t) => t.id === taskId))
            .filter((t): t is Task => t !== undefined)
        : [];
    })
  );
};

const getUniqueGoals = (
  tasks: Task[],
  milestones: Milestone[],
  projects: Project[]
): Set<string> => {
  const goalIds = new Set<string>();
  tasks.forEach((task) => {
    const milestone = milestones.find((m) => m.id === task.milestoneId);
    if (milestone) {
      const project = projects.find((p) => p.id === milestone.projectId);
      if (project && project.goalId) {
        goalIds.add(project.goalId);
      }
    }
  });
  return goalIds;
};

const getUniqueProjects = (
  tasks: Task[],
  milestones: Milestone[]
): Set<string> => {
  const projectIds = new Set<string>();
  tasks.forEach((task) => {
    const milestone = milestones.find((m) => m.id === task.milestoneId);
    if (milestone) {
      projectIds.add(milestone.projectId);
    }
  });
  return projectIds;
};

const getUniqueMilestones = (tasks: Task[]): Set<string> => {
  const milestoneIds = new Set<string>();
  tasks.forEach((task) => {
    if (task.milestoneId) {
      milestoneIds.add(task.milestoneId);
    }
  });
  return milestoneIds;
};
