import { EventEmitter } from "events";
import { Action } from "../../src/shared/types";
import { AutomationService } from "./AutomationService";

export class ActionQueueService extends EventEmitter {
  private queue: {
    action: Action;
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason?: any) => void;
  }[] = [];
  private isProcessing: boolean = false;
  private automationService: AutomationService;

  constructor(automationService: AutomationService) {
    super();
    this.automationService = automationService;
  }

  async addAction(action: Action): Promise<void> {
    return new Promise((resolve, reject) => {
      // TODO: Implement Priority Logic (e.g. insert at front if high priority)
      this.queue.push({ action, resolve, reject });
      this.processQueue();
    });
  }

  clearQueue() {
    this.queue = [];
    this.isProcessing = false;
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const item = this.queue.shift();
    if (!item) {
      this.isProcessing = false;
      return;
    }

    const { action, resolve, reject } = item;
    console.log("Processing action:", action.id, action.type);

    try {
      await this.executeAction(action);
      resolve();
    } catch (err) {
      console.error("Action failed:", action.id, err);
      reject(err);
    } finally {
      this.isProcessing = false;
      // Add a small delay between actions to allow UI/Game to update
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  private async executeAction(action: Action) {
    switch (action.type) {
      case "key_tap":
        if (action.data.key)
          await this.automationService.tapKey(action.data.key);
        break;
      case "key_hold":
        if (action.data.key)
          await this.automationService.holdKey(
            action.data.key,
            action.data.duration || 1000,
            action.data.repeat || false,
          );
        break;
      case "mouse_click":
        if (action.data.x !== undefined && action.data.y !== undefined)
          await this.automationService.mouseClick(action.data.x, action.data.y);
        break;
      case "command":
        if (action.data.command) {
          const { exec } = require("child_process");
          exec(action.data.command, (error: any, stdout: any, stderr: any) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
          });
        }
        break;
      case "overlay_image":
        this.emit("overlay-effect", action); // Handled by OverlayService/Main
        // Wait for duration to prevent overlap if desired, or just fire and forget
        await new Promise((r) => setTimeout(r, action.data.duration || 3000));
        break;
      case "tts":
        if (action.data.text) {
          // Emit to renderer to use SpeechSynthesis
          this.emit("renderer-effect", { type: "tts", text: action.data.text });
        }
        break;
      case "sound":
        if (action.data.filePath) {
          // Play sound directly in Main Process via OS
          await this.automationService.playSound(action.data.filePath);
        }
        break;
      default:
        console.warn("Unknown action type:", action.type);
    }
  }
}
