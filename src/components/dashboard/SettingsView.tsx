import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function SettingsView() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { config, setConfig } = useStore();
  const [appInfo, setAppInfo] = useState<{
    version: string;
    name: string;
    author: string;
    homepage: string;
  } | null>(null);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAppInfo().then(setAppInfo);
    }
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-4">{t("nav.settings")}</h3>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.language")}</CardTitle>
            <CardDescription>
              Select your preferred language for the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="language" className="w-24">
                {t("settings.language")}
              </Label>
              <Select
                value={i18n.language}
                onValueChange={(val) => i18n.changeLanguage(val)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.appearance")}</CardTitle>
            <CardDescription>Customize the interface theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label className="w-24">{t("theme.label")}</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="gap-2"
                >
                  <Sun className="h-4 w-4" /> {t("theme.light")}
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="gap-2"
                >
                  <Moon className="h-4 w-4" /> {t("theme.dark")}
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="gap-2"
                >
                  <Monitor className="h-4 w-4" /> {t("theme.system")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("logging.title")}</CardTitle>
            <CardDescription>{t("logging.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="logging" className="w-24">
                {t("logging.enable")}
              </Label>
              <Switch
                id="logging"
                checked={config.loggingEnabled}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, loggingEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("overlay.title")}</CardTitle>
            <CardDescription>{t("overlay.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label>{t("overlay.urlLabel")}</Label>
                <code className="bg-muted px-2 py-1 rounded text-sm relative">
                  http://localhost:5173/#/overlay
                </code>
              </div>
              <Button
                variant="secondary"
                onClick={() =>
                  window.open("http://localhost:5173/#/overlay", "_blank")
                }
              >
                <Monitor className="h-4 w-4 mr-2" />
                {t("overlay.preview")}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t("overlay.help")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.about")}</CardTitle>
            <CardDescription>{t("about.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>{t("about.description")}</p>
              <p>
                <strong>{t("about.opensource")}:</strong> {t("about.license")}
              </p>
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="font-semibold">{t("about.developer")}</span>
                <span>{appInfo?.author || "decryptable"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{t("about.website")}</span>
                <a
                  href="#"
                  onClick={() =>
                    window.open(
                      appInfo?.homepage || "https://decryptable.dev",
                      "_blank",
                    )
                  }
                  className="text-primary hover:underline cursor-pointer"
                >
                  {appInfo?.homepage
                    ? new URL(appInfo.homepage).hostname
                    : "decryptable.dev"}
                </a>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{t("about.source")}</span>
                <a
                  href="#"
                  onClick={() =>
                    window.open("https://github.com/decryptable", "_blank")
                  }
                  className="text-primary hover:underline cursor-pointer"
                >
                  github.com/decryptable
                </a>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{t("about.version")}</span>
                <span>v{appInfo?.version || "0.1.0"} (Alpha)</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground pt-2">
              {t("app.copyright", { year: new Date().getFullYear() })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
