/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    getConfig: () => Promise<any>;
    setConfig: (config: any) => Promise<void>;
    connectTikTok: (username: string) => Promise<void>;
    disconnectTikTok: () => Promise<void>;
    testAutomation: (action: any) => Promise<any>;
    simulateEvent: (type: string, data: any) => Promise<void>;
    onTikTokStatus: (callback: (status: any) => void) => () => void;
    onTikTokEvent: (
      callback: (event: { type: string; data: any }) => void,
    ) => () => void;
    onOverlayEvent: (
      channel: string,
      callback: (data: any) => void,
    ) => () => void;
    onRendererEffect: (callback: (data: any) => void) => () => void;
    logToConsole: (msg: string) => void;
    selectFile: () => Promise<string | null>;
    getRoomInfo: () => Promise<any>;
    getAvailableGifts: () => Promise<any[]>;
    getAppInfo: () => Promise<{
      version: string;
      name: string;
      author: string;
      homepage: string;
    }>;
  };
}
