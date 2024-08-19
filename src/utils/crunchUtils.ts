import { getDaysUntilDeadline } from "./dateUtils";
import { Project, CrunchInfo } from "../types";

export function calculateCrunchInfo(
  projects: Project[],
  endDate: Date
): CrunchInfo {
  const crunchByProject: { [key: string]: number } = {};
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

  const earliestCrunch =
    projectsWithDeadlines > 0 ? Math.min(...Object.values(crunchByProject)) : 0;
  const latestCrunch =
    projectsWithDeadlines > 0 ? Math.max(...Object.values(crunchByProject)) : 0;
  const averageCrunch =
    projectsWithDeadlines > 0 ? totalCrunch / projectsWithDeadlines : 0;

  return {
    earliestCrunch,
    latestCrunch,
    averageCrunch,
    crunchByProject,
  };
}
