import { Project, ProjectResult, SimulationResult } from "../types";
import { MS_PER_DAY } from "../utils/dateUtils";
import { calculateProjectDuration } from "../utils/calculationUtils";

export const simulateSequence = (projects: Project[]): SimulationResult => {
  let currentDate = new Date();
  let totalDaysLate = 0;
  let projectsLate: ProjectResult[] = [];
  let projectsEarly: ProjectResult[] = [];
  let totalDuration = 0;
  let totalWeightedRatio = 0;

  projects.forEach((project, index) => {
    const projectDuration = calculateProjectDuration(project);
    totalDuration += projectDuration;

    const { deadline } = project;

    if (!deadline) {
      totalWeightedRatio += projectDuration;
      currentDate = new Date(
        currentDate.getTime() + projectDuration * MS_PER_DAY
      );
    } else {
      const timeUntilDeadline = Math.max(
        0,
        deadline.getTime() - currentDate.getTime()
      );
      const timeNeeded = projectDuration * MS_PER_DAY;
      let ratio = timeUntilDeadline / timeNeeded;
      totalWeightedRatio += ratio * projectDuration;
      if (timeNeeded > timeUntilDeadline) {
        const daysLate = Math.ceil(
          (timeNeeded - timeUntilDeadline) / MS_PER_DAY
        );
        totalDaysLate += daysLate;
        projectsLate.push({ project, index, daysLate });
        currentDate = new Date(currentDate.getTime() + timeNeeded);
      } else {
        const daysEarly = Math.floor(
          (timeUntilDeadline - timeNeeded) / MS_PER_DAY
        );
        projectsEarly.push({ project, index, daysEarly });
      }
    }
  });

  const weightedAverageRatio =
    totalDuration > 0 ? totalWeightedRatio / totalDuration : 0;

  return {
    totalDaysLate,
    projectsLate,
    projectsEarly,
    totalDuration,
    weightedAverageRatio,
    projectEndDate: currentDate,
  };
};
