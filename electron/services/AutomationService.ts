import robot from "robotjs";

export class AutomationService {
  constructor() {
    console.log("[AutomationService] Initializing RobotJS...");
    // RobotJS handles delays a bit differently, often blocking.
    // We can set a default mouse delay if needed, but usually default is fine.
    try {
      robot.setMouseDelay(10);
      robot.setKeyboardDelay(10);
      console.log("[AutomationService] RobotJS initialized successfully.");
    } catch (e) {
      console.error("[AutomationService] Failed to initialize RobotJS:", e);
    }
  }

  async tapKey(keyName: string) {
    console.log(`[Automation] Tapping key: ${keyName}`);
    const key = this.mapKey(keyName);
    if (key) {
      try {
        robot.keyTap(key);
        console.log(`[Automation] Key ${keyName} tapped successfully.`);
      } catch (e) {
        console.error(`[Automation] Error tapping key ${keyName}:`, e);
      }
    } else {
      console.warn(`[Automation] Unknown key: ${keyName}`);
    }
  }

  async holdKey(keyName: string, durationMs: number, repeat: boolean = false) {
    console.log(
      `[Automation] ${repeat ? "Repeating" : "Holding"} key: ${keyName} for ${durationMs}ms`,
    );
    const key = this.mapKey(keyName);
    if (key) {
      try {
        if (repeat) {
          // Spam mode: Tap key repeatedly
          const startTime = Date.now();
          while (Date.now() - startTime < durationMs) {
            robot.keyTap(key);
            await new Promise((resolve) => setTimeout(resolve, 50)); // ~20 taps/sec
          }
        } else {
          // Hold mode: Press down, wait, release
          robot.keyToggle(key, "down");
          await new Promise((resolve) => setTimeout(resolve, durationMs));
          robot.keyToggle(key, "up");
        }

        console.log(
          `[Automation] Key ${keyName} ${repeat ? "repeated" : "held"} successfully.`,
        );
      } catch (e) {
        console.error(`[Automation] Error processing key ${keyName}:`, e);
        // Ensure key is released in case of error (for hold mode)
        if (!repeat) {
          try {
            robot.keyToggle(key, "up");
          } catch {}
        }
      }
    } else {
      console.warn(`[Automation] Unknown key: ${keyName}`);
    }
  }

  async mouseClick(
    x: number,
    y: number,
    button: "left" | "right" | "middle" = "left",
  ) {
    console.log(
      `[Automation] Clicking mouse at (${x}, ${y}) with ${button} button.`,
    );
    try {
      robot.moveMouse(x, y);
      robot.mouseClick(button);
      console.log(`[Automation] Mouse clicked successfully.`);
    } catch (e) {
      console.error("[Automation] Error clicking mouse:", e);
    }
  }

  async typeText(text: string) {
    try {
      robot.typeString(text);
    } catch (e) {
      console.error("[Automation] Error typing text:", e);
    }
  }

  async playSound(filePath: string) {
    const sound = require("sound-play");
    try {
      console.log(`[Automation] Playing sound: ${filePath}`);
      // sound-play returns a promise that resolves when playback *starts* or *finishes* depending on OS/lib version,
      // but usually it fires and forgets or waits. We'll await it to be safe.
      await sound.play(filePath);
      console.log(`[Automation] Sound played successfully.`);
    } catch (e) {
      console.error(`[Automation] Error playing sound ${filePath}:`, e);
    }
  }

  private mapKey(keyName: string): string | undefined {
    // Normalization
    const upper = keyName.toUpperCase();

    // Map to RobotJS key strings
    // Documentation: http://robotjs.io/docs/syntax#keys
    const keyMap: Record<string, string> = {
      BACKSPACE: "backspace",
      DELETE: "delete",
      ENTER: "enter",
      TAB: "tab",
      ESCAPE: "escape",
      UP: "up",
      DOWN: "down",
      RIGHT: "right",
      LEFT: "left",
      HOME: "home",
      END: "end",
      PAGEUP: "pageup",
      PAGEDOWN: "pagedown",
      F1: "f1",
      F2: "f2",
      F3: "f3",
      F4: "f4",
      F5: "f5",
      F6: "f6",
      F7: "f7",
      F8: "f8",
      F9: "f9",
      F10: "f10",
      F11: "f11",
      F12: "f12",
      COMMAND: "command",
      ALT: "alt",
      CONTROL: "control",
      SHIFT: "shift",
      RS: "right_shift",
      SPACE: "space",
      PRINT: "printscreen",
      INSERT: "insert",
      AUDIO_MUTE: "audio_mute",
      AUDIO_VOL_DOWN: "audio_vol_down",
      AUDIO_VOL_UP: "audio_vol_up",
      PLAY: "audio_play",
      PREV: "audio_prev",
      NEXT: "audio_next",
    };

    if (keyMap[upper]) return keyMap[upper];

    // Single characters (a-z, 0-9)
    if (keyName.length === 1) {
      return keyName.toLowerCase();
    }

    return undefined;
  }
}
