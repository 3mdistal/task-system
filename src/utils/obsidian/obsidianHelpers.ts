import { Status } from "../../types";
import { logger } from "../logger";

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

export function ensureValidReference<T extends { id: string }>(
  referenceId: string | undefined,
  collection: T[],
  entityType: string,
  parentType: string,
  parentId: string
): string | undefined {
  if (!referenceId) return undefined;

  const found = collection.some((item) => item.id === referenceId);
  if (!found) {
    logger.warn(
      `Warning: ${entityType} ${referenceId} not found for ${parentType} ${parentId}. Removing invalid reference.`
    );
    return undefined;
  }
  return referenceId;
}
