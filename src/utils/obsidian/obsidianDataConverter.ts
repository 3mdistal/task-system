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
  ensureValidReference,
} from "./obsidianHelpers";
import { logger } from "../logger";

export function convertObsidianData(data: ObsidianDataViewData): {
  goals: Goal[];
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
} {
  logger.verbose("Converting Obsidian data:", data);
  const goals: Goal[] = (data.goals?.values || []).map(convertGoal);
  const projects: Project[] = (data.projects?.values || []).map(convertProject);
  const milestones: Milestone[] = (data.milestones?.values || []).map(
    convertMilestone
  );
  const tasks: Task[] = (data.tasks?.values || []).map(convertTask);

  projects.forEach((project) => {
    project.goalId = ensureValidReference(
      project.goalId,
      goals,
      "Goal",
      "Project",
      project.id
    );
    if (project.goalId) {
      const goal = goals.find((g) => g.id === project.goalId);
      if (goal) goal.projectIds.push(project.id);
    }
  });

  milestones.forEach((milestone) => {
    milestone.projectId = ensureValidReference(
      milestone.projectId,
      projects,
      "Project",
      "Milestone",
      milestone.id
    );
    if (milestone.projectId) {
      const project = projects.find((p) => p.id === milestone.projectId);
      if (project) project.milestoneIds.push(milestone.id);
    }
    milestone.dependencyIds = milestone.dependencyIds.filter((depId) =>
      ensureValidReference(
        depId,
        milestones,
        "Milestone",
        "Milestone",
        milestone.id
      )
    );
  });

  tasks.forEach((task) => {
    task.milestoneId = ensureValidReference(
      task.milestoneId,
      milestones,
      "Milestone",
      "Task",
      task.id
    );
    if (task.milestoneId) {
      const milestone = milestones.find((m) => m.id === task.milestoneId);
      if (milestone) milestone.taskIds.push(task.id);
    }
    task.dependencyIds = task.dependencyIds.filter((depId) =>
      ensureValidReference(depId, tasks, "Task", "Task", task.id)
    );
  });

  return { goals, projects, milestones, tasks };
}

function convertGoal(obsidianGoal: ObsidianGoal): Goal {
  return {
    type: "goal",
    id: obsidianGoal.id || "",
    name: obsidianGoal.name || "",
    projectIds: [],
    status: ensureValidStatus(obsidianGoal.status),
  };
}

function convertProject(obsidianProject: ObsidianProject): Project {
  let deadline: Date | undefined = undefined;
  if (obsidianProject.deadline) {
    const parsedDate = new Date(obsidianProject.deadline);
    if (!isNaN(parsedDate.getTime())) {
      deadline = new Date(parsedDate.getTime());
    }
  }

  return {
    type: "project",
    id: obsidianProject.id,
    name: obsidianProject.name,
    deadline: deadline,
    deadlineType: obsidianProject.deadlineType || undefined,
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
    id: obsidianMilestone.id || "",
    name: obsidianMilestone.name || "",
    projectId: obsidianMilestone.project?.path || undefined,
    dependencyIds:
      obsidianMilestone.dependencies?.map((dep) => dep.path || "") || [],
    status: ensureValidStatus(obsidianMilestone.status),
    taskIds: [],
  };
}

function convertTask(obsidianTask: ObsidianTask): Task {
  return {
    type: "task",
    id: obsidianTask.id || "",
    name: obsidianTask.name || "",
    status: ensureValidStatus(obsidianTask.status),
    completionDate: undefined,
    dependencyIds:
      obsidianTask.dependencies?.map((dep) => dep.path || "") || [],
    duration: obsidianTask.duration || 0,
    timeSpent: obsidianTask.timeSpent || 0,
    milestoneId: obsidianTask.milestone?.path || undefined,
  };
}
