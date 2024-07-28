import { Project } from "./types";
import { optimizeSequence } from "./services/optimizationService";
import { simulateSequence } from "./services/simulationService";

export function optimizeTasks(projects: Project[]) {
  const bestSequence = optimizeSequence(projects);
  const result = simulateSequence(bestSequence);

  return {
    optimizedSequence: bestSequence,
    statistics: result,
  };
}
