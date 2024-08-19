import { ObsidianDataViewData } from "../types/Obsidian";
import { Goal, Project, Milestone, Task } from "../types";
import {
  ensureValidStatus,
  ensureValidExcitement,
  ensureValidViability,
} from "./obsidian/obsidianHelpers";

export function convertObsidianData(data: ObsidianDataViewData) {
  const goals: Goal[] = data.goals.values.map((goalData) => ({
    type: "goal",
    id: goalData.file.path,
    name: goalData.file.name,
    projectIds: [],
    status: ensureValidStatus(goalData.status),
  }));

  const projects: Project[] = data.projects.values.map((projectData) => ({
    type: "project",
    id: projectData.file.path,
    name: projectData.file.name,
    deadline: projectData.deadline ? new Date(projectData.deadline) : undefined,
    deadlineType: projectData.deadlineType,
    excitement: ensureValidExcitement(projectData.excitement),
    viability: ensureValidViability(projectData.viability),
    status: ensureValidStatus(projectData.status),
    milestoneIds: [],
    goalId: projectData.goal ? projectData.goal.path : undefined,
  }));

  const milestones: Milestone[] = data.milestones.values.map(
    (milestoneData) => ({
      type: "milestone",
      id: milestoneData.file.path,
      name: milestoneData.file.name,
      projectId: milestoneData.project.path,
      dependencyIds: milestoneData.dependencies?.map((dep) => dep.path) || [],
      status: ensureValidStatus(milestoneData.status),
      taskIds: [],
    })
  );

  const tasks: Task[] = data.tasks.values.map((taskData) => ({
    type: "task",
    id: taskData.file.path,
    name: taskData.file.name,
    status: ensureValidStatus(taskData.status),
    completionDate: undefined,
    dependencyIds: taskData.dependencies?.map((dep) => dep.path) || [],
    duration: taskData.duration || 0,
    timeSpent: taskData.timeSpent || 0,
    milestoneId: taskData.milestone ? taskData.milestone.path : undefined,
  }));

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
