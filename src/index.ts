import { ObsidianDataViewData, OptimizationResult } from "./types";
import { optimizeSequence } from "./services/optimizationService";
import { simulateTaskSequence } from "./services/simulationService";
import { convertObsidianData } from "./utils/obsidian/obsidianDataConverter";
import { checkDeadlineStatus } from "./utils/projectUtils";
import { calculateCrunchInfo } from "./utils/projectUtils";
import { logger } from "./utils/logger";

export function optimizeTasks(
  rawData: ObsidianDataViewData,
  convertData = convertObsidianData,
  optimize = optimizeSequence,
  simulate = simulateTaskSequence
): OptimizationResult {
  const { projects, goals, milestones, tasks } = convertData(rawData);
  const bestSequence = optimize(projects, goals, milestones, tasks);
  const result = simulate(bestSequence, projects, goals, milestones);

  if (!result || !result.completedTasks || !result.endDate) {
    logger.error("Invalid simulation result:", result);
    return createEmptyOptimizationResult();
  }

  const deadlineStatus = checkDeadlineStatus(result.completedTasks, projects);
  const crunchInfo = calculateCrunchInfo(projects, result.endDate);

  const optimizationResult: OptimizationResult = {
    optimizedSequence: bestSequence,
    statistics: result,
    deadlineStatus,
    crunchInfo,
  };

  checkDeadlines(deadlineStatus);

  return optimizationResult;
}

function createEmptyOptimizationResult(): OptimizationResult {
  return {
    optimizedSequence: [],
    statistics: {
      score: 0,
      completedTasks: [],
      endDate: new Date(),
    },
    deadlineStatus: {
      allHardDeadlinesMet: false,
      allSoftDeadlinesMet: false,
      missedHardDeadlines: [],
      missedSoftDeadlines: [],
    },
    crunchInfo: {
      earliestCrunch: 0,
      latestCrunch: 0,
      averageCrunch: 0,
      crunchByProject: {},
    },
  };
}

function checkDeadlines(
  deadlineStatus: OptimizationResult["deadlineStatus"]
): void {
  if (
    !deadlineStatus.allHardDeadlinesMet ||
    !deadlineStatus.allSoftDeadlinesMet
  ) {
    logger.error(
      "ERROR: Not all deadlines are met. Task rescheduling may be necessary."
    );
  }
}
