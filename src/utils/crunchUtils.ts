import { Project, CrunchInfo } from "../types";

export function calculateCrunchInfo(
  projects: Project[],
  endDate: Date
): CrunchInfo {
  const projectsWithDeadlines = projects.filter((p) => p.deadline);

  if (projectsWithDeadlines.length === 0) {
    return {
      earliestCrunch: 0,
      latestCrunch: 0,
      averageCrunch: 0,
      crunchByProject: {},
    };
  }

  const crunchByProject = projectsWithDeadlines.reduce((acc, project) => {
    const crunch = Math.floor(
      (project.deadline!.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    acc[project.name] = crunch;
    return acc;
  }, {} as { [projectName: string]: number });

  const crunchValues = Object.values(crunchByProject);

  return {
    earliestCrunch: Math.min(...crunchValues),
    latestCrunch: Math.max(...crunchValues),
    averageCrunch: Math.round(
      crunchValues.reduce((sum, value) => sum + value, 0) / crunchValues.length
    ),
    crunchByProject,
  };
}
