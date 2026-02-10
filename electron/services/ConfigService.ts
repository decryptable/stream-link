import Store from "electron-store";
import { AppConfig, Trigger, Action } from "../../src/shared/types";

const schema = {
  tiktokUsername: { type: "string", default: "" },
  triggers: { type: "array", default: [] },
  actions: { type: "array", default: [] },
  settings: {
    type: "object",
    properties: {
      enableTTS: { type: "boolean", default: true },
      enableOverlay: { type: "boolean", default: true },
      enableAutomation: { type: "boolean", default: true },
      ttsVolume: { type: "number", default: 1.0 },
    },
    default: {},
  },
} as const;

export class ConfigService {
  private store: any; // generic to avoid strict typing issues with electron-store generic

  constructor() {
    this.store = new Store({
      defaults: {
        tiktokUsername: "",
        triggers: [],
        actions: [],
        settings: {
          enableTTS: true,
          enableOverlay: true,
          enableAutomation: true,
          ttsVolume: 1.0,
        },
      },
    });
  }

  getConfig(): AppConfig {
    return this.store.store as AppConfig;
  }

  setConfig(config: Partial<AppConfig>) {
    this.store.set(config);
  }

  getTrigger(id: string): Trigger | undefined {
    const triggers = this.store.get("triggers") as Trigger[];
    return triggers.find((t) => t.id === id);
  }

  addTrigger(trigger: Trigger) {
    const triggers = this.store.get("triggers") as Trigger[];
    this.store.set("triggers", [...triggers, trigger]);
  }

  removeTrigger(id: string) {
    const triggers = this.store.get("triggers") as Trigger[];
    this.store.set(
      "triggers",
      triggers.filter((t) => t.id !== id),
    );
  }

  // Similar methods for Actions...
  addAction(action: Action) {
    const actions = this.store.get("actions") as Action[];
    this.store.set("actions", [...actions, action]);
  }
}
