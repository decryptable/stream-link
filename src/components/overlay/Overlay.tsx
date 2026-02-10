import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface OverlayContent {
  text?: string;
  url?: string;
  duration: number;
}

export default function Overlay() {
  const [content, setContent] = useState<OverlayContent | null>(null);

  useEffect(() => {
    // Socket.io Connection (Works in OBS/Browser)
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("Connected to StreamLink Server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from StreamLink Server");
    });

    socket.on("overlay-image", (data) => {
      setContent({ url: data.filePath, duration: data.duration }); // filePath from backend matches url
      setTimeout(() => setContent(null), data.duration);
    });

    socket.on("overlay-alert", (data) => {
      setContent({ text: data.text, duration: data.duration });
      setTimeout(() => setContent(null), data.duration);
    });

    socket.on("renderer-effect", (data) => {
      if (data.type === "tts") {
        const utterance = new SpeechSynthesisUtterance(data.text);
        window.speechSynthesis.speak(utterance);
      } else if (data.type === "sound") {
        // Use custom media:// protocol
        let src = data.filePath;
        if (
          src &&
          !src.startsWith("http") &&
          !src.startsWith("file://") &&
          !src.startsWith("media://")
        ) {
          src = `media://${src.replace(/\\/g, "/")}`;
        }
        const audio = new Audio(src);
        audio
          .play()
          .catch((e) => console.error("Overlay Audio playback failed", e));
      }
    });

    // Fallback: Electron IPC (if running in Electron window)
    // @ts-ignore
    if (window.electronAPI) {
      // Keep existing logic if user prefers windowed mode, essentially allows both
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!content) return null;

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden bg-transparent">
      {content.url && (
        <img
          src={
            content.url.startsWith("http") || content.url.startsWith("media://")
              ? content.url
              : `media://${content.url.replace(/\\/g, "/")}`
          }
          className="max-w-[80vw] max-h-[80vh] object-contain animate-in fade-in zoom-in duration-300 drop-shadow-2xl"
        />
      )}
      {content.text && (
        <div className="bg-black/80 text-white px-8 py-6 rounded-2xl text-5xl font-bold animate-in slide-in-from-top-10 shadow-2xl border-2 border-white/20 backdrop-blur-sm text-center">
          {content.text}
        </div>
      )}
    </div>
  );
}
