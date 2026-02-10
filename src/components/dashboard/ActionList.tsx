import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { Action, ActionType } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit, Play } from "lucide-react";

export default function ActionList() {
  const { config, addAction, removeAction, updateAction } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Action>>({
    type: "key_tap",
    name: "",
    data: {},
  });

  // Test Capability
  const [testCountdown, setTestCountdown] = useState<Record<string, number>>(
    {},
  );

  const handleOpen = (action?: Action) => {
    if (action) {
      setEditingAction(action);
      setFormData(action);
    } else {
      setEditingAction(null);
      setFormData({
        id: crypto.randomUUID(),
        type: "key_tap",
        name: "New Action",
        data: {},
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.id || !formData.type || !formData.name) return;

    const action = formData as Action;
    if (editingAction) {
      updateAction(action);
    } else {
      addAction(action);
    }
    setIsDialogOpen(false);
  };

  const handleTest = async (action: Action) => {
    if (window.electronAPI) {
      // Add a countdown delay for input actions to allow switching windows
      const needsDelay = [
        "key_tap",
        "key_hold",
        "mouse_click",
        "type_text",
      ].includes(action.type);

      if (needsDelay) {
        // Start Countdown (5 seconds)
        let count = 5;
        setTestCountdown((prev) => ({ ...prev, [action.id]: count }));

        const interval = setInterval(async () => {
          count--;
          if (count <= 0) {
            clearInterval(interval);
            setTestCountdown((prev) => {
              const next = { ...prev };
              delete next[action.id];
              return next;
            });
            await window.electronAPI.testAutomation(action);
          } else {
            setTestCountdown((prev) => ({ ...prev, [action.id]: count }));
          }
        }, 1000);
      } else {
        await window.electronAPI.testAutomation(action);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Configured Actions</h3>
        <Button onClick={() => handleOpen()} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Action
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {config.actions.map((action) => (
              <TableRow key={action.id}>
                <TableCell className="font-medium">{action.name}</TableCell>
                <TableCell className="capitalize">
                  {action.type.replace("_", " ")}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {action.type === "key_tap" && `Tap ${action.data.key}`}
                  {action.type === "key_hold" &&
                    `Hold ${action.data.key} (${action.data.duration}ms)`}
                  {action.type === "mouse_click" &&
                    `Click (${action.data.x}, ${action.data.y})`}
                  {action.type === "tts" && `Say: "${action.data.text}"`}
                  {action.type === "overlay_image" &&
                    `Image: ${action.data.filePath?.split(/[\\/]/).pop()} (${action.data.duration}ms)`}
                  {action.type === "sound" &&
                    `Play: ${action.data.filePath?.split(/[\\/]/).pop()}`}
                  {action.type === "command" && `Run: ${action.data.command}`}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant={
                      testCountdown[action.id] ? "destructive" : "outline"
                    }
                    size="icon"
                    onClick={() => handleTest(action)}
                    disabled={!!testCountdown[action.id]}
                    title="Test Action (5s Delay for Inputs)"
                    className={
                      testCountdown[action.id]
                        ? "w-10 animate-pulse font-bold"
                        : ""
                    }
                  >
                    {testCountdown[action.id] ? (
                      testCountdown[action.id]
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpen(action)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeAction(action.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {config.actions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  No actions configured.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAction ? "Edit Action" : "Add Action"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(val: ActionType) =>
                  setFormData({ ...formData, type: val })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="key_tap">Key Tap</SelectItem>
                  <SelectItem value="key_hold">Key Hold</SelectItem>
                  <SelectItem value="mouse_click">Mouse Click</SelectItem>
                  <SelectItem value="tts">Text to Speech</SelectItem>
                  <SelectItem value="sound">Play Sound</SelectItem>
                  <SelectItem value="overlay_image">Show Image</SelectItem>
                  <SelectItem value="command">Run Command</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Fields based on Type */}
            {(formData.type === "key_tap" || formData.type === "key_hold") && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="key" className="text-right">
                  Key
                </Label>
                <Input
                  id="key"
                  className="col-span-3"
                  value={formData.data?.key || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, key: e.target.value },
                    })
                  }
                  placeholder="e.g. A, SPACE, F1"
                />
              </div>
            )}

            {formData.type === "key_hold" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration (ms)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    className="col-span-3"
                    value={formData.data?.duration || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          duration: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2 justify-end">
                  <Switch
                    id="repeat"
                    checked={formData.data?.repeat || false}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data, repeat: checked },
                      })
                    }
                  />
                  <Label htmlFor="repeat">Repeat (Spam Mode)</Label>
                </div>
              </>
            )}

            {formData.type === "mouse_click" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="x" className="text-right">
                    X
                  </Label>
                  <Input
                    id="x"
                    type="number"
                    className="col-span-3"
                    value={formData.data?.x || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data, x: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="y" className="text-right">
                    Y
                  </Label>
                  <Input
                    id="y"
                    type="number"
                    className="col-span-3"
                    value={formData.data?.y || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data, y: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
              </>
            )}

            {formData.type === "overlay_image" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="filePath" className="text-right">
                    Image File
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        if (window.electronAPI) {
                          const filePath =
                            await window.electronAPI.selectFile();
                          if (filePath) {
                            setFormData({
                              ...formData,
                              data: { ...formData.data, filePath },
                            });
                          }
                        }
                      }}
                    >
                      Select Image
                    </Button>
                    {formData.data?.filePath && (
                      <span
                        className="text-xs text-muted-foreground self-center truncate max-w-[100px]"
                        title={formData.data.filePath}
                      >
                        {formData.data.filePath.split(/[\\/]/).pop()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="imgDuration" className="text-right">
                    Duration (ms)
                  </Label>
                  <Input
                    id="imgDuration"
                    type="number"
                    className="col-span-3"
                    value={formData.data?.duration || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          duration: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </>
            )}

            {formData.type === "tts" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="text" className="text-right">
                  Text
                </Label>
                <Input
                  id="text"
                  className="col-span-3"
                  value={formData.data?.text || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, text: e.target.value },
                    })
                  }
                  placeholder="Hello World"
                />
              </div>
            )}

            {formData.type === "sound" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="soundPath" className="text-right">
                  Sound File
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      if (window.electronAPI) {
                        const filePath = await window.electronAPI.selectFile();
                        if (filePath) {
                          setFormData({
                            ...formData,
                            data: { ...formData.data, filePath },
                          });
                        }
                      }
                    }}
                  >
                    Select Sound
                  </Button>
                  {formData.data?.filePath && (
                    <span
                      className="text-xs text-muted-foreground self-center truncate max-w-[100px]"
                      title={formData.data.filePath}
                    >
                      {formData.data.filePath.split(/[\\/]/).pop()}
                    </span>
                  )}
                </div>
              </div>
            )}

            {formData.type === "command" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="command" className="text-right">
                  Command
                </Label>
                <Input
                  id="command"
                  className="col-span-3"
                  value={formData.data?.command || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, command: e.target.value },
                    })
                  }
                  placeholder="calc.exe"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
