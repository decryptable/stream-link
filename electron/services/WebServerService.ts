import express from "express";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import path from "path";
import { EventEmitter } from "events";

export class WebServerService extends EventEmitter {
  private app: express.Application;
  private server: http.Server;
  private io: SocketIOServer;
  private port: number = 3000;

  constructor() {
    super();
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*", // Allow OBS or any browser to connect
        methods: ["GET", "POST"],
      },
    });

    this.setupRoutes();
    this.setupSocket();
  }

  private setupRoutes() {
    // Serve static files from the React build directory (if in production) or just a simple placeholder
    // For now, we mainly use this for the WebSocket, but we can serve the overlay HTML here too.
    // simpler to just let Vite serve the frontend in dev, and this serves WS.

    this.app.get("/", (req, res) => {
      res.send("StreamLink Overlay Server Running");
    });
  }

  private setupSocket() {
    this.io.on("connection", (socket) => {
      console.log("Overlay connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Overlay disconnected:", socket.id);
      });
    });
  }

  public start() {
    this.server.listen(this.port, () => {
      console.log(
        `[WebServer] Overlay server running on http://localhost:${this.port}`,
      );
    });
  }

  public emitEvent(event: string, data: any) {
    this.io.emit(event, data);
  }

  public stop() {
    this.server.close();
  }
}
