import { Goal, Project, Milestone, Task } from "../types";
import {
  ObsidianDataViewData,
  ObsidianGoal,
  ObsidianProject,
  ObsidianMilestone,
  ObsidianTask,
} from "../types/Obsidian";
import {
  ensureValidStatus,
  ensureValidExcitement,
  ensureValidViability,
} from "./obsidianHelpers";

export function convertObsidianData(data: ObsidianDataViewData): {
  goals: Goal[];
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
} {
  const goals: Goal[] = data.goals.values.map(convertGoal);
  const projects: Project[] = data.projects.values.map(convertProject);
  const milestones: Milestone[] = data.milestones.values.map(convertMilestone);
  const tasks: Task[] = data.tasks.values.map(convertTask);

  // Link projects to goals
  projects.forEach((project) => {
    if (project.goalId) {
      const goal = goals.find((g) => g.id === project.goalId);
      if (goal) {
        goal.projectIds.push(project.id);
      }
    }
  });

  // Link milestones to projects
  milestones.forEach((milestone) => {
    const project = projects.find((p) => p.id === milestone.projectId);
    if (project) {
      project.milestoneIds.push(milestone.id);
    }
  });

  // Link tasks to milestones
  tasks.forEach((task) => {
    if (task.milestoneId) {
      const milestone = milestones.find((m) => m.id === task.milestoneId);
      if (milestone) {
        milestone.taskIds.push(task.id);
      }
    }
  });

  return { goals, projects, milestones, tasks };
}

function convertGoal(obsidianGoal: ObsidianGoal): Goal {
  return {
    type: "goal",
    id: obsidianGoal.file.path,
    name: obsidianGoal.file.name,
    projectIds: [],
    status: ensureValidStatus(obsidianGoal.status),
  };
}

function convertProject(obsidianProject: ObsidianProject): Project {
  return {
    type: "project",
    id: obsidianProject.file.path,
    name: obsidianProject.file.name,
    deadline: obsidianProject.deadline
      ? new Date(obsidianProject.deadline)
      : undefined,
    deadlineType: obsidianProject.deadlineType,
    excitement: ensureValidExcitement(obsidianProject.excitement),
    viability: ensureValidViability(obsidianProject.viability),
    status: ensureValidStatus(obsidianProject.status),
    milestoneIds: [],
    goalId: obsidianProject.goal ? obsidianProject.goal.path : undefined,
  };
}

function convertMilestone(obsidianMilestone: ObsidianMilestone): Milestone {
  return {
    type: "milestone",
    id: obsidianMilestone.file.path,
    name: obsidianMilestone.file.name,
    projectId: obsidianMilestone.project.path,
    dependencyIds: obsidianMilestone.dependencies?.map((dep) => dep.path) || [],
    status: ensureValidStatus(obsidianMilestone.status),
    taskIds: [],
  };
}

function convertTask(obsidianTask: ObsidianTask): Task {
  return {
    type: "task",
    id: obsidianTask.file.path,
    name: obsidianTask.file.name,
    status: ensureValidStatus(obsidianTask.status),
    completionDate: undefined,
    dependencyIds: obsidianTask.dependencies?.map((dep) => dep.path) || [],
    duration: obsidianTask.duration || 0,
    timeSpent: obsidianTask.timeSpent || obsidianTask.timespent || 0,
    milestoneId: obsidianTask.milestone
      ? obsidianTask.milestone.path
      : undefined,
  };
}
