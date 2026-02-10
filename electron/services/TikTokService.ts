import { WebcastPushConnection } from "tiktok-live-connector";
import { EventEmitter } from "events";

export class TikTokService extends EventEmitter {
  private connection: any = null; // Type as any because tiktok-live-connector types might be missing or tricky in this context
  private isConnected: boolean = false;
  private username: string = "";

  constructor() {
    super();
  }

  async connect(username: string) {
    if (this.isConnected && this.username === username) return;

    this.emitStatus("connecting", { username });

    if (this.isConnected) await this.disconnect();

    this.username = username;
    this.connection = new WebcastPushConnection(username, {
      processInitialData: false,
      enableExtendedGiftInfo: true,
      requestPollingIntervalMs: 1000,
    });

    try {
      const state = await this.connection.connect();
      this.isConnected = true;
      this.emitStatus("connected", { username });
      this.setupListeners();
      console.log(`[TikTok] Connected to room ${state.roomId}`);
    } catch (err) {
      console.error("[TikTok] Failed to connect", err);
      this.emitStatus("disconnected", {
        error: err,
        reason: "Connection Failed",
      });
      this.emit("error", err);
    }
  }

  async disconnect() {
    this.emitStatus("disconnecting");
    if (this.connection) {
      this.connection.disconnect();
      this.connection = null;
    }
    this.isConnected = false;
    this.emitStatus("disconnected", { reason: "User Disconnected" });
  }

  async fetchRoomInfo() {
    if (!this.connection) throw new Error("Not connected");
    try {
      const roomInfo = await this.connection.fetchRoomInfo();
      console.log(
        "[TikTok] Room Info Fetched:",
        JSON.stringify(roomInfo, null, 2),
      );
      return roomInfo;
    } catch (err) {
      console.error("[TikTok] Failed to fetch room info", err);
      throw err;
    }
  }

  async fetchAvailableGifts() {
    if (!this.connection) throw new Error("Not connected");
    try {
      const gifts = await this.connection.fetchAvailableGifts();
      return gifts.map((g: any) => ({
        id: g.id,
        name: g.name,
        diamondCount: g.diamond_count,
        iconUrl: g.image?.url_list?.[0] || "",
      }));
    } catch (err) {
      console.error("[TikTok] Failed to fetch gifts", err);
      throw err;
    }
  }

  private emitStatus(
    status: "disconnected" | "connecting" | "connected" | "disconnecting",
    extra: any = {},
  ) {
    this.emit("status", {
      connected: status === "connected",
      status,
      ...extra,
    });
  }

  private setupListeners() {
    if (!this.connection) return;

    this.connection.on("gift", (data: any) => {
      // Smart Gift Triggering Logic
      // Only trigger action if repeatEnd is true (streak finished)
      // OR if it's not a repeating gift (repeatCount is usually 1, but we rely on repeatEnd)

      // Note: non-repeating gifts also have repeatEnd: true usually in the library normalization
      if (data.repeatEnd) {
        this.emit("gift", {
          giftId: data.giftId,
          giftName: data.giftName,
          userId: data.userId, // Fixed from uniqueId to userId
          uniqueId: data.uniqueId,
          nickname: data.nickname,
          repeatCount: data.repeatCount,
          diamondCount: data.diamondCount * data.repeatCount,
          timestamp: data.timestamp,
        });
      }
    });

    this.connection.on("chat", (data: any) => {
      this.emit("chat", {
        userId: data.userId,
        uniqueId: data.uniqueId,
        nickname: data.nickname,
        comment: data.comment,
        isModerator: data.isModerator,
        isSubscriber: data.isSubscriber, // verify property name
        role: data.userRole, // verify property name
      });
    });

    this.connection.on("like", (data: any) => {
      this.emit("like", {
        totalLikeCount: data.totalLikeCount,
        likeCount: data.likeCount,
        uniqueId: data.uniqueId,
      });
    });

    this.connection.on("social", (data: any) => {
      // Follows and Shares
      this.emit("social", {
        type: data.displayType, // follow or share
        uniqueId: data.uniqueId,
        nickname: data.nickname,
      });
    });

    this.connection.on("streamEnd", () => {
      this.emitStatus("disconnected", { reason: "Stream Ended" });
      this.isConnected = false;
    });

    this.connection.on("disconnected", () => {
      this.emitStatus("disconnected", { reason: "Disconnected from Socket" });
      this.isConnected = false;
    });

    this.connection.on("error", (err: any) => {
      console.error("TikTok Connection Error:", err);
    });
  }
}
