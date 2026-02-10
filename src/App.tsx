import { useState, useEffect } from "react";
import { useStore } from "./store/useStore";
import { Zap, MousePointerClick, Settings, Activity, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoomStats } from "@/components/dashboard/RoomStats";
import { Input } from "@/components/ui/input";
import TriggerList from "@/components/dashboard/TriggerList";
import ActionList from "@/components/dashboard/ActionList";
import Brand from "@/components/icons/brand";

// Placeholder Views
const TriggersView = () => (
  <ScrollArea className="h-full">
    <div className="p-8 flex flex-col">
      <h3 className="text-2xl font-bold mb-4">Triggers</h3>
      <p className="text-muted-foreground mb-6">
        Configure events that trigger actions.
      </p>
      <div className="flex-1">
        <TriggerList />
      </div>
    </div>
  </ScrollArea>
);

const ActionsView = () => (
  <ScrollArea className="h-full">
    <div className="p-8 flex flex-col">
      <h3 className="text-2xl font-bold mb-4">Actions</h3>
      <p className="text-muted-foreground mb-6">
        Configure macros and automation actions.
      </p>
      <div className="flex-1">
        <ActionList />
      </div>
    </div>
  </ScrollArea>
);

const LogsView = () => {
  const logs = useStore((s) => s.logs);
  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4 px-4">Activity Logs</h3>
      <ScrollArea className="flex-1 rounded-md border bg-card p-4 font-mono text-sm shadow-sm">
        {logs.length === 0 && (
          <div className="text-muted-foreground">No logs yet...</div>
        )}
        {logs.map((log, i) => (
          <div
            key={i}
            className="mb-1 pb-1 border-b border-border/50 last:border-0 hover:bg-muted/50 px-2 rounded"
          >
            <span className="text-muted-foreground">
              [{new Date().toLocaleTimeString()}]
            </span>{" "}
            {log}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

import { useTranslation } from "react-i18next";
import { SettingsView } from "@/components/dashboard/SettingsView";

export default function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("triggers");
  const {
    tiktokStatus,
    connectTikTok,
    disconnectTikTok,
    loadConfig,
    config,
    addLog,
  } = useStore();
  const [username, setUsername] = useState("");

  useEffect(() => {
    loadConfig();

    if (window.electronAPI) {
      const unsubscribeStatus = window.electronAPI.onTikTokStatus((status) => {
        useStore.getState().setTikTokStatus(status);
        if (status.connected)
          addLog(`Connected to ${status.username || "TikTok"}`);
        else addLog(`Disconnected: ${status.reason || "Unknown"}`);
      });

      const unsubscribeEvent = window.electronAPI.onTikTokEvent((event) => {
        addLog(
          `Event [${event.type}]: ${JSON.stringify(event.data).slice(0, 100)}...`,
        );
      });

      const unsubscribeEffect = window.electronAPI.onRendererEffect((data) => {
        if (data.type === "tts") {
          const utterance = new SpeechSynthesisUtterance(data.text);
          window.speechSynthesis.speak(utterance);
        }
      });

      return () => {
        unsubscribeStatus();
        unsubscribeEvent();
        unsubscribeEffect();
      };
    }
  }, []);

  useEffect(() => {
    // Sync local username state with loaded config
    if (config.tiktokUsername && !username) {
      setUsername(config.tiktokUsername);
    }
  }, [config.tiktokUsername]);

  const handleConnect = async () => {
    if (tiktokStatus.connected) {
      await disconnectTikTok();
    } else {
      if (!username) return;
      addLog(`Connecting to ${username}...`);
      try {
        await connectTikTok(username);
      } catch (e: any) {
        addLog(`Connection failed: ${e.message}`);
      }
    }
  };

  const navItems = [
    { id: "triggers", label: t("nav.triggers"), icon: Zap },
    { id: "actions", label: t("nav.actions"), icon: MousePointerClick },
    { id: "logs", label: t("nav.logs"), icon: Activity },
    { id: "settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card flex flex-col shadow-sm z-10">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="h-8 w-8 rounded flex items-center justify-center">
            <Brand className="h-15 w-15" />
          </div>
          <span className="font-bold text-lg tracking-tight">StreamLink</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 transition-all",
                activeTab === item.id && "bg-secondary font-medium shadow-sm",
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon
                className={cn(
                  "h-4 w-4",
                  activeTab === item.id
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                tiktokStatus.status === "connected"
                  ? "bg-green-500 animate-pulse"
                  : tiktokStatus.status === "connecting"
                    ? "bg-yellow-500 animate-bounce"
                    : tiktokStatus.status === "disconnecting"
                      ? "bg-orange-500"
                      : "bg-red-500",
              )}
            />
            {tiktokStatus.status === "connected"
              ? "Online"
              : tiktokStatus.status === "connecting"
                ? "Connecting..."
                : tiktokStatus.status === "disconnecting"
                  ? "Disconnecting..."
                  : "Offline"}
          </div>
          <div className="mt-4 mb-2">
            <RoomStats />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            v0.1.0 Alpha
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-muted/5">
        {/* Top Bar */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-card shadow-sm z-0">
          <h2 className="font-semibold text-lg capitalize flex items-center gap-2">
            {(() => {
              const activeItem = navItems.find((n) => n.id === activeTab);
              const Icon = activeItem?.icon;
              return Icon ? (
                <Icon className="h-5 w-5 text-muted-foreground" />
              ) : null;
            })()}
            {activeTab}
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="TikTok Username"
                disabled={
                  tiktokStatus.status === "connecting" ||
                  tiktokStatus.status === "connected"
                }
                className="h-8 w-40 border-0 bg-transparent focus-visible:ring-0 shadow-none text-sm"
              />
              <Button
                variant={tiktokStatus.connected ? "destructive" : "default"}
                size="sm"
                onClick={handleConnect}
                disabled={
                  tiktokStatus.status === "connecting" ||
                  tiktokStatus.status === "disconnecting"
                }
                className="h-8 gap-2 transition-all min-w-[100px]"
              >
                {tiktokStatus.status === "connecting" ? (
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Connecting
                  </span>
                ) : tiktokStatus.status === "disconnecting" ? (
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Stopping
                  </span>
                ) : tiktokStatus.connected ? (
                  <>
                    <Plug className="h-3.5 w-3.5" /> Disconnect
                  </>
                ) : (
                  <>
                    <Plug className="h-3.5 w-3.5" /> Connect
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === "triggers" && <TriggersView />}
          {activeTab === "actions" && <ActionsView />}
          {activeTab === "logs" && <LogsView />}
          {activeTab === "settings" && (
            <ScrollArea className="h-full">
              <SettingsView />
            </ScrollArea>
          )}
        </main>
      </div>
    </div>
  );
}
