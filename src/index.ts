import { Project, Task } from "./types";
import { optimizeSequence } from "./services/optimizationService";
import { simulateTaskSequence } from "./services/simulationService";
import { projects } from "./data/data";

export function optimizeTasks(projects: Project[]) {
  const bestSequence = optimizeSequence(projects);
  const result = simulateTaskSequence(bestSequence);

  console.log(bestSequence, result);

  return {
    optimizedSequence: bestSequence,
    statistics: result,
  };
}

optimizeTasks(projects);
