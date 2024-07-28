// src/data/data.ts

import { Goal, Project, Milestone, Task } from "../types";
import {
  getMilestonesForProject,
  getProjectsForGoal,
  getTasksForMilestone,
} from "../utils/calculationUtils";

// Goals
export const goals: Goal[] = [
  {
    name: "Be a better developer.",
    projects: () => getProjectsForGoal(goals[0], projects),
    status: "in-flight",
  },
];

// Projects
export const projects: Project[] = [
  {
    name: "Website Redesign",
    deadline: new Date("2024-12-31"),
    deadlineType: "soft",
    excitement: 5,
    goal: goals[0],
    milestones: () => getMilestonesForProject(projects[0], milestones),
    status: "in-flight",
    viability: 4,
  },
  {
    name: "Mobile App Development",
    deadline: new Date("2025-06-30"),
    deadlineType: "hard",
    excitement: 3,
    goal: goals[0],
    milestones: () => getMilestonesForProject(projects[1], milestones),
    status: "planned",
    viability: 5,
  },
];

// Milestones
export const milestones: Milestone[] = [
  {
    name: "Design Phase",
    project: projects[0],
    status: "in-flight",
    dependencies: [],
    tasks: () => getTasksForMilestone(milestones[0], tasks),
  },
  {
    name: "Frontend Development",
    project: projects[0],
    status: "planned",
    dependencies: [],
    tasks: () => getTasksForMilestone(milestones[1], tasks),
  },
  {
    name: "Backend Integration",
    project: projects[0],
    status: "planned",
    dependencies: [],
    tasks: () => getTasksForMilestone(milestones[2], tasks),
  },
  {
    name: "App Wireframing",
    project: projects[1],
    status: "planned",
    dependencies: [],
    tasks: () => getTasksForMilestone(milestones[3], tasks),
  },
  {
    name: "Core Functionality",
    project: projects[1],
    status: "planned",
    dependencies: [],
    tasks: () => getTasksForMilestone(milestones[4], tasks),
  },
];

// Tasks
export const tasks: Task[] = [
  {
    name: "Create mood board",
    duration: 4,
    timeSpent: 2,
    status: "in-flight",
    milestone: milestones[0],
    dependencies: [],
  },
  {
    name: "Design homepage mockup",
    duration: 8,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[0],
    dependencies: [],
  },
  {
    name: "Implement responsive layout",
    duration: 16,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[1],
    dependencies: [],
  },
  {
    name: "Develop navigation component",
    duration: 12,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[1],
    dependencies: [],
  },
  {
    name: "Set up API endpoints",
    duration: 20,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[2],
    dependencies: [],
  },
  {
    name: "Implement authentication",
    duration: 24,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[2],
    dependencies: [],
  },
  {
    name: "Create app screens sketch",
    duration: 10,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[3],
    dependencies: [],
  },
  {
    name: "Design user flow diagrams",
    duration: 8,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[3],
    dependencies: [],
  },
  {
    name: "Implement login functionality",
    duration: 15,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[4],
    dependencies: [],
  },
  {
    name: "Develop data synchronization",
    duration: 25 + 300,
    timeSpent: 0,
    status: "planned",
    milestone: milestones[4],
    dependencies: [],
  },
];

// Set up dependencies
milestones[1].dependencies.push(milestones[0]);
milestones[2].dependencies.push(milestones[1]);
milestones[4].dependencies.push(milestones[3]);

tasks[1].dependencies.push(tasks[0]);
tasks[3].dependencies.push(tasks[2]);
tasks[5].dependencies.push(tasks[4]);
tasks[7].dependencies.push(tasks[6]);
tasks[9].dependencies.push(tasks[8]);
