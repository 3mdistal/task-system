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
import { Milestone, Task } from "./types";
import { optimizeSequence } from "./services/optimizationService";
import { simulateSequence } from "./services/simulationService";

export function optimizeTasks(tasks: Task[], milestones: Milestone[]) {
  const bestSequence = optimizeSequence(milestones);
  const result = simulateSequence(bestSequence);

  return {
    optimizedSequence: bestSequence,
    statistics: result,
  };
}

```

# tests/utils/dateUtils.test.ts

```ts
import { Milestone } from "../../src/types";
import {
  MS_PER_DAY,
  USABLE_HOURS_PER_DAY,
  getDaysUntilDeadline,
  getHoursUntilDeadline,
  addDays,
} from "../../src/utils/dateUtils";

describe("Milestone Utility Functions", () => {
  const baseMilestone: Milestone = {
    name: "Test Milestone",
    viability: 1,
    excitement: 1,
    project: "Test Project",
  };

  describe("getDaysUntilDeadline", () => {
    it("should return correct number of days for a future hard deadline", () => {
      const milestone: Milestone = {
        ...baseMilestone,
        hard_deadline: "2024-07-10T00:00:00Z",
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(milestone, currentDate)).toBe(3);
    });

    it("should return correct number of days for a future soft deadline", () => {
      const milestone: Milestone = {
        ...baseMilestone,
        soft_deadline: "2024-07-10T00:00:00Z",
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(milestone, currentDate)).toBe(3);
    });

    it("should prioritize hard deadline over soft deadline", () => {
      const milestone: Milestone = {
        ...baseMilestone,
        hard_deadline: "2024-07-10T00:00:00Z",
        soft_deadline: "2024-07-15T00:00:00Z",
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(milestone, currentDate)).toBe(3);
    });

    it("should return MAX_SAFE_INTEGER for invalid date", () => {
      const milestone: Milestone = {
        ...baseMilestone,
        hard_deadline: "invalid date",
      };
      expect(getDaysUntilDeadline(milestone)).toBe(Number.MAX_SAFE_INTEGER);
    });

    it("should return 0 for a deadline that's today", () => {
      const milestone: Milestone = {
        ...baseMilestone,
        hard_deadline: "2024-07-07T12:00:00Z",
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(milestone, currentDate)).toBe(0);
    });

    it("should return negative days for a past deadline", () => {
      const milestone: Milestone = {
        ...baseMilestone,
        hard_deadline: "2024-07-05T00:00:00Z",
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getDaysUntilDeadline(milestone, currentDate)).toBe(-2);
    });

    it("should use current date when not provided", () => {
      const milestone: Milestone = {
        ...baseMilestone,
        hard_deadline: "2024-07-10T00:00:00Z",
      };
      const mockDate = new Date("2024-07-07T00:00:00Z");
      jest.useFakeTimers().setSystemTime(mockDate);
      expect(getDaysUntilDeadline(milestone)).toBe(3);
      jest.useRealTimers();
    });
  });

  describe("getHoursUntilDeadline", () => {
    it("should return correct number of hours until deadline", () => {
      const milestone: Milestone = {
        ...baseMilestone,
        hard_deadline: "2024-07-10T00:00:00Z",
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(milestone, currentDate)).toBe(
        3 * USABLE_HOURS_PER_DAY
      ); // 3 days * 3 usable hours
    });

    it("should return 0 hours for a deadline that's today", () => {
      const milestone: Milestone = {
        ...baseMilestone,
        hard_deadline: "2024-07-07T12:00:00Z",
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(milestone, currentDate)).toBe(0);
    });

    it("should return negative hours for a past deadline", () => {
      const milestone: Milestone = {
        ...baseMilestone,
        hard_deadline: "2024-07-05T00:00:00Z",
      };
      const currentDate = new Date("2024-07-07T00:00:00Z");
      expect(getHoursUntilDeadline(milestone, currentDate)).toBe(
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

# tests/utils/calculationUtils.test.ts

```ts
import { Task, Milestone } from "../../src/types";
import { getHoursUntilDeadline } from "../../src/utils/dateUtils";
import { tasks } from "../../src/index";
import * as calculationUtils from "../../src/utils/calculationUtils";

// Mock the imported modules
jest.mock("../../src/utils/dateUtils");
jest.mock("../../src/index", () => ({
  tasks: [
    { name: "Task 1", duration: 4, milestone: "Milestone 1" },
    { name: "Task 2", duration: 6, milestone: "Milestone 1" },
    { name: "Task 3", duration: 3, milestone: "Milestone 2" },
    { name: "Task 4", duration: 5, milestone: "Milestone 2" },
    { name: "Task 5", duration: 2, milestone: "Milestone 3" },
  ],
}));

describe("Project Management Utilities", () => {
  beforeEach(() => {
    jest.spyOn(calculationUtils, "getTasksForMilestone");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("calculateTotalDuration", () => {
    it("should correctly calculate total duration for given tasks", () => {
      const testTasks: Task[] = [
        { name: "Task 1", duration: 4 },
        { name: "Task 2", duration: 6 },
        { name: "Task 3", duration: 3 },
      ];
      expect(calculationUtils.calculateTotalDuration(testTasks)).toBe(13);
    });

    it("should return 0 for an empty task list", () => {
      expect(calculationUtils.calculateTotalDuration([])).toBe(0);
    });
  });

  describe("calculateDeadlineRatio", () => {
    const mockMilestone: Milestone = {
      name: "Test Milestone",
      viability: 0.8,
      excitement: 0.7,
      project: "Test Project",
    };

    beforeEach(() => {
      (getHoursUntilDeadline as jest.Mock).mockClear();
    });

    it("should calculate correct ratio when hours > duration", () => {
      (getHoursUntilDeadline as jest.Mock).mockReturnValue(20);
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([
        { name: "Task 1", duration: 5 },
        { name: "Task 2", duration: 5 },
      ]);
      const result = calculationUtils.calculateDeadlineRatio(
        mockMilestone,
        new Date()
      );
      expect(result).toBe(2); // 20 hours / 10 hours duration
    });

    it("should calculate correct ratio when hours < duration", () => {
      (getHoursUntilDeadline as jest.Mock).mockReturnValue(5);
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([
        { name: "Task 1", duration: 5 },
        { name: "Task 2", duration: 5 },
      ]);
      const result = calculationUtils.calculateDeadlineRatio(
        mockMilestone,
        new Date()
      );
      expect(result).toBe(0.5); // 5 hours / 10 hours duration
    });

    it("should return 0 when hours until deadline is 0", () => {
      (getHoursUntilDeadline as jest.Mock).mockReturnValue(0);
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([
        { name: "Task 1", duration: 5 },
        { name: "Task 2", duration: 5 },
      ]);
      const result = calculationUtils.calculateDeadlineRatio(
        mockMilestone,
        new Date()
      );
      expect(result).toBe(0);
    });

    it("should return 0 when there are no tasks", () => {
      (getHoursUntilDeadline as jest.Mock).mockReturnValue(10);
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([]);
      const result = calculationUtils.calculateDeadlineRatio(
        mockMilestone,
        new Date()
      );
      expect(result).toBe(0);
    });
  });

  describe("isDeadlineMeetable", () => {
    const mockDate = new Date("2024-07-07");

    beforeEach(() => {
      jest.spyOn(calculationUtils, "calculateDeadlineRatio");
    });

    it("should return true when no deadlines are set", () => {
      const milestone: Milestone = {
        name: "No Deadline",
        viability: 0.8,
        excitement: 0.7,
        project: "Test Project",
      };
      expect(calculationUtils.isDeadlineMeetable(milestone, mockDate)).toBe(
        true
      );
    });

    it("should return true when ratio >= 1", () => {
      const milestone: Milestone = {
        name: "Meetable Deadline",
        viability: 0.8,
        excitement: 0.7,
        project: "Test Project",
        soft_deadline: "2024-07-20",
      };
      (calculationUtils.calculateDeadlineRatio as jest.Mock).mockReturnValue(
        1.5
      );
      expect(calculationUtils.isDeadlineMeetable(milestone, mockDate)).toBe(
        true
      );
    });

    it("should return false when ratio < 1", () => {
      const milestone: Milestone = {
        name: "Unmeetable Deadline",
        viability: 0.8,
        excitement: 0.7,
        project: "Test Project",
        hard_deadline: "2024-07-10",
      };
      (calculationUtils.calculateDeadlineRatio as jest.Mock).mockReturnValue(
        0.5
      );
      expect(calculationUtils.isDeadlineMeetable(milestone, mockDate)).toBe(
        false
      );
    });
  });

  describe("getTasksForMilestone", () => {
    it("should return correct tasks for a given milestone", () => {
      const milestone: Milestone = {
        name: "Milestone 1",
        viability: 0.8,
        excitement: 0.7,
        project: "Test Project",
      };
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([
        { name: "Task 1", duration: 4, milestone: "Milestone 1" },
        { name: "Task 2", duration: 6, milestone: "Milestone 1" },
      ]);
      const result = calculationUtils.getTasksForMilestone(milestone);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Task 1");
      expect(result[1].name).toBe("Task 2");
    });

    it("should return an empty array for a milestone with no tasks", () => {
      const milestone: Milestone = {
        name: "Non-existent Milestone",
        viability: 0.8,
        excitement: 0.7,
        project: "Test Project",
      };
      (calculationUtils.getTasksForMilestone as jest.Mock).mockReturnValue([]);
      const result = calculationUtils.getTasksForMilestone(milestone);
      expect(result).toHaveLength(0);
    });
  });
});

```

# src/utils/dateUtils.ts

```ts
import { Milestone } from "../types";

export const MS_PER_DAY = 1000 * 60 * 60 * 24;
export const USABLE_HOURS_PER_DAY = 3;

export const getDaysUntilDeadline = (
  milestone: Milestone,
  currentDate: Date = new Date()
): number => {
  const deadline = new Date(
    milestone.hard_deadline || milestone.soft_deadline || ""
  );
  if (isNaN(deadline.getTime())) {
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
  milestone: Milestone,
  date: Date = new Date()
): number => {
  const deadline = new Date(
    milestone.hard_deadline || milestone.soft_deadline || ""
  );
  if (isNaN(deadline.getTime())) {
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
import { Task, Milestone } from "../types";
import { getHoursUntilDeadline } from "./dateUtils";
import { tasks } from "../index";

export const calculateTotalDuration = (tasks: Task[]): number =>
  tasks.reduce((total, task) => total + task.duration, 0);

export const calculateDeadlineRatio = (
  milestone: Milestone,
  date: Date
): number => {
  const milestoneTasks = getTasksForMilestone(milestone);
  const duration = calculateTotalDuration(milestoneTasks);
  const hours = getHoursUntilDeadline(milestone, date);

  if (duration === 0) return 0;
  return hours / duration;
};

export const isDeadlineMeetable = (milestone: Milestone, date: Date): boolean =>
  (!milestone.hard_deadline && !milestone.soft_deadline) ||
  calculateDeadlineRatio(milestone, date) >= 1;

export const getTasksForMilestone = (milestone: Milestone): Task[] =>
  tasks.filter((task) => task.milestone === milestone.name);

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
import { MilestoneResult } from "./index";

export interface SimulationResult {
  totalDaysLate: number;
  milestonesLate: MilestoneResult[];
  milestonesEarly: MilestoneResult[];
  totalDuration: number;
  weightedAverageRatio: number;
  projectEndDate: Date;
}

```

# src/types/Project.ts

```ts
import { Goal, Status } from "./";

export interface Project {
  deadline: Date;
  deadlineType: "soft" | "hard";
  goal: Goal;
  name: string;
  status: Status;
}

```

# src/types/MilestoneResult.ts

```ts
import { Milestone } from "./index";

export interface MilestoneResult {
  milestone: Milestone;
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
}

```

# src/types/Goal.ts

```ts
import { Status } from "./";

export interface Goal {
  status: Status;
}

```

# src/data/data.ts

```ts

```

# src/services/simulationService.ts

```ts
import { Milestone, MilestoneResult, SimulationResult } from "../types";
import { MS_PER_DAY, USABLE_HOURS_PER_DAY, addDays } from "../utils/dateUtils";
import {
  calculateTotalDuration,
  getTasksForMilestone,
} from "../utils/calculationUtils";

export const simulateSequence = (milestones: Milestone[]): SimulationResult => {
  let currentDate = new Date();
  let totalDaysLate = 0;
  let milestonesLate: MilestoneResult[] = [];
  let milestonesEarly: MilestoneResult[] = [];
  let totalDuration = 0;
  let totalWeightedRatio = 0;

  milestones.forEach((milestone, index) => {
    const milestoneDuration = calculateTotalDuration(
      getTasksForMilestone(milestone)
    );
    totalDuration += milestoneDuration;

    const deadline = new Date(
      milestone.hard_deadline || milestone.soft_deadline || ""
    );

    if (!isNaN(deadline.getTime())) {
      const timeUntilDeadline = Math.max(
        0,
        deadline.getTime() - currentDate.getTime()
      );
      const timeNeeded =
        (milestoneDuration * MS_PER_DAY) / USABLE_HOURS_PER_DAY;

      let ratio = timeUntilDeadline / timeNeeded;
      totalWeightedRatio += ratio * milestoneDuration;

      if (timeNeeded > timeUntilDeadline) {
        const daysLate = Math.ceil(
          (timeNeeded - timeUntilDeadline) / MS_PER_DAY
        );
        totalDaysLate += daysLate;
        milestonesLate.push({ milestone, index, daysLate });
        currentDate = new Date(currentDate.getTime() + timeNeeded);
      } else {
        const daysEarly = Math.floor(
          (timeUntilDeadline - timeNeeded) / MS_PER_DAY
        );
        milestonesEarly.push({ milestone, index, daysEarly });
        currentDate = new Date(deadline.getTime());
      }
    } else {
      totalWeightedRatio += milestoneDuration;
      currentDate = new Date(
        currentDate.getTime() +
          (milestoneDuration * MS_PER_DAY) / USABLE_HOURS_PER_DAY
      );
    }
  });

  const weightedAverageRatio =
    totalDuration > 0 ? totalWeightedRatio / totalDuration : 0;

  return {
    totalDaysLate,
    milestonesLate,
    milestonesEarly,
    totalDuration,
    weightedAverageRatio,
    projectEndDate: currentDate,
  };
};

```

# src/services/optimizationService.ts

```ts
import { Milestone } from "../types";
import { getAllShuffledPermutations } from "../utils/arrayUtils";
import { simulateSequence } from "./simulationService";

export const optimizeSequence = (testSequence: Milestone[]): Milestone[] => {
  let bestSequences: Array<{
    sequence: Milestone[];
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

