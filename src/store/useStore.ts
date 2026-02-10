import { create } from "zustand";
import type {
  AppConfig,
  Trigger,
  Action,
  RoomInfo,
  GiftInfo,
} from "../shared/types";

interface AppState {
  config: AppConfig;
  tiktokStatus: {
    connected: boolean;
    status: "disconnected" | "connecting" | "connected" | "disconnecting";
    username?: string;
    error?: any;
    reason?: string;
  };
  logs: string[];
  roomInfo: RoomInfo | null;
  availableGifts: GiftInfo[];

  // Actions
  setConfig: (config: AppConfig) => void;
  updateTrigger: (trigger: Trigger) => void;
  addTrigger: (trigger: Trigger) => void;
  removeTrigger: (id: string) => void;
  updateAction: (action: Action) => void;
  addAction: (action: Action) => void;
  removeAction: (id: string) => void;
  setTikTokStatus: (status: AppState["tiktokStatus"]) => void;
  addLog: (msg: string) => void;

  // Async actions (IPC)
  loadConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;
  connectTikTok: (username: string) => Promise<void>;
  disconnectTikTok: () => Promise<void>;
  simulateEvent: (type: string, data: any) => Promise<void>;
  fetchRoomInfo: () => Promise<void>;
  fetchAvailableGifts: () => Promise<void>;
}

// Mock initial config
const initialConfig: AppConfig = {
  tiktokUsername: "",
  language: "en",
  theme: "system",
  loggingEnabled: true,
  tiktokStatus: {
    connected: false,
    status: "disconnected",
  },
  triggers: [],
  actions: [],
  settings: {
    enableTTS: true,
    enableOverlay: true,
    enableAutomation: true,
    ttsVolume: 1.0,
  },
};

export const useStore = create<AppState>((set, get) => ({
  config: initialConfig,
  tiktokStatus: initialConfig.tiktokStatus,
  logs: [],
  roomInfo: null,
  availableGifts: [],

  setConfig: (config) => set({ config }),

  // ... triggers/actions methods ...

  setTikTokStatus: (status) => set({ tiktokStatus: status }),

  updateTrigger: (trigger) => {
    const config = get().config;
    const newTriggers = config.triggers.map((t) =>
      t.id === trigger.id ? trigger : t,
    );
    set({ config: { ...config, triggers: newTriggers } });
    get().saveConfig();
  },

  addTrigger: (trigger) => {
    const config = get().config;
    set({ config: { ...config, triggers: [...config.triggers, trigger] } });
    get().saveConfig();
  },

  removeTrigger: (id) => {
    const config = get().config;
    set({
      config: {
        ...config,
        triggers: config.triggers.filter((t) => t.id !== id),
      },
    });
    get().saveConfig();
  },

  // ... similar for actions
  updateAction: (action) => {
    const config = get().config;
    const newActions = config.actions.map((a) =>
      a.id === action.id ? action : a,
    );
    set({ config: { ...config, actions: newActions } });
    get().saveConfig();
  },

  addAction: (action) => {
    const config = get().config;
    set({ config: { ...config, actions: [...config.actions, action] } });
    get().saveConfig();
  },

  removeAction: (id) => {
    const config = get().config;
    set({
      config: { ...config, actions: config.actions.filter((a) => a.id !== id) },
    });
    get().saveConfig();
  },

  // setTikTokStatus is already defined above? No, it was missing in the middle block but present at bottom.
  // Wait, I see `setTikTokStatus: (status) => set({ tiktokStatus: status }),` at line 60 AND 112 in the file view.
  // I need to remove one. I'll remove the one at line 112.

  addLog: (msg) => {
    set((state) => ({ logs: [msg, ...state.logs].slice(0, 100) }));
    // @ts-ignore
    if (window.electronAPI) window.electronAPI.logToConsole(msg);
  },

  loadConfig: async () => {
    // @ts-ignore
    if (window.electronAPI) {
      // @ts-ignore
      const config = await window.electronAPI.getConfig();
      if (config) set({ config });
    }
  },

  saveConfig: async () => {
    const config = get().config;
    // @ts-ignore
    if (window.electronAPI) {
      // @ts-ignore
      await window.electronAPI.setConfig(config);
    }
  },

  connectTikTok: async (username) => {
    // @ts-ignore
    if (window.electronAPI) {
      // @ts-ignore
      await window.electronAPI.connectTikTok(username);
    }
  },

  disconnectTikTok: async () => {
    // @ts-ignore
    if (window.electronAPI) {
      // @ts-ignore
      await window.electronAPI.disconnectTikTok();
    }
  },

  simulateEvent: async (type, data) => {
    // @ts-ignore
    if (window.electronAPI) {
      // @ts-ignore
      await window.electronAPI.simulateEvent(type, data);
    }
  },

  fetchRoomInfo: async () => {
    // @ts-ignore
    if (window.electronAPI) {
      // @ts-ignore
      const info = await window.electronAPI.getRoomInfo();
      set({ roomInfo: info });
    }
  },

  fetchAvailableGifts: async () => {
    // @ts-ignore
    if (window.electronAPI) {
      // @ts-ignore
      const gifts = await window.electronAPI.getAvailableGifts();
      set({ availableGifts: gifts });
    }
  },
}));
