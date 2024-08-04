export interface CrunchInfo {
  earliestCrunch: number;
  latestCrunch: number;
  averageCrunch: number;
  crunchByProject: { [projectName: string]: number };
}
