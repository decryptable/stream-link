import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Overlay from "./components/overlay/Overlay.tsx";
import "./lib/i18n";
import { ThemeProvider } from "./components/theme-provider";

const isOverlay = window.location.hash === "#/overlay";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {isOverlay ? <Overlay /> : <App />}
    </ThemeProvider>
  </StrictMode>,
);
