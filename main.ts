import { Plugin, Notice, PluginSettingTab, Setting, App } from "obsidian";
import { optimizeTasks } from "./src/index";
import { ObsidianDataViewData } from "./src/types";
import { logger } from "./src/utils/logger";
import { OptimizeTasksSettings, DEFAULT_SETTINGS } from "./src/types/settings";

export default class OptimizeTasksPlugin extends Plugin {
  settings!: OptimizeTasksSettings;

  async onload() {
    await this.loadSettings();

    logger.setLogLevel(this.settings.logLevel);
    logger.log("Loading OptimizeTasks plugin");

    this.addSettingTab(new OptimizeTasksSettingTab(this.app, this));

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
      logger.error("Error loading OptimizeTasks plugin:", error);
    }
  }

  onunload() {
    logger.log("Unloading OptimizeTasks plugin");
    delete (window as any).optimizeTasks;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    logger.setLogLevel(this.settings.logLevel);
  }
}

class OptimizeTasksSettingTab extends PluginSettingTab {
  plugin: OptimizeTasksPlugin;

  constructor(app: App, plugin: OptimizeTasksPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Log Level")
      .setDesc("Set the level of logging for the plugin")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            off: "Off",
            errors: "Errors only",
            normal: "Normal",
            verbose: "Verbose",
          })
          .setValue(this.plugin.settings.logLevel)
          .onChange(async (value: string) => {
            this.plugin.settings.logLevel =
              value as OptimizeTasksSettings["logLevel"];
            await this.plugin.saveSettings();
          })
      );
  }
}
