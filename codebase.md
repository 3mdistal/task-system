# tsconfig.json

```json
{
    "compilerOptions": {
      "target": "es6",
      "module": "commonjs",
      "outDir": "./dist",
      "strict": true,
      "esModuleInterop": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "**/*.test.ts"]
  }
  
```

# package.json

```json
{
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.5",
    "typescript": "^5.5.3"
  },
  "scripts": {
    "test": "jest",
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "packageManager": "pnpm@8.7.4+sha512.fdb4396d7a7c97b92b866d905d0546b8f8f3342fd9fe9d1f2b8930f1a22ba86d18b614d2f5a9112861e25b26875fadb7967b42ae21c16593ea85b5dccea48d56"
}

```

# jest.config.js

```js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
};

```

# .gitignore

```
**/node_modules
**/dist
```

# src/index.ts

```ts
import { Project } from "./types";
import { optimizeSequence } from "./services/optimizationService";
import { simulateSequence } from "./services/simulationService";
import { projects } from "./data/data";

export function optimizeTasks(projects: Project[]) {
  const bestSequence = optimizeSequence(projects);
  const result = simulateSequence(bestSequence);

  console.log(bestSequence, result);

  return {
    optimizedSequence: bestSequence,
    statistics: result,
  };
}

optimizeTasks(projects);

```

# tests/utils/dateUtils.test.ts

```ts
import { Project } from "../../src/types";
import {
  MS_PER_DAY,
  USABLE_HOURS_PER_DAY,
  getDaysUntilDeadline,
  getHoursUntilDeadline,
  addDays,
} from "../../src/utils/dateUtils";

describe("Project Utility Functions", () => {
  const baseProject: Project = {
    name: "Test Project",
    viability: 1,
    excitement: 1,
    deadlineType: "hard",
    goal: {
      name: "Test Goal",
      projects: () => [],
      status: "planned",
    },
    milestones: () => [],
    status: "planned",
  };

  describe("getDaysUntilDeadline", () => {
    it("should return correct number of days for a future hard deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-10T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(project, currentDate)).toBe(3);
    });

    it("should return correct number of days for a future soft deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-10T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(project, currentDate)).toBe(3);
    });

    it("should return MAX_SAFE_INTEGER for invalid date", () => {
      const project: Project = {
        ...baseProject,
        deadline: undefined,
      };
      expect(getDaysUntilDeadline(project)).toBe(Number.MAX_SAFE_INTEGER);
    });

    it("should return 0 for a deadline that's today", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-07T12:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(project, currentDate)).toBe(0);
    });

    it("should return negative days for a past deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-05T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(project, currentDate)).toBe(-2);
    });

    it("should use current date when not provided", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-10T00:00:00Z"),
      };
      const mockDate = new Date("2024-07-07T00:00:00Z");
      jest.useFakeTimers().setSystemTime(mockDate);
      expect(getDaysUntilDeadline(project)).toBe(3);
      jest.useRealTimers();
    });
  });

  describe("getHoursUntilDeadline", () => {
    it("should return correct number of hours until deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-10T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(project, currentDate)).toBe(
        3 * USABLE_HOURS_PER_DAY
      ); // 3 days * 3 usable hours
    });

    it("should return 0 hours for a deadline that's today", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-07T12:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(project, currentDate)).toBe(0);
    });

    it("should return negative hours for a past deadline", () => {
      const project: Project = {
        ...baseProject,
        deadline: new Date("2024-07-05T00:00:00Z"),
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(project, currentDate)).toBe(
        -2 * USABLE_HOURS_PER_DAY
      ); // -2 days * 3 usable hours
    });
  });

  describe("addDays", () => {
    it("should add correct number of days for full days", () => {
      const currentDate = new Date("2024-07-07T00:00:00Z");
      const result = addDays(3 * USABLE_HOURS_PER_DAY, currentDate); // 3 full days
      expect(result.date).toEqual(new Date("2024-07-10T00:00:00Z"));
      expect(result.hoursUsed).toBe(0);
    });

    it("should add correct number of days with remaining hours", () => {
      const currentDate = new Date("2024-07-07T00:00:00Z");
      const result = addDays(3 * USABLE_HOURS_PER_DAY + 1, currentDate); // 3 full days + 1 hour
      expect(result.date).toEqual(new Date("2024-07-10T00:00:00Z"));
      expect(result.hoursUsed).toBe(1);
    });

    it("should handle duration less than one day", () => {
      const currentDate = new Date("2024-07-07T00:00:00Z");
      const result = addDays(2, currentDate);
      expect(result.date).toEqual(new Date("2024-07-07T00:00:00Z"));
      expect(result.hoursUsed).toBe(2);
    });

    it("should handle zero duration", () => {
      const currentDate = new Date("2024-07-07T00:00:00Z");
      const result = addDays(0, currentDate);
      expect(result.date).toEqual(new Date("2024-07-07T00:00:00Z"));
      expect(result.hoursUsed).toBe(0);
    });
  });

  describe("Constants", () => {
    it("should have correct value for MS_PER_DAY", () => {
      expect(MS_PER_DAY).toBe(86400000); // 1000 * 60 * 60 * 24
    });
  });
});

```

# src/types/index.ts

```ts
export * from "./Goal";
export * from "./Milestone";
export * from "./MilestoneResult";
export * from "./Project";
export * from "./SimulationResult";
export * from "./Status";
export * from "./Task";

```

# src/types/Task.ts

```ts
import { Milestone } from "./";
import { Status } from "./";

export interface Task {
  dependencies: Array<Task>;
  duration: number;
  timeSpent: number;
  milestone?: Milestone;
  name: string;
  status: Status;
}

```

# src/types/Status.ts

```ts
export type Status =
  | "raw"
  | "backlog"
  | "planned"
  | "in-flight"
  | "complete"
  | "archived";

```

# src/types/SimulationResult.ts

```ts
import { ProjectResult } from "./index";

export interface SimulationResult {
  totalDaysLate: number;
  projectsLate: ProjectResult[];
  projectsEarly: ProjectResult[];
  totalDuration: number;
  weightedAverageRatio: number;
  projectEndDate: Date;
}

```

# src/types/Project.ts

```ts
import { Goal, Milestone, Status } from "./";

export interface Project {
  deadline?: Date;
  deadlineType?: "soft" | "hard";
  excitement: 1 | 2 | 3 | 4 | 5;
  goal: Goal;
  milestones: () => Milestone[];
  name: string;
  status: Status;
  viability: 1 | 2 | 3 | 4 | 5;
}

```

# src/types/MilestoneResult.ts

```ts
import { Project } from "./index";

export interface ProjectResult {
  project: Project;
  index: number;
  daysLate?: number;
  daysEarly?: number;
}

```

# src/types/Milestone.ts

```ts
import type { Status, Task } from "./";
import { Project } from "./Project";

export interface Milestone {
  dependencies: Array<Milestone | Task>;
  name: string;
  project: Project;
  status: Status;
  tasks: () => Task[];
}

```

# src/types/Goal.ts

```ts
import { Project, Status } from "./";

export interface Goal {
  name: string;
  projects: () => Project[];
  status: Status;
}

```

# src/services/simulationService.ts

```ts
import { Project, ProjectResult, SimulationResult } from "../types";
import { MS_PER_DAY } from "../utils/dateUtils";
import { calculateProjectDuration } from "../utils/calculationUtils";

export const simulateSequence = (projects: Project[]): SimulationResult => {
  let currentDate = new Date();
  let totalDaysLate = 0;
  let projectsLate: ProjectResult[] = [];
  let projectsEarly: ProjectResult[] = [];
  let totalDuration = 0;
  let totalWeightedRatio = 0;

  projects.forEach((project, index) => {
    const projectDuration = calculateProjectDuration(project);
    totalDuration += projectDuration;

    const { deadline } = project;

    if (!deadline) {
      totalWeightedRatio += projectDuration;
      currentDate = new Date(
        currentDate.getTime() + projectDuration * MS_PER_DAY
      );
    } else {
      const timeUntilDeadline = Math.max(
        0,
        deadline.getTime() - currentDate.getTime()
      );
      const timeNeeded = projectDuration * MS_PER_DAY;
      let ratio = timeUntilDeadline / timeNeeded;
      totalWeightedRatio += ratio * projectDuration;
      if (timeNeeded > timeUntilDeadline) {
        const daysLate = Math.ceil(
          (timeNeeded - timeUntilDeadline) / MS_PER_DAY
        );
        totalDaysLate += daysLate;
        projectsLate.push({ project, index, daysLate });
        currentDate = new Date(currentDate.getTime() + timeNeeded);
      } else {
        const daysEarly = Math.floor(
          (timeUntilDeadline - timeNeeded) / MS_PER_DAY
        );
        projectsEarly.push({ project, index, daysEarly });
      }
    }
  });

  const weightedAverageRatio =
    totalDuration > 0 ? totalWeightedRatio / totalDuration : 0;

  return {
    totalDaysLate,
    projectsLate,
    projectsEarly,
    totalDuration,
    weightedAverageRatio,
    projectEndDate: currentDate,
  };
};

```

# src/services/optimizationService.ts

```ts
import { Project } from "../types";
import { getAllShuffledPermutations } from "../utils/arrayUtils";
import { simulateSequence } from "./simulationService";

export const optimizeSequence = (testSequence: Project[]): Project[] => {
  let bestSequences: Array<{
    sequence: Project[];
    weightedAverageRatio: number;
  }> = [];
  let lowestDaysLate = Number.MAX_SAFE_INTEGER;
  let highestWeightedAverageRatio = Number.MIN_SAFE_INTEGER;

  getAllShuffledPermutations(testSequence).forEach((sequence) => {
    const { totalDaysLate: daysLate, weightedAverageRatio } =
      simulateSequence(sequence);

    if (daysLate < lowestDaysLate) {
      bestSequences = [{ sequence, weightedAverageRatio }];
      lowestDaysLate = daysLate;
      highestWeightedAverageRatio = weightedAverageRatio;
    } else if (daysLate === lowestDaysLate) {
      bestSequences.push({ sequence, weightedAverageRatio });
      if (weightedAverageRatio > highestWeightedAverageRatio) {
        highestWeightedAverageRatio = weightedAverageRatio;
      }
    }
  });

  return bestSequences.reduce((best, current) =>
    current.weightedAverageRatio > best.weightedAverageRatio ? current : best
  ).sequence;
};

```

# src/data/data.ts

```ts
// src/data/data.ts

import { Goal, Project, Milestone, Task } from "../types";
import {
  getMilestonesForProject,
  getProjectsForGoal,
  getTasksForMilestone,
} from "../utils/calculationUtils";

// Goals
export const goals: Goal[] = [
  {
    name: "Be a better developer.",
    projects: () => getProjectsForGoal(goals[0], projects),
    status: "in-flight",
  },
];

// Projects
export const projects: Project[] = [
  {
    name: "Website Redesign",
    deadline: new Date("2024-12-31"),
    deadlineType: "soft",
    excitement: 5,
    goal: goals[0],
    milestones: () => getMilestonesForProject(projects[0], milestones),
    status: "in-flight",
    viability: 4,
  },
  {
    name: "Mobile App Development",
    deadline: new Date("2025-06-30"),
    deadlineType: "hard",
    excitement: 3,
    goal: goals[0],
    milestones: () => getMilestonesForProject(projects[1], milestones),
    status: "planned",
    viability: 5,
  },
];

// Milestones
export const milestones: Milestone[] = [
  {
    name: "Design Phase",
    project: projects[0],
    status: "in-flight",
    dependencies: [],
    tasks: () => getTasksForMilestone(milestones[0], tasks),
  },
  {
    name: "Frontend Development",
    project: projects[0],
    status: "planned",
    dependencies: [],
    tasks: () => getTasksForMilestone(milestones[1], tasks),
  },
  {
    name: "Backend Integration",
    project: projects[0],
    status: "planned",
    dependencies: [],
    tasks: () => getTasksForMilestone(milestones[2], tasks),
  },
  {
    name: "App Wireframing",
    project: projects[1],
    status: "planned",
    dependencies: [],
    tasks: () => getTasksForMilestone(milestones[3], tasks),
  },
  {
    name: "Core Functionality",
    project: projects[1],
    status: "planned",
    dependencies: [],
    tasks: () => getTasksForMilestone(milestones[4], tasks),
  },
];

// Tasks
export const tasks: Task[] = [
  {
    name: "Create mood board",
    duration: 4,
    timeSpent: 2,
    status: "in-flight",
    milestone: milestones[0],
    dependencies: [],
  },
  {
    name: "Design homepage mockup",
    duration: 8,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[0],
    dependencies: [],
  },
  {
    name: "Implement responsive layout",
    duration: 16,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[1],
    dependencies: [],
  },
  {
    name: "Develop navigation component",
    duration: 12,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[1],
    dependencies: [],
  },
  {
    name: "Set up API endpoints",
    duration: 20,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[2],
    dependencies: [],
  },
  {
    name: "Implement authentication",
    duration: 24,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[2],
    dependencies: [],
  },
  {
    name: "Create app screens sketch",
    duration: 10,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[3],
    dependencies: [],
  },
  {
    name: "Design user flow diagrams",
    duration: 8,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[3],
    dependencies: [],
  },
  {
    name: "Implement login functionality",
    duration: 15,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[4],
    dependencies: [],
  },
  {
    name: "Develop data synchronization",
    duration: 25 + 300,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[4],
    dependencies: [],
  },
];

// Set up dependencies
milestones[1].dependencies.push(milestones[0]);
milestones[2].dependencies.push(milestones[1]);
milestones[4].dependencies.push(milestones[3]);

tasks[1].dependencies.push(tasks[0]);
tasks[3].dependencies.push(tasks[2]);
tasks[5].dependencies.push(tasks[4]);
tasks[7].dependencies.push(tasks[6]);
tasks[9].dependencies.push(tasks[8]);

```

# src/utils/dateUtils.ts

```ts
import type { Project } from "../types";

export const MS_PER_DAY = 1000 * 60 * 60 * 24;
export const USABLE_HOURS_PER_DAY = 3;

export const getDaysUntilDeadline = (
  project: Project,
  currentDate: Date = new Date()
): number => {
  const { deadline } = project;

  if (!deadline) {
    return Number.MAX_SAFE_INTEGER;
  }

  const diffTime = deadline.getTime() - currentDate.getTime();
  const diffDays = diffTime / MS_PER_DAY;

  // If the difference is less than one day and positive, return 0
  if (diffDays > 0 && diffDays < 1) {
    return 0;
  }

  return Math.floor(diffDays);
};

export const getHoursUntilDeadline = (
  project: Project,
  date: Date = new Date()
): number => {
  const { deadline } = project;
  if (!deadline) {
    return Number.MAX_SAFE_INTEGER;
  }

  const diffTime = deadline.getTime() - date.getTime();
  const diffHours = diffTime / (1000 * 60 * 60);

  // If the difference is less than one day and positive, return 0
  if (diffHours > 0 && diffHours < 24) {
    return 0;
  }

  return Math.floor(diffHours * (USABLE_HOURS_PER_DAY / 24));
};

export const addDays = (
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

```

# src/utils/calculationUtils.ts

```ts
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

```

# src/utils/arrayUtils.ts

```ts
export function* generatePermutations<T>(array: T[]): Generator<T[]> {
  const n = array.length;
  const c = new Array(n).fill(0);
  yield [...array];

  let i = 1;
  while (i < n) {
    if (c[i] < i) {
      const swapIndex = i % 2 === 0 ? 0 : c[i];
      [array[i], array[swapIndex]] = [array[swapIndex], array[i]];
      yield [...array];
      c[i]++;
      i = 1;
    } else {
      c[i] = 0;
      i++;
    }
  }
}

export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const getAllShuffledPermutations = <T>(array: T[]): T[][] =>
  shuffleArray(Array.from(generatePermutations(array)));

```

