import { app, BrowserWindow, ipcMain, dialog, protocol, net } from "electron";
import { pathToFileURL } from "url";
import path from "path";
import { ConfigService } from "./services/ConfigService";
import { TikTokService } from "./services/TikTokService";
import { AutomationService } from "./services/AutomationService";
import { ActionQueueService } from "./services/ActionQueueService";
import { OverlayService } from "./services/OverlayService";
import { WebServerService } from "./services/WebServerService"; // Import
import { CHANNELS } from "../src/shared/types";
import { TriggerService } from "./services/TriggerService";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Register privileges for custom protocol
protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      bypassCSP: true, // Optional but helpful
    },
  },
]);

// Services
const configService = new ConfigService();
const tikTokService = new TikTokService();
const automationService = new AutomationService();
const actionQueueService = new ActionQueueService(automationService);
const overlayService = new OverlayService();
const webServerService = new WebServerService(); // Initialize
const triggerService = new TriggerService(
  configService,
  actionQueueService,
  (msg) => {
    console.log("[Trigger]", msg);
    mainWindow?.webContents.send(CHANNELS.LOG, msg);
  },
);

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Required for some native modules? strict isolation + preload is better
    },
    icon: path.join(__dirname, "../../resources/icon.png"),
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else if (!app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
};

app.whenReady().then(() => {
  // Register 'media' protocol to serve local files
  protocol.handle("media", (request) => {
    const filePath = request.url.slice("media://".length);
    // Decode URI component to handle spaces and special chars
    const decodedPath = decodeURIComponent(filePath);
    return net.fetch(pathToFileURL(decodedPath).toString());
  });

  createWindow();
  webServerService.start(); // Start Server
  // overlayService.createWindow(); (Disabled by user request)

  // Wire up TikTok Service
  tikTokService.on("status", (status) => {
    mainWindow?.webContents.send(CHANNELS.TIKTOK_STATUS, status);
    webServerService.emitEvent("status", status); // Forward to Overlay
  });

  tikTokService.on("gift", (data) => {
    mainWindow?.webContents.send(CHANNELS.TIKTOK_EVENT, { type: "gift", data });
    webServerService.emitEvent("gift", data);
    triggerService.processEvent("gift", data);
  });

  tikTokService.on("chat", (data) => {
    mainWindow?.webContents.send(CHANNELS.TIKTOK_EVENT, { type: "chat", data });
    webServerService.emitEvent("chat", data);
    triggerService.processEvent("chat", data);
  });

  tikTokService.on("like", (data) => {
    mainWindow?.webContents.send(CHANNELS.TIKTOK_EVENT, { type: "like", data });
    webServerService.emitEvent("like", data);
    triggerService.processEvent("like", data);
  });

  tikTokService.on("social", (data) => {
    mainWindow?.webContents.send(CHANNELS.TIKTOK_EVENT, {
      type: "social",
      data,
    });
    webServerService.emitEvent("social", data);
  });

  // Wire up Overlay
  actionQueueService.on("overlay-effect", (action) => {
    if (action.type === "overlay_image" && action.data.filePath) {
      overlayService.showImage(
        action.data.filePath,
        action.data.duration || 3000,
      );
      webServerService.emitEvent("overlay-image", {
        filePath: action.data.filePath,
        duration: action.data.duration || 3000,
      });
    }
  });

  actionQueueService.on("renderer-effect", (data) => {
    // Forward to main window for playback
    mainWindow?.webContents.send("renderer-effect", data);
    webServerService.emitEvent("renderer-effect", data);
  });

  ipcMain.handle(CHANNELS.GET_CONFIG, () => configService.getConfig());
  ipcMain.handle(CHANNELS.SET_CONFIG, (_, config) =>
    configService.setConfig(config),
  );
  ipcMain.handle(CHANNELS.TIKTOK_CONNECT, (_, username) =>
    tikTokService.connect(username),
  );
  ipcMain.handle(CHANNELS.TIKTOK_DISCONNECT, () => tikTokService.disconnect());
  ipcMain.handle(CHANNELS.GET_ROOM_INFO, () => tikTokService.fetchRoomInfo());
  ipcMain.handle(CHANNELS.GET_AVAILABLE_GIFTS, () =>
    tikTokService.fetchAvailableGifts(),
  );

  // App Info
  ipcMain.handle("get-app-info", () => {
    return {
      version: app.getVersion(),
      name: app.getName(),
      author: "decryptable", // Hardcoded or read from package.json if imported
      homepage: "https://github.com/decryptable",
    };
  });

  // Testing Automation
  ipcMain.handle("test-automation", async (_, action) => {
    await actionQueueService.addAction(action);
    return { success: true };
  });

  // Simulation
  ipcMain.handle("simulate-event", (_, { type, data }) => {
    console.log("Simulating", type, data);
    if (type === "gift") tikTokService.emit("gift", data);
    if (type === "chat") tikTokService.emit("chat", data);
    if (type === "like") tikTokService.emit("like", data);
    if (type === "share")
      tikTokService.emit("social", { ...data, type: "share" });
    if (type === "follow")
      tikTokService.emit("social", { ...data, type: "follow" });
  });

  // File Selection
  ipcMain.handle("select-file", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
    });
    if (canceled) {
      return null;
    } else {
      return filePaths[0];
    }
  });

  // CLI Logging
  ipcMain.on("log-to-console", (_, msg) => {
    console.log("[Renderer]", msg);
  });
});

app.on("browser-window-created", (_, window) => {
  window.setMenu(null); // Remove default menu
  window.webContents.on("before-input-event", (_, input) => {
    // Disable F5, Ctrl+R, F12, Ctrl+Shift+I
    if (input.key === "F5" || (input.control && input.key === "r")) {
      _.preventDefault();
    }
    if (
      input.key === "F12" ||
      (input.control && input.shift && input.key === "i")
    ) {
      _.preventDefault();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
