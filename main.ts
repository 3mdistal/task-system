import { Plugin, Notice } from "obsidian";
import { optimizeTasks } from "./src/index";
import { ObsidianDataViewData } from "./src/types";

export default class OptimizeTasksPlugin extends Plugin {
  async onload() {
    console.log("Loading OptimizeTasks plugin");
    try {
      this.addCommand({
        id: "test-optimize-tasks",
        name: "Test Optimize Tasks",
        callback: () => {
          new Notice("OptimizeTasks plugin is working!");
        },
      });
      (window as any).optimizeTasks = (data: ObsidianDataViewData) => {
        return optimizeTasks(data);
      };
    } catch (error) {
      console.error("Error loading OptimizeTasks plugin:", error);
    }
  }

  onunload() {
    console.log("Unloading OptimizeTasks plugin");
    delete (window as any).optimizeTasks;
  }
}
