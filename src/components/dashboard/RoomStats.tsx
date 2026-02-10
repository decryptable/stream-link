import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Users, Heart, User, Type } from "lucide-react";

export function RoomStats() {
  const { roomInfo, tiktokStatus, fetchRoomInfo } = useStore();
  const [messages, setMessages] = useState<
    { uniqueId: string; comment: string }[]
  >([]);

  useEffect(() => {
    if (tiktokStatus.connected) {
      fetchRoomInfo();
      const interval = setInterval(fetchRoomInfo, 60000); // Auto-refresh every minute
      return () => clearInterval(interval);
    }
  }, [tiktokStatus.connected]);

  // Listen for Chat Events
  useEffect(() => {
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onTikTokEvent((event) => {
        if (event.type === "chat") {
          setMessages((prev) => {
            const newMsg = {
              uniqueId: event.data.uniqueId,
              comment: event.data.comment,
            };
            return [newMsg, ...prev].slice(0, 3); // Keep last 3
          });
        }
      });
      return () => unsubscribe();
    }
  }, []);

  if (!tiktokStatus.connected) return null;

  return (
    <Card className="bg-muted/50 overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Room Info</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => fetchRoomInfo()}
          title="Refresh Room Info"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {roomInfo ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Type className="h-4 w-4 text-muted-foreground" />
              <span className="truncate flex-1" title={roomInfo.title}>
                {roomInfo.title || "No Title"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{roomInfo.ownerName || "Unknown"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex flex-col bg-background p-2 rounded-md">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> Viewers
                </span>
                <span className="font-bold">
                  {roomInfo.viewerCount?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex flex-col bg-background p-2 rounded-md">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Likes
                </span>
                <span className="font-bold">
                  {roomInfo.likeCount?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {/* Chat Ticker */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Recent Chat
              </span>
              <div className="h-[60px] overflow-hidden relative bg-background rounded-md p-1">
                <div className="flex flex-col gap-1 transition-all duration-300 ease-in-out">
                  {messages.length === 0 && (
                    <span className="text-xs text-muted-foreground p-1">
                      Waiting for chat...
                    </span>
                  )}
                  {messages.map(
                    (
                      msg: { uniqueId: string; comment: string },
                      idx: number,
                    ) => (
                      <div
                        key={idx}
                        className="text-xs truncate animate-in slide-in-from-bottom-2 fade-in"
                      >
                        <span className="font-semibold text-primary">
                          {msg.uniqueId}:
                        </span>{" "}
                        {msg.comment}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-2">
            Click refresh to load stats
          </div>
        )}
      </CardContent>
    </Card>
  );
}
