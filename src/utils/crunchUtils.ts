import { Project, CrunchInfo } from "../types";

export function calculateCrunchInfo(
  projects: Project[],
  currentDate: Date
): CrunchInfo {
  const projectsWithDeadlines = projects.filter((project) => project.deadline);

  if (projectsWithDeadlines.length === 0) {
    return {
      earliestCrunch: 0,
      latestCrunch: 0,
      averageCrunch: 0,
      crunchByProject: {},
    };
  }

  const crunchByProject: { [projectName: string]: number } = {};
  let totalCrunch = 0;
  let earliestCrunch = Infinity;
  let latestCrunch = -Infinity;

  const MAX_CRUNCH = 365 * 10; // 10 years as maximum crunch

  projectsWithDeadlines.forEach((project) => {
    const crunch = Math.min(
      Math.floor(
        (project.deadline!.getTime() - currentDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      MAX_CRUNCH
    );
    crunchByProject[project.name] = crunch;
    totalCrunch += crunch;
    earliestCrunch = Math.min(earliestCrunch, crunch);
    latestCrunch = Math.max(latestCrunch, crunch);
  });

  const averageCrunch = Math.max(
    0,
    Math.round(totalCrunch / projectsWithDeadlines.length)
  );

  return {
    earliestCrunch,
    latestCrunch,
    averageCrunch,
    crunchByProject,
  };
}
