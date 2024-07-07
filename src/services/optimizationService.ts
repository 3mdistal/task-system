import { Milestone } from "../types";
import { getAllShuffledPermutations } from "../utils/arrayUtils";
import { simulateSequence } from "./simulationService";

export const optimizeSequence = (testSequence: Milestone[]): Milestone[] => {
  let bestSequences: Array<{
    sequence: Milestone[];
    weightedAverageRatio: number;
  }> = [];
  let lowestDaysLate = Number.MAX_SAFE_INTEGER;
  let highestWeightedAverageRatio = Number.MIN_SAFE_INTEGER;

  getAllShuffledPermutations(testSequence).forEach((sequence) => {
    const { totalDaysLate: daysLate, weightedAverageRatio } =
      simulateSequence(sequence);

    if (daysLate < lowestDaysLate) {
      bestSequences = [{ sequence, weightedAverageRatio }];
      lowestDaysLate = daysLate;
      highestWeightedAverageRatio = weightedAverageRatio;
    } else if (daysLate === lowestDaysLate) {
      bestSequences.push({ sequence, weightedAverageRatio });
      if (weightedAverageRatio > highestWeightedAverageRatio) {
        highestWeightedAverageRatio = weightedAverageRatio;
      }
    }
  });

  return bestSequences.reduce((best, current) =>
    current.weightedAverageRatio > best.weightedAverageRatio ? current : best
  ).sequence;
};
