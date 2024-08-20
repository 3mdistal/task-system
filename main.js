/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => OptimizeTasksPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/utils/dateUtils.ts
var MS_PER_DAY = 1e3 * 60 * 60 * 24;
var USABLE_HOURS_PER_DAY = 3;
var getDaysUntilDeadline = (project, currentDate = new Date()) => {
  const { deadline } = project;
  if (!deadline) {
    return Number.MAX_SAFE_INTEGER;
  }
  const deadlineUTC = Date.UTC(
    deadline.getUTCFullYear(),
    deadline.getUTCMonth(),
    deadline.getUTCDate()
  );
  const currentUTC = Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate()
  );
  const diffTime = deadlineUTC - currentUTC;
  const diffDays = diffTime / MS_PER_DAY;
  return Math.floor(diffDays);
};
var addDays = (duration, currentDate) => {
  const daysToAdd = Math.floor(duration / USABLE_HOURS_PER_DAY);
  const hoursUsed = duration % USABLE_HOURS_PER_DAY;
  const newDate = new Date(currentDate);
  newDate.setUTCDate(newDate.getUTCDate() + daysToAdd);
  return {
    date: newDate,
    hoursUsed
  };
};

// src/utils/calculationUtils.ts
var calculateTaskScore = (task, completionDate, allMilestones, allProjects) => {
  const milestone = allMilestones.find((m) => m.id === task.milestoneId);
  const project = milestone ? allProjects.find((p) => p.id === milestone.projectId) : void 0;
  if (!project)
    return 0;
  const daysUntilDeadline = getDaysUntilDeadline(project, completionDate);
  const deadlineScore = project.deadlineType === "hard" ? daysUntilDeadline >= 0 ? 100 : -1e3 : Math.max(-100, daysUntilDeadline * 10);
  return deadlineScore + project.excitement * 20 + project.viability * 20 + (task.status === "in-flight" ? 50 : 0);
};

// src/utils/logger.ts
var Logger = class {
  constructor() {
    this.logLevel = "normal";
  }
  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  setLogLevel(level) {
    this.logLevel = level;
    console.log(`Log level set to: ${level}`);
  }
  error(...args) {
    if (this.logLevel !== "off") {
      console.error(...args);
    }
  }
  warn(...args) {
    if (this.logLevel === "normal" || this.logLevel === "verbose") {
      console.warn(...args);
    }
  }
  log(...args) {
    if (this.logLevel === "normal" || this.logLevel === "verbose") {
      console.log(...args);
    }
  }
  verbose(...args) {
    if (this.logLevel === "verbose") {
      console.log("[VERBOSE]", ...args);
    }
  }
};
var logger = Logger.getInstance();

// src/services/simulationService.ts
var simulateTaskSequence = (tasks, projects, goals, milestones) => {
  const state = initializeSimulation(projects);
  const remainingTasks = [...tasks];
  while (remainingTasks.length > 0) {
    let taskProcessed = false;
    for (let i = 0; i < remainingTasks.length; i++) {
      const task = remainingTasks[i];
      if (canStartTask(task, state.completedTasks)) {
        processTask(task, state, projects, milestones, goals);
        remainingTasks.splice(i, 1);
        i--;
        taskProcessed = true;
      }
    }
    if (!taskProcessed) {
      logger.warn("No tasks could be processed. Breaking loop.");
      break;
    }
  }
  return finalizeSimulation(state);
};
var initializeSimulation = (projects) => ({
  currentDate: new Date(),
  totalScore: 0,
  completedTasks: [],
  projectDeadlines: new Map(
    projects.map((project) => [
      project.id,
      project.deadline || new Date(864e13)
    ])
  )
});
var processTask = (task, state, projects, milestones, goals) => {
  const { projectId, newDate } = getProjectAndNewDate(task, state, milestones);
  updateSimulationState(task, newDate, state, projects, milestones, goals);
};
var getProjectAndNewDate = (task, state, milestones) => {
  const milestone = milestones.find((m) => m.id === task.milestoneId);
  const projectId = milestone == null ? void 0 : milestone.projectId;
  const { date: newDate } = addDays(task.duration, state.currentDate);
  return { projectId, newDate };
};
var updateSimulationState = (task, newDate, state, projects, milestones, goals) => {
  state.currentDate = newDate;
  state.totalScore += calculateTaskScore(task, newDate, milestones, projects);
  state.completedTasks.push({ ...task, completionDate: newDate });
  const milestone = milestones.find((m) => m.id === task.milestoneId);
  const project = projects.find((p) => p.id === (milestone == null ? void 0 : milestone.projectId));
  if (project && isProjectCompleted(project, state.completedTasks, milestones, goals)) {
    state.projectDeadlines.set(project.id, newDate);
  }
};
var finalizeSimulation = (state) => ({
  score: state.totalScore,
  completedTasks: state.completedTasks,
  endDate: state.currentDate
});
var canStartTask = (task, completedTasks) => {
  return task.dependencyIds.every(
    (depId) => completedTasks.some((completedTask) => completedTask.id === depId)
  );
};
var isProjectCompleted = (project, completedTasks, milestones, goals) => {
  const projectMilestones = milestones.filter(
    (m) => m.projectId === project.id
  );
  const projectTasks = projectMilestones.flatMap(
    (milestone) => milestone.taskIds
  );
  return projectTasks.every(
    (taskId) => completedTasks.some((completedTask) => completedTask.id === taskId)
  );
};

// src/services/optimizationService.ts
var optimizeSequence = (projects, goals, milestones, tasks) => {
  const allTasks = getAllTasksFromProjects(projects, milestones, tasks);
  const strategies = [
    {
      name: "goals",
      items: getUniqueGoals(allTasks, milestones, projects),
      getItemId: (task) => {
        const milestone = milestones.find((m) => m.id === task.milestoneId);
        if (milestone) {
          const project = projects.find((p) => p.id === milestone.projectId);
          return project == null ? void 0 : project.goalId;
        }
        return void 0;
      }
    },
    {
      name: "projects",
      items: getUniqueProjects(allTasks, milestones),
      getItemId: (task) => {
        const milestone = milestones.find((m) => m.id === task.milestoneId);
        if (milestone) {
          return milestone.projectId;
        }
        return void 0;
      }
    },
    {
      name: "milestones",
      items: getUniqueMilestones(allTasks),
      getItemId: (task) => task.milestoneId
    },
    {
      name: "deadlines",
      items: getUniqueDeadlines(projects),
      getItemId: (task) => {
        var _a;
        const milestone = milestones.find((m) => m.id === task.milestoneId);
        if (milestone) {
          const project = projects.find((p) => p.id === milestone.projectId);
          return (_a = project == null ? void 0 : project.deadline) == null ? void 0 : _a.toISOString();
        }
        return void 0;
      }
    }
  ];
  let bestResult = null;
  let bestSequence = [];
  for (const strategy of strategies) {
    const alternatingSequence = generateAlternatingSequence(
      allTasks,
      strategy.items,
      strategy.getItemId
    );
    const result = simulateTaskSequence(
      alternatingSequence,
      projects,
      goals,
      milestones
    );
    if (!bestResult || result.score > bestResult.score) {
      bestResult = result;
      bestSequence = alternatingSequence;
    }
  }
  const completionOrder = new Map(
    bestResult.completedTasks.map((task, index) => [task.id, index])
  );
  return bestSequence.sort((a, b) => {
    var _a, _b;
    const orderA = (_a = completionOrder.get(a.id)) != null ? _a : Infinity;
    const orderB = (_b = completionOrder.get(b.id)) != null ? _b : Infinity;
    return orderA - orderB;
  });
};
var generateAlternatingSequence = (tasks, items, getItemId) => {
  const sequence = [];
  const remainingTasks = new Set(tasks);
  const itemsArray = Array.from(items);
  let currentIndex = 0;
  while (remainingTasks.size > 0) {
    let taskAdded = false;
    for (let i = 0; i < itemsArray.length; i++) {
      const currentItemId = itemsArray[(currentIndex + i) % itemsArray.length];
      const tasksForCurrentItem = Array.from(remainingTasks).filter(
        (t) => getItemId(t) === currentItemId
      );
      if (tasksForCurrentItem.length > 0) {
        const task = tasksForCurrentItem[Math.floor(Math.random() * tasksForCurrentItem.length)];
        sequence.push(task);
        remainingTasks.delete(task);
        taskAdded = true;
        break;
      }
    }
    if (!taskAdded) {
      const nextTask = Array.from(remainingTasks)[0];
      sequence.push(nextTask);
      remainingTasks.delete(nextTask);
    }
    currentIndex = (currentIndex + 1) % itemsArray.length;
  }
  return sequence;
};
var getAllTasksFromProjects = (projects, milestones, tasks) => {
  return projects.flatMap(
    (project) => project.milestoneIds.flatMap((milestoneId) => {
      const milestone = milestones.find((m) => m.id === milestoneId);
      return milestone ? milestone.taskIds.map((taskId) => tasks.find((t) => t.id === taskId)).filter((t) => t !== void 0) : [];
    })
  );
};
var getUniqueGoals = (tasks, milestones, projects) => {
  const goalIds = /* @__PURE__ */ new Set();
  tasks.forEach((task) => {
    const milestone = milestones.find((m) => m.id === task.milestoneId);
    if (milestone) {
      const project = projects.find((p) => p.id === milestone.projectId);
      if (project && project.goalId) {
        goalIds.add(project.goalId);
      }
    }
  });
  return goalIds;
};
var getUniqueProjects = (tasks, milestones) => {
  const projectIds = /* @__PURE__ */ new Set();
  tasks.forEach((task) => {
    const milestone = milestones.find((m) => m.id === task.milestoneId);
    if (milestone) {
      if (milestone.projectId) {
        projectIds.add(milestone.projectId);
      }
    }
  });
  return projectIds;
};
var getUniqueMilestones = (tasks) => {
  const milestoneIds = /* @__PURE__ */ new Set();
  tasks.forEach((task) => {
    if (task.milestoneId) {
      milestoneIds.add(task.milestoneId);
    }
  });
  return milestoneIds;
};
var getUniqueDeadlines = (projects) => {
  const deadlines = /* @__PURE__ */ new Set();
  projects.forEach((project) => {
    if (project.deadline) {
      deadlines.add(project.deadline.toISOString());
    }
  });
  return deadlines;
};

// src/utils/obsidian/obsidianHelpers.ts
function ensureValidStatus(status) {
  const validStatuses = [
    "raw",
    "backlog",
    "planned",
    "in-flight",
    "complete",
    "archived"
  ];
  return validStatuses.includes(status) ? status : "backlog";
}
function ensureValidExcitement(excitement) {
  const validExcitements = [1, 2, 3, 4, 5];
  return validExcitements.includes(excitement) ? excitement : 3;
}
function ensureValidViability(viability) {
  const validViabilities = [1, 2, 3, 4, 5];
  return validViabilities.includes(viability) ? viability : 3;
}
function ensureValidReference(referenceId, collection, entityType, parentType, parentId) {
  if (!referenceId)
    return void 0;
  const found = collection.some((item) => item.id === referenceId);
  if (!found) {
    logger.warn(
      `Warning: ${entityType} ${referenceId} not found for ${parentType} ${parentId}. Removing invalid reference.`
    );
    return void 0;
  }
  return referenceId;
}

// src/utils/obsidian/obsidianDataConverter.ts
function convertObsidianData(data) {
  var _a, _b, _c, _d;
  logger.verbose("Converting Obsidian data:", data);
  const goals = (((_a = data.goals) == null ? void 0 : _a.values) || []).map(convertGoal);
  const projects = (((_b = data.projects) == null ? void 0 : _b.values) || []).map(convertProject);
  const milestones = (((_c = data.milestones) == null ? void 0 : _c.values) || []).map(
    convertMilestone
  );
  const tasks = (((_d = data.tasks) == null ? void 0 : _d.values) || []).map(convertTask);
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
      if (goal)
        goal.projectIds.push(project.id);
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
      if (project)
        project.milestoneIds.push(milestone.id);
    }
    milestone.dependencyIds = milestone.dependencyIds.filter(
      (depId) => ensureValidReference(
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
      if (milestone)
        milestone.taskIds.push(task.id);
    }
    task.dependencyIds = task.dependencyIds.filter(
      (depId) => ensureValidReference(depId, tasks, "Task", "Task", task.id)
    );
  });
  return { goals, projects, milestones, tasks };
}
function convertGoal(obsidianGoal) {
  return {
    type: "goal",
    id: obsidianGoal.id || "",
    name: obsidianGoal.name || "",
    projectIds: [],
    status: ensureValidStatus(obsidianGoal.status)
  };
}
function convertProject(obsidianProject) {
  let deadline = void 0;
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
    deadline,
    deadlineType: obsidianProject.deadlineType || void 0,
    excitement: ensureValidExcitement(obsidianProject.excitement),
    viability: ensureValidViability(obsidianProject.viability),
    status: ensureValidStatus(obsidianProject.status),
    milestoneIds: [],
    goalId: obsidianProject.goal ? obsidianProject.goal.path : void 0
  };
}
function convertMilestone(obsidianMilestone) {
  var _a, _b;
  return {
    type: "milestone",
    id: obsidianMilestone.id || "",
    name: obsidianMilestone.name || "",
    projectId: ((_a = obsidianMilestone.project) == null ? void 0 : _a.path) || void 0,
    dependencyIds: ((_b = obsidianMilestone.dependencies) == null ? void 0 : _b.map((dep) => dep.path || "")) || [],
    status: ensureValidStatus(obsidianMilestone.status),
    taskIds: []
  };
}
function convertTask(obsidianTask) {
  var _a, _b;
  return {
    type: "task",
    id: obsidianTask.id || "",
    name: obsidianTask.name || "",
    status: ensureValidStatus(obsidianTask.status),
    completionDate: void 0,
    dependencyIds: ((_a = obsidianTask.dependencies) == null ? void 0 : _a.map((dep) => dep.path || "")) || [],
    duration: obsidianTask.duration || 0,
    timeSpent: obsidianTask.timeSpent || 0,
    milestoneId: ((_b = obsidianTask.milestone) == null ? void 0 : _b.path) || void 0
  };
}

// src/utils/projectUtils.ts
function checkDeadlineStatus(completedTasks, projects) {
  const missedHardDeadlines = [];
  const missedSoftDeadlines = [];
  projects.forEach((project) => {
    if (project.deadline) {
      const projectTasks = completedTasks.filter(
        (task) => task.milestoneId && project.milestoneIds.includes(task.milestoneId)
      );
      const lastTaskCompletionDate = Math.max(
        ...projectTasks.map((task) => {
          var _a;
          return ((_a = task.completionDate) == null ? void 0 : _a.getTime()) || 0;
        })
      );
      if (lastTaskCompletionDate > project.deadline.getTime()) {
        if (project.deadlineType === "hard") {
          missedHardDeadlines.push(
            `${project.name}: ${project.deadline.toISOString()}`
          );
        } else {
          missedSoftDeadlines.push(
            `${project.name}: ${project.deadline.toISOString()}`
          );
        }
      }
    }
  });
  return {
    allHardDeadlinesMet: missedHardDeadlines.length === 0,
    allSoftDeadlinesMet: missedSoftDeadlines.length === 0,
    missedHardDeadlines,
    missedSoftDeadlines
  };
}
function calculateCrunchInfo(projects, endDate) {
  const crunchByProject = {};
  let totalCrunch = 0;
  let projectsWithDeadlines = 0;
  projects.forEach((project) => {
    if (project.deadline) {
      const crunch = Math.max(
        Math.min(getDaysUntilDeadline(project, endDate), 3650),
        -3650
      );
      crunchByProject[project.name] = crunch;
      totalCrunch += crunch;
      projectsWithDeadlines++;
    }
  });
  const earliestCrunch = projectsWithDeadlines > 0 ? Math.min(...Object.values(crunchByProject)) : 0;
  const latestCrunch = projectsWithDeadlines > 0 ? Math.max(...Object.values(crunchByProject)) : 0;
  const averageCrunch = projectsWithDeadlines > 0 ? totalCrunch / projectsWithDeadlines : 0;
  return {
    earliestCrunch,
    latestCrunch,
    averageCrunch,
    crunchByProject
  };
}

// src/index.ts
function optimizeTasks(rawData, convertData = convertObsidianData, optimize = optimizeSequence, simulate = simulateTaskSequence) {
  const { projects, goals, milestones, tasks } = convertData(rawData);
  const bestSequence = optimize(projects, goals, milestones, tasks);
  const result = simulate(bestSequence, projects, goals, milestones);
  if (!result || !result.completedTasks || !result.endDate) {
    logger.error("Invalid simulation result:", result);
    return createEmptyOptimizationResult();
  }
  const deadlineStatus = checkDeadlineStatus(result.completedTasks, projects);
  const crunchInfo = calculateCrunchInfo(projects, result.endDate);
  const optimizationResult = {
    optimizedSequence: bestSequence,
    statistics: result,
    deadlineStatus,
    crunchInfo
  };
  checkDeadlines(deadlineStatus);
  logger.verbose("Optimization result:", optimizationResult);
  return optimizationResult;
}
function createEmptyOptimizationResult() {
  return {
    optimizedSequence: [],
    statistics: {
      score: 0,
      completedTasks: [],
      endDate: new Date()
    },
    deadlineStatus: {
      allHardDeadlinesMet: false,
      allSoftDeadlinesMet: false,
      missedHardDeadlines: [],
      missedSoftDeadlines: []
    },
    crunchInfo: {
      earliestCrunch: 0,
      latestCrunch: 0,
      averageCrunch: 0,
      crunchByProject: {}
    }
  };
}
function checkDeadlines(deadlineStatus) {
  if (!deadlineStatus.allHardDeadlinesMet || !deadlineStatus.allSoftDeadlinesMet) {
    logger.error(
      "ERROR: Not all deadlines are met. Task rescheduling may be necessary."
    );
  }
}

// src/types/settings.ts
var DEFAULT_SETTINGS = {
  logLevel: "normal"
};

// main.ts
var OptimizeTasksPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    logger.setLogLevel(this.settings.logLevel);
    logger.log("Loading OptimizeTasks plugin");
    this.addSettingTab(new OptimizeTasksSettingTab(this.app, this));
    try {
      this.addCommand({
        id: "test-optimize-tasks",
        name: "Test Optimize Tasks",
        callback: () => {
          new import_obsidian.Notice("OptimizeTasks plugin is working!");
        }
      });
      window.optimizeTasks = (data) => {
        return optimizeTasks(data);
      };
    } catch (error) {
      logger.error("Error loading OptimizeTasks plugin:", error);
    }
  }
  onunload() {
    logger.log("Unloading OptimizeTasks plugin");
    delete window.optimizeTasks;
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    logger.setLogLevel(this.settings.logLevel);
  }
};
var OptimizeTasksSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Log Level").setDesc("Set the level of logging for the plugin").addDropdown(
      (dropdown) => dropdown.addOptions({
        off: "Off",
        errors: "Errors only",
        normal: "Normal",
        verbose: "Verbose"
      }).setValue(this.plugin.settings.logLevel).onChange(async (value) => {
        this.plugin.settings.logLevel = value;
        await this.plugin.saveSettings();
      })
    );
  }
};
