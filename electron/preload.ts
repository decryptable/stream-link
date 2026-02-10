import { contextBridge, ipcRenderer } from "electron";
import { CHANNELS } from "../src/shared/types";

contextBridge.exposeInMainWorld("electronAPI", {
  getConfig: () => ipcRenderer.invoke(CHANNELS.GET_CONFIG),
  setConfig: (config: any) => ipcRenderer.invoke(CHANNELS.SET_CONFIG, config),
  connectTikTok: (username: string) =>
    ipcRenderer.invoke(CHANNELS.TIKTOK_CONNECT, username),
  disconnectTikTok: () => ipcRenderer.invoke(CHANNELS.TIKTOK_DISCONNECT),
  testAutomation: (action: any) =>
    ipcRenderer.invoke("test-automation", action),
  simulateEvent: (type: string, data: any) =>
    ipcRenderer.invoke("simulate-event", { type, data }),
  selectFile: () => ipcRenderer.invoke("select-file"),
  logToConsole: (msg: string) => ipcRenderer.send("log-to-console", msg),
  getRoomInfo: () => ipcRenderer.invoke(CHANNELS.GET_ROOM_INFO),
  getAvailableGifts: () => ipcRenderer.invoke(CHANNELS.GET_AVAILABLE_GIFTS),
  getAppInfo: () => ipcRenderer.invoke("get-app-info"),

  onTikTokStatus: (callback: (status: any) => void) => {
    const subscription = (_: any, value: any) => callback(value);
    ipcRenderer.on(CHANNELS.TIKTOK_STATUS, subscription);
    return () =>
      ipcRenderer.removeListener(CHANNELS.TIKTOK_STATUS, subscription);
  },

  onTikTokEvent: (callback: (event: { type: string; data: any }) => void) => {
    const subscription = (_: any, value: any) => callback(value);
    ipcRenderer.on(CHANNELS.TIKTOK_EVENT, subscription);
    return () =>
      ipcRenderer.removeListener(CHANNELS.TIKTOK_EVENT, subscription);
  },

  onOverlayEvent: (channel: string, callback: (data: any) => void) => {
    const subscription = (_: any, value: any) => callback(value);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },

  onRendererEffect: (callback: (data: any) => void) => {
    const subscription = (_: any, value: any) => callback(value);
    ipcRenderer.on("renderer-effect", subscription);
    return () => ipcRenderer.removeListener("renderer-effect", subscription);
  },
});
