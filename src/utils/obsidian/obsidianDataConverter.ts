import { Goal, Project, Milestone, Task } from "../../types";
import {
  ObsidianDataViewData,
  ObsidianGoal,
  ObsidianProject,
  ObsidianMilestone,
  ObsidianTask,
} from "../../types/Obsidian";
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
  console.log("Starting data conversion...");
  console.log("Input data:", JSON.stringify(data, null, 2));

  const goals: Goal[] = (data.goals?.values || []).map(convertGoal);
  console.log(
    `Converted ${goals.length} goals:`,
    JSON.stringify(goals, null, 2)
  );

  const projects: Project[] = (data.projects?.values || []).map(convertProject);
  console.log(
    `Converted ${projects.length} projects:`,
    JSON.stringify(projects, null, 2)
  );

  const milestones: Milestone[] = (data.milestones?.values || []).map(
    convertMilestone
  );
  console.log(
    `Converted ${milestones.length} milestones:`,
    JSON.stringify(milestones, null, 2)
  );

  const tasks: Task[] = (data.tasks?.values || []).map(convertTask);
  console.log(
    `Converted ${tasks.length} tasks:`,
    JSON.stringify(tasks, null, 2)
  );

  console.log("Linking projects to goals...");
  projects.forEach((project) => {
    if (project.goalId) {
      const goal = goals.find((g) => g.id === project.goalId);
      if (goal) {
        goal.projectIds.push(project.id);
        console.log(`Linked project ${project.id} to goal ${goal.id}`);
      } else {
        console.log(
          `Warning: Goal ${project.goalId} not found for project ${project.id}. Removing invalid goalId.`
        );
        project.goalId = undefined;
      }
    }
  });

  console.log("Linking milestones to projects...");
  milestones.forEach((milestone) => {
    const project = projects.find((p) => p.id === milestone.projectId);
    if (project) {
      project.milestoneIds.push(milestone.id);
      console.log(`Linked milestone ${milestone.id} to project ${project.id}`);
    } else {
      console.log(`Warning: Project not found for milestone ${milestone.id}`);
    }
  });

  console.log("Linking tasks to milestones...");
  tasks.forEach((task) => {
    if (task.milestoneId) {
      const milestone = milestones.find((m) => m.id === task.milestoneId);
      if (milestone) {
        milestone.taskIds.push(task.id);
        console.log(`Linked task ${task.id} to milestone ${milestone.id}`);
      } else {
        console.log(`Warning: Milestone not found for task ${task.id}`);
      }
    }
  });

  console.log("Data conversion completed.");
  console.log(
    "Final converted data:",
    JSON.stringify({ goals, projects, milestones, tasks }, null, 2)
  );
  return { goals, projects, milestones, tasks };
}

function convertGoal(obsidianGoal: ObsidianGoal): Goal {
  console.log(`Converting goal: ${obsidianGoal.name}`);
  return {
    type: "goal",
    id: obsidianGoal.id || "",
    name: obsidianGoal.name || "",
    projectIds: [],
    status: ensureValidStatus(obsidianGoal.status),
  };
}

function convertProject(obsidianProject: ObsidianProject): Project {
  console.log(`Converting project: ${obsidianProject.name}`);
  return {
    type: "project",
    id: obsidianProject.id || "",
    name: obsidianProject.name || "",
    deadline: obsidianProject.deadline
      ? new Date(obsidianProject.deadline)
      : undefined,
    deadlineType: obsidianProject.deadlineType || undefined,
    excitement: ensureValidExcitement(obsidianProject.excitement),
    viability: ensureValidViability(obsidianProject.viability),
    status: ensureValidStatus(obsidianProject.status),
    milestoneIds: [],
    goalId: obsidianProject.goal?.path || undefined,
  };
}

function convertMilestone(obsidianMilestone: ObsidianMilestone): Milestone {
  console.log(`Converting milestone: ${obsidianMilestone.name}`);
  return {
    type: "milestone",
    id: obsidianMilestone.id || "",
    name: obsidianMilestone.name || "",
    projectId: obsidianMilestone.project?.path || "",
    dependencyIds:
      obsidianMilestone.dependencies?.map((dep) => dep.path || "") || [],
    status: ensureValidStatus(obsidianMilestone.status),
    taskIds: [],
  };
}

function convertTask(obsidianTask: ObsidianTask): Task {
  console.log(`Converting task: ${obsidianTask.name}`);
  return {
    type: "task",
    id: obsidianTask.id || "",
    name: obsidianTask.name || "",
    status: ensureValidStatus(obsidianTask.status),
    completionDate: undefined,
    dependencyIds:
      obsidianTask.dependencies?.map((dep) => dep.path || "") || [],
    duration: obsidianTask.duration || 0,
    timeSpent: obsidianTask.timeSpent || obsidianTask.timespent || 0,
    milestoneId: obsidianTask.milestone?.path || undefined,
  };
}
