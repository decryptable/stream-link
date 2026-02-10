import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { Trigger, TriggerType } from "@/shared/types";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit, Play } from "lucide-react";

export default function TriggerList() {
  const {
    config,
    addTrigger,
    removeTrigger,
    updateTrigger,
    simulateEvent,
    availableGifts,
    fetchAvailableGifts,
  } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Trigger>>({
    type: "gift",
    enabled: true,
    actions: [],
  });

  const handleOpen = (trigger?: Trigger) => {
    if (trigger) {
      setEditingTrigger(trigger);
      setFormData(trigger);
    } else {
      setEditingTrigger(null);
      setFormData({
        id: crypto.randomUUID(), // auto-gen ID
        type: "gift",
        enabled: true,
        actions: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.id || !formData.type) return;

    const trigger = formData as Trigger;
    if (editingTrigger) {
      updateTrigger(trigger);
    } else {
      addTrigger(trigger);
    }
    setIsDialogOpen(false);
  };

  const handleSimulate = (trigger: Trigger) => {
    let data: any = {};
    if (trigger.type === "gift") {
      data = {
        giftId: trigger.giftId || 5655,
        repeatCount: trigger.minStreak || 1,
        userId: "test_user",
        nickname: "Test User",
        giftName: trigger.giftName || "Rose",
        repeatEnd: true,
      };
    } else if (trigger.type === "chat") {
      data = {
        comment: trigger.exactMatch || "Test Message",
        userId: "test_user",
        nickname: "Test User",
        msgId: "test_msg_id",
      };
    } else {
      data = {
        userId: "test_user",
        nickname: "Test User",
        displayType: trigger.type === "share" ? "share" : "follow",
      };
    }
    simulateEvent(trigger.type, data);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Configured Triggers</h3>
        <Button onClick={() => handleOpen()} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Trigger
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {config.triggers.map((trigger) => (
              <TableRow key={trigger.id}>
                <TableCell className="capitalize">{trigger.type}</TableCell>
                <TableCell>
                  {trigger.type === "gift" &&
                    (trigger.giftName || `Gift ID: ${trigger.giftId || "Any"}`)}
                  {trigger.type === "chat" &&
                    (trigger.exactMatch
                      ? `"${trigger.exactMatch}"`
                      : trigger.regex
                        ? `Regex: ${trigger.regex}`
                        : "Any Chat")}
                  {["follow", "share", "like", "join"].includes(trigger.type) &&
                    "Any"}
                </TableCell>
                <TableCell>{trigger.actions.length} actions</TableCell>
                <TableCell>
                  <Switch
                    checked={trigger.enabled}
                    onCheckedChange={(checked) =>
                      updateTrigger({ ...trigger, enabled: checked })
                    }
                  />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleSimulate(trigger)}
                    title="Simulate Trigger"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpen(trigger)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeTrigger(trigger.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {config.triggers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  No triggers configured.
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
              {editingTrigger ? "Edit Trigger" : "Add Trigger"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(val: TriggerType) =>
                  setFormData({ ...formData, type: val })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gift">Gift</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="follow">Follow</SelectItem>
                  <SelectItem value="share">Share</SelectItem>
                  <SelectItem value="like">Like</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "gift" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="giftName" className="text-right">
                    Gift Name
                  </Label>
                  <Input
                    id="giftName"
                    className="col-span-3"
                    value={formData.giftName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        giftName: e.target.value || undefined,
                      })
                    }
                    placeholder="Gift Name (e.g. Rose) - Partial Match"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="giftId" className="text-right">
                    Gift ID
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    {availableGifts.length > 0 ? (
                      <Select
                        value={formData.giftId?.toString()}
                        onValueChange={(val) => {
                          const gift = availableGifts.find(
                            (g) => g.id.toString() === val,
                          );
                          setFormData({
                            ...formData,
                            giftId: parseInt(val),
                            giftName: gift?.name, // Auto-fill name
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a gift" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableGifts.map((gift) => (
                            <SelectItem
                              key={gift.id}
                              value={gift.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                {gift.iconUrl && (
                                  <img
                                    src={gift.iconUrl}
                                    className="w-4 h-4 rounded-full"
                                  />
                                )}
                                <span>{gift.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  ({gift.diamondCount} coins)
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="giftId"
                        type="number"
                        value={formData.giftId || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            giftId: parseInt(e.target.value) || undefined,
                          })
                        }
                        placeholder="Exact Gift ID"
                      />
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => fetchAvailableGifts()}
                      title="Fetch Available Gifts"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minStreak" className="text-right">
                    Min Streak
                  </Label>
                  <Input
                    id="minStreak"
                    type="number"
                    className="col-span-3"
                    value={formData.minStreak || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minStreak: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="Minimum streak count (Optional)"
                  />
                </div>
              </>
            )}

            {formData.type === "chat" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exactMatch" className="text-right">
                  Message
                </Label>
                <Input
                  id="exactMatch"
                  className="col-span-3"
                  value={formData.exactMatch || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, exactMatch: e.target.value })
                  }
                  placeholder="Exact match (!jump)"
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cooldown" className="text-right">
                Cooldown
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="cooldown"
                  type="number"
                  className="w-24"
                  value={formData.cooldown || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cooldown: parseInt(e.target.value) || undefined,
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">seconds</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Actions</Label>
              <div className="col-span-3 border rounded-md p-2 h-32 overflow-y-auto">
                {config.actions.map((action) => (
                  <div key={action.id} className="flex items-center gap-2 mb-1">
                    <Switch
                      checked={formData.actions?.includes(action.id)}
                      onCheckedChange={(checked: boolean) => {
                        const current = formData.actions || [];
                        if (checked)
                          setFormData({
                            ...formData,
                            actions: [...current, action.id],
                          });
                        else
                          setFormData({
                            ...formData,
                            actions: current.filter((id) => id !== action.id),
                          });
                      }}
                    />
                    <span className="text-sm">{action.name}</span>
                  </div>
                ))}
                {config.actions.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    No actions available. Create one in Actions tab.
                  </span>
                )}
              </div>
            </div>
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
