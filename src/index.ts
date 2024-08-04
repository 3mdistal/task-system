import { ObsidianDataViewData, OptimizationResult } from "./types";
import { optimizeSequence } from "./services/optimizationService";
import { simulateTaskSequence } from "./services/simulationService";
import { convertObsidianData } from "./utils/obsidian/obsidianDataConverter";
import { checkDeadlineStatus } from "./utils/dateUtils";
import { calculateCrunchInfo } from "./utils/crunchUtils";
import rawData from "./data/rawData.json";

export function optimizeTasks(
  rawData: ObsidianDataViewData
): OptimizationResult {
  const { projects, milestones, tasks } = convertObsidianData(rawData);
  const bestSequence = optimizeSequence(projects, milestones, tasks);
  const result = simulateTaskSequence(bestSequence, projects, milestones);

  if (!result || !result.completedTasks || !result.endDate) {
    console.error("Invalid simulation result:", result);
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

  logOptimizationResult(optimizationResult);
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

function logOptimizationResult(result: OptimizationResult): void {
  console.log("Optimization Result:", JSON.stringify(result, null, 2));
}

function checkDeadlines(
  deadlineStatus: OptimizationResult["deadlineStatus"]
): void {
  if (
    !deadlineStatus.allHardDeadlinesMet ||
    !deadlineStatus.allSoftDeadlinesMet
  ) {
    console.error(
      "ERROR: Not all deadlines are met. Task rescheduling may be necessary."
    );
  }
}

const data = rawData as ObsidianDataViewData;
optimizeTasks(data);
