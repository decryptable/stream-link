export interface AppConfig {
  tiktokUsername: string;
  language: "en" | "id";
  theme: "light" | "dark" | "system";
  loggingEnabled: boolean;
  tiktokStatus: {
    connected: boolean;
    status: "disconnected" | "connecting" | "connected" | "disconnecting";
    username?: string;
    error?: any;
    reason?: string;
  };
  triggers: Trigger[];
  actions: Action[];
  settings: GeneralSettings;
}

export interface GeneralSettings {
  enableTTS: boolean;
  enableOverlay: boolean;
  enableAutomation: boolean;
  ttsVolume: number; // 0-1
}

export type TriggerType =
  | "gift"
  | "chat"
  | "follow"
  | "share"
  | "like"
  | "join";

export interface Trigger {
  id: string;
  name: string;
  type: TriggerType;
  enabled: boolean;
  // Specific conditions
  giftId?: number; // For specific gift (priority)
  giftName?: string; // For display or regex
  minStreak?: number; // Only trigger if streak >= X
  giftAmount?: number; // Min coins/diamonds (legacy/fallback)
  exactMatch?: string; // For chat
  regex?: string; // For chat regexPattern
  role?: "user" | "follower" | "subscriber" | "moderator" | "admin"; // Role filter
  cooldown?: number; // Seconds
  actions: string[]; // Array of Action IDs to execute
}

export type ActionType =
  | "key_tap"
  | "key_hold"
  | "mouse_click"
  | "tts"
  | "sound"
  | "overlay_image"
  | "command";

export interface Action {
  id: string;
  name: string;
  type: ActionType;
  // Action specific data
  data: {
    key?: string; // For key tap/hold
    duration?: number; // For key hold (ms)
    repeat?: boolean; // If true, repeatedly tap key instead of holding
    x?: number; // Mouse X
    y?: number; // Mouse Y
    text?: string; // TTS template
    filePath?: string; // Sound/Image path
    command?: string; // Shell command
  };
}

// IPC Events
export const CHANNELS = {
  GET_CONFIG: "get-config",
  SET_CONFIG: "set-config",
  TIKTOK_CONNECT: "tiktok-connect",
  TIKTOK_DISCONNECT: "tiktok-disconnect",
  TIKTOK_STATUS: "tiktok-status",
  TIKTOK_EVENT: "tiktok-event",
  GET_ROOM_INFO: "get-room-info",
  GET_AVAILABLE_GIFTS: "get-available-gifts",
  LOG: "log",
} as const;

export interface RoomInfo {
  title: string;
  ownerName: string;
  viewerCount: number;
  likeCount: number;
  // Add other relevant fields
}

export interface GiftInfo {
  id: number;
  name: string;
  diamondCount: number;
  iconUrl: string;
}
