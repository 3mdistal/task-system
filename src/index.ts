import { Project, Task, ObsidianDataViewData } from "./types";
import { optimizeSequence } from "./services/optimizationService";
import { simulateTaskSequence } from "./services/simulationService";
import { convertObsidianData } from "./utils/obsidian/obsidianDataConverter";
interface OptimizationResult {
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

interface CrunchInfo {
  earliestCrunch: number;
  latestCrunch: number;
  averageCrunch: number;
  crunchByProject: { [projectName: string]: number };
}

export function optimizeTasks(
  rawData: ObsidianDataViewData
): OptimizationResult {
  const { projects } = convertObsidianData(rawData);
  const bestSequence = optimizeSequence(projects);
  const result = simulateTaskSequence(bestSequence);

  if (!result || !result.completedTasks || !result.endDate) {
    console.error("Invalid simulation result:", result);
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

  const deadlineStatus = checkDeadlineStatus(result.completedTasks);
  const crunchInfo = calculateCrunchInfo(projects, result.endDate);

  const optimizationResult: OptimizationResult = {
    optimizedSequence: bestSequence,
    statistics: result,
    deadlineStatus,
    crunchInfo,
  };

  console.log(
    "Optimization Result:",
    JSON.stringify(optimizationResult, null, 2)
  );

  if (
    !deadlineStatus.allHardDeadlinesMet ||
    !deadlineStatus.allSoftDeadlinesMet
  ) {
    console.error(
      "ERROR: Not all deadlines are met. Task rescheduling may be necessary."
    );
  }

  return optimizationResult;
}

export function checkDeadlineStatus(
  completedTasks: Task[]
): OptimizationResult["deadlineStatus"] {
  const status = {
    allHardDeadlinesMet: true,
    allSoftDeadlinesMet: true,
    missedHardDeadlines: [] as string[],
    missedSoftDeadlines: [] as string[],
  };

  completedTasks.forEach((task) => {
    const project = task.milestone?.project;
    if (project && project.deadline && task.completionDate) {
      if (task.completionDate > project.deadline) {
        if (project.deadlineType === "hard") {
          status.allHardDeadlinesMet = false;
          status.missedHardDeadlines.push(
            `${project.name}: ${project.deadline.toISOString()}`
          );
        } else {
          status.allSoftDeadlinesMet = false;
          status.missedSoftDeadlines.push(
            `${project.name}: ${project.deadline.toISOString()}`
          );
        }
      }
    }
  });

  return status;
}

export function calculateCrunchInfo(
  projects: Project[],
  endDate: Date
): CrunchInfo {
  const projectsWithDeadlines = projects.filter((p) => p.deadline);

  if (projectsWithDeadlines.length === 0) {
    return {
      earliestCrunch: 0,
      latestCrunch: 0,
      averageCrunch: 0,
      crunchByProject: {},
    };
  }

  const crunchByProject = projectsWithDeadlines.reduce((acc, project) => {
    const crunch = Math.floor(
      (project.deadline!.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    acc[project.name] = crunch;
    return acc;
  }, {} as { [projectName: string]: number });

  const crunchValues = Object.values(crunchByProject);

  return {
    earliestCrunch: Math.min(...crunchValues),
    latestCrunch: Math.max(...crunchValues),
    averageCrunch: Math.round(
      crunchValues.reduce((sum, value) => sum + value, 0) / crunchValues.length
    ),
    crunchByProject,
  };
}

optimizeTasks(projects);
