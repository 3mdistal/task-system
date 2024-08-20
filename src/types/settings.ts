export interface OptimizeTasksSettings {
  logLevel: "off" | "errors" | "normal" | "verbose";
}

export const DEFAULT_SETTINGS: OptimizeTasksSettings = {
  logLevel: "normal",
};
