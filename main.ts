import { Plugin } from "obsidian";
import { optimizeTasks } from "./src/index";
import { ObsidianDataViewData } from "./src/types";

export default class OptimizeTasksPlugin extends Plugin {
  async onload() {
    console.log("Loading OptimizeTasks plugin");

    // Make optimizeTasks available on the window object
    (window as any).optimizeTasks = (data: ObsidianDataViewData) => {
      return optimizeTasks(data);
    };
  }

  onunload() {
    console.log("Unloading OptimizeTasks plugin");
    // Remove the function from the window object when the plugin is unloaded
    delete (window as any).optimizeTasks;
  }
}
