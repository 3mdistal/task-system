import { Status } from "../../types";

// Helper function to ensure we have a valid Status
export function ensureValidStatus(status: any): Status {
  const validStatuses: Status[] = [
    "raw",
    "backlog",
    "planned",
    "in-flight",
    "complete",
    "archived",
  ];
  return validStatuses.includes(status) ? status : "backlog";
}

export function ensureValidExcitement(excitement: any): 1 | 2 | 3 | 4 | 5 {
  const validExcitements = [1, 2, 3, 4, 5];
  return validExcitements.includes(excitement) ? excitement : 3;
}

export function ensureValidViability(viability: any): 1 | 2 | 3 | 4 | 5 {
  const validViabilities = [1, 2, 3, 4, 5];
  return validViabilities.includes(viability) ? viability : 3;
}
