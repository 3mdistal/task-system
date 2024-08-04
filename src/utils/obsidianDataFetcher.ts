import {
  ObsidianDataViewData,
  ObsidianGoal,
  ObsidianProject,
  ObsidianMilestone,
  ObsidianTask,
  ObsidianDataViewResult,
} from "../types/Obsidian";
import rawData from "../data/rawData.json";

export async function fetchObsidianData(): Promise<ObsidianDataViewData> {
  return {
    goals: createDataViewResult<ObsidianGoal>(rawData.goals),
    projects: createDataViewResult<ObsidianProject>(rawData.projects),
    milestones: createDataViewResult<ObsidianMilestone>(rawData.milestones),
    tasks: createDataViewResult<ObsidianTask>(rawData.tasks),
  };
}

function createDataViewResult<T>(data: any): ObsidianDataViewResult<T> {
  return {
    values: data.values as T[],
    settings: data.settings || {},
    length: data.values.length,
  };
}
