import { describe, it, expect, beforeEach, vi } from "vitest";
import { useStore } from "../useStore";

// Mock electronAPI
const mockElectronAPI = window.electronAPI;

describe("useStore", () => {
  beforeEach(() => {
    useStore.setState({
      config: {
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
      },
      logs: [],
    });
    vi.clearAllMocks();
  });

  it("should initialize with default config", () => {
    const state = useStore.getState();
    expect(state.config.language).toBe("en");
    expect(state.logs).toEqual([]);
  });

  it("should set config", () => {
    const { setConfig } = useStore.getState();
    setConfig({
      ...useStore.getState().config,
      language: "id",
    });
    expect(useStore.getState().config.language).toBe("id");
  });

  it("should add log", () => {
    const { addLog } = useStore.getState();
    addLog("Test log");
    expect(useStore.getState().logs).toContain("Test log");
    expect(mockElectronAPI.logToConsole).toHaveBeenCalledWith("Test log");
  });

  it("should add a trigger", () => {
    const { addTrigger } = useStore.getState();
    const newTrigger = {
      id: "1",
      name: "Test Trigger",
      type: "gift" as const,
      enabled: true,
      actions: [],
    };
    addTrigger(newTrigger);
    expect(useStore.getState().config.triggers).toHaveLength(1);
    expect(useStore.getState().config.triggers[0]).toEqual(newTrigger);
    expect(mockElectronAPI.setConfig).toHaveBeenCalled();
  });

  it("should remove a trigger", () => {
    const { addTrigger, removeTrigger } = useStore.getState();
    const newTrigger = {
      id: "1",
      name: "Test Trigger",
      type: "gift" as const,
      enabled: true,
      actions: [],
    };
    addTrigger(newTrigger);
    removeTrigger("1");
    expect(useStore.getState().config.triggers).toHaveLength(0);
  });
});
