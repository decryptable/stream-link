import { app, BrowserWindow, screen } from "electron";
import path from "path";

export class OverlayService {
  private window: BrowserWindow | null = null;

  createWindow() {
    // Standard HD resolution for OBS/Stream software
    const width = 1920;
    const height = 1080;

    this.window = new BrowserWindow({
      width,
      height,
      show: false, // Don't show immediately (optional, but good for "server" feel)
      transparent: true,
      frame: false,
      resizable: true, // Allow resizing if user wants to debug
      webPreferences: {
        preload: path.join(__dirname, "../preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Don't force always on top or ignore mouse events if it's for OBS capture
    // this.window.setIgnoreMouseEvents(true, { forward: true });

    // Show it so user can see it exists (for now), but it won't block screen
    this.window.show();

    if (process.env.VITE_DEV_SERVER_URL) {
      this.window.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/overlay`);
    } else if (!app.isPackaged) {
      this.window.loadURL("http://localhost:5173/#/overlay");
    } else {
      // In production (or when VITE_DEV_SERVER_URL is not set), load the file
      this.window.loadFile(path.join(__dirname, "../../dist/index.html"), {
        hash: "overlay",
      });
    }

    // Debugging
    // this.window.webContents.openDevTools({ mode: 'detach' });
  }

  displayAlert(text: string, duration: number = 3000) {
    this.window?.webContents.send("overlay-alert", { text, duration });
  }

  playSound(filePath: string) {
    this.window?.webContents.send("overlay-sound", { filePath });
  }

  showImage(url: string, duration: number = 3000) {
    this.window?.webContents.send("overlay-image", { url, duration });
  }
}
