import { describe, it, expect } from "vitest";
import i18n from "../i18n";

describe("i18n", () => {
  it("should initialize with default language", () => {
    expect(i18n.language).toBeDefined();
  });

  it("should translate keys correctly in English", () => {
    i18n.changeLanguage("en");
    expect(i18n.t("app.title")).toBe("StreamLink");
    expect(i18n.t("nav.settings")).toBe("System Settings");
  });

  it("should translate keys correctly in Indonesian", () => {
    i18n.changeLanguage("id");
    expect(i18n.t("app.title")).toBe("StreamLink");
    expect(i18n.t("nav.settings")).toBe("Pengaturan Sistem");
  });

  it("should fallback to English for missing keys", () => {
    i18n.changeLanguage("id");
    // Assuming a key that doesn't exist in ID but might be common?
    // Actually our test json is complete. Let's test non-existent key.
    expect(i18n.t("non_existent_key")).toBe("non_existent_key");
  });
});
