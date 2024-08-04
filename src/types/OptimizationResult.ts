import type { Task, CrunchInfo } from "./";

export interface OptimizationResult {
  optimizedSequence: Task[];
  statistics: {
    score: number;
    completedTasks: Task[];
    endDate: Date;
  };
  deadlineStatus: {
    allHardDeadlinesMet: boolean;
    allSoftDeadlinesMet: boolean;
    missedHardDeadlines: string[];
    missedSoftDeadlines: string[];
  };
  crunchInfo: CrunchInfo;
}
