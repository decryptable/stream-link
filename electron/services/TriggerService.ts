import { ConfigService } from "./ConfigService";
import { ActionQueueService } from "./ActionQueueService";
import { Trigger, Action } from "../../src/shared/types";

export class TriggerService {
  private configService: ConfigService;
  private actionQueueService: ActionQueueService;
  private feedback: (message: string) => void;
  private lastTriggerTime: Map<string, number> = new Map();

  constructor(
    configService: ConfigService,
    actionQueueService: ActionQueueService,
    feedbackCallback: (msg: string) => void = () => {},
  ) {
    this.configService = configService;
    this.actionQueueService = actionQueueService;
    this.feedback = feedbackCallback;
  }

  async processEvent(eventType: string, data: any) {
    const config = this.configService.getConfig();
    if (!config.settings.enableAutomation) return;

    const triggers = config.triggers.filter(
      (t) => t.enabled && t.type === eventType,
    );

    for (const trigger of triggers) {
      if (this.checkCondition(trigger, data)) {
        if (this.checkCooldown(trigger)) {
          await this.executeTrigger(trigger);
        } else {
          console.log(`Trigger ${trigger.id} on cooldown`);
        }
      }
    }
  }

  private checkCondition(trigger: Trigger, data: any): boolean {
    switch (trigger.type) {
      case "gift":
        // 1. Gift ID Match (Strongest)
        if (trigger.giftId && data.giftId !== trigger.giftId) return false;

        // 2. Gift Name Match (Partial/Regex/Exact) - if ID not present or as additional check
        if (trigger.giftName && data.giftName) {
          // Simple includes check for now, or could be regex
          if (
            !data.giftName
              .toLowerCase()
              .includes(trigger.giftName.toLowerCase())
          )
            return false;
        }

        // 3. Streak/Count Check
        // data.repeatCount is the total accumulated streak.
        if (trigger.minStreak && data.repeatCount < trigger.minStreak)
          return false;

        return true;

      case "chat":
        if (trigger.exactMatch) {
          if (data.comment !== trigger.exactMatch) return false;
        }
        if (trigger.regex) {
          try {
            const regex = new RegExp(trigger.regex, "i");
            if (!regex.test(data.comment)) return false;
          } catch (e) {
            console.error("Invalid Regex:", trigger.regex);
            return false;
          }
        }
        // Role check
        if (trigger.role) {
          // event data: role (userRole), isModerator, isSubscriber
          if (trigger.role === "moderator" && !data.isModerator) return false;
          if (trigger.role === "subscriber" && !data.isSubscriber) return false;
          // TODO: verify 'userRole' mapping from library
        }
        return true;

      case "follow":
      case "share":
      case "like":
        return true; // Generic trigger for event

      default:
        return false;
    }
  }

  private checkCooldown(trigger: Trigger): boolean {
    if (!trigger.cooldown) return true;

    const now = Date.now();
    const last = this.lastTriggerTime.get(trigger.id) || 0;

    if (now - last < trigger.cooldown * 1000) {
      return false;
    }

    this.lastTriggerTime.set(trigger.id, now);
    return true;
  }

  private async executeTrigger(trigger: Trigger) {
    const config = this.configService.getConfig();
    const actions = config.actions.filter((a) =>
      trigger.actions.includes(a.id),
    );

    console.log(
      `Executing Trigger: ${trigger.id} with ${actions.length} actions`,
    );
    this.feedback(`Triggered: ${trigger.type}`);

    for (const action of actions) {
      await this.actionQueueService.addAction(action);
    }
  }
}
