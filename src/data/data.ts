import { Goal, Project, Milestone, Task } from "../types";
import { convertObsidianData } from "../utils/obsidian/obsidianDataConverter";
import { ObsidianDataViewData } from "../types/Obsidian";
import { fetchObsidianData } from "../utils/obsidian/obsidianDataFetcher";
import { isGoal, isProject, isMilestone, isTask } from "../utils/typeGuards";

let goals: Goal[] = [];
let projects: Project[] = [];
let milestones: Milestone[] = [];
let tasks: Task[] = [];

export const loadData = async (): Promise<{
  goals: Goal[];
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
}> => {
  const obsidianData: ObsidianDataViewData = await fetchObsidianData();
  const convertedData = convertObsidianData(obsidianData);
  goals = convertedData.goals.filter(isGoal);
  projects = convertedData.projects.filter(isProject);
  milestones = convertedData.milestones.filter(isMilestone);
  tasks = convertedData.tasks.filter(isTask);
  return { goals, projects, milestones, tasks };
};

export { goals, projects, milestones, tasks };

// Initialize data
loadData().catch((error) => console.error("Failed to load data:", error));
