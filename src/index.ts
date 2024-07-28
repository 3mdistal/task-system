import { Milestone, Task } from "./types";
import { optimizeSequence } from "./services/optimizationService";
import { simulateSequence } from "./services/simulationService";

export function optimizeTasks(tasks: Task[], milestones: Milestone[]) {
  const bestSequence = optimizeSequence(milestones);
  const result = simulateSequence(bestSequence);

  return {
    optimizedSequence: bestSequence,
    statistics: result,
  };
}
