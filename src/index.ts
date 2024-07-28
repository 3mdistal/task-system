import { Project } from "./types";
import { optimizeSequence } from "./services/optimizationService";
import { simulateSequence } from "./services/simulationService";
import { projects } from "./data/data";

export function optimizeTasks(projects: Project[]) {
  const bestSequence = optimizeSequence(projects);
  const result = simulateSequence(bestSequence);

  console.log(bestSequence, result);

  return {
    optimizedSequence: bestSequence,
    statistics: result,
  };
}

optimizeTasks(projects);
