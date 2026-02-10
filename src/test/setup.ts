import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Electron API
window.electronAPI = {
  getConfig: vi.fn(),
  setConfig: vi.fn(),
  connectTikTok: vi.fn(),
  disconnectTikTok: vi.fn(),
  testAutomation: vi.fn(),
  simulateEvent: vi.fn(),
  onTikTokStatus: vi.fn(() => () => {}),
  onTikTokEvent: vi.fn(() => () => {}),
  onOverlayEvent: vi.fn(() => () => {}),
  onRendererEffect: vi.fn(() => () => {}),
  logToConsole: vi.fn(),
  selectFile: vi.fn(),
  getRoomInfo: vi.fn(),
  getAvailableGifts: vi.fn(),
  getAppInfo: vi.fn().mockResolvedValue({
    version: "1.0.0",
    name: "StreamLink",
    author: "Test Author",
    homepage: "https://example.com",
  }),
};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
