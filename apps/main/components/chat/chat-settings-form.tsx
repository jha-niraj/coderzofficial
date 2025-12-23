"use client"

import { useState } from "react"
import { updateChatSettings } from "@/actions/(chat)/settings.action"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Save, Loader2, Bell, Volume2, Shield, Eye, MessageCircle, Users } from "lucide-react"
import { toast } from "sonner"
import { cn } from "../../lib/utils"

type ChatSettings = {
    id: string
    userId: string
    messageNotifications: boolean
    soundEnabled: boolean
    allowMessagesFrom: "everyone" | "followers" | "none"
    showOnlineStatus: boolean
    showReadReceipts: boolean
    createdAt: Date
    updatedAt: Date
}

export default function ChatSettingsForm({ settings }: { settings: ChatSettings }) {
    const [formData, setFormData] = useState({
        messageNotifications: settings.messageNotifications,
        soundEnabled: settings.soundEnabled,
        allowMessagesFrom: settings.allowMessagesFrom,
        showOnlineStatus: settings.showOnlineStatus,
        showReadReceipts: settings.showReadReceipts,
    })
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
        setFormData(prev => ({ ...prev, [key]: value }))
        setHasChanges(true)
    }

    const handleSave = async () => {
        setSaving(true)
        const result = await updateChatSettings(formData)

        if (result.success) {
            toast.success("Settings updated successfully")
            setHasChanges(false)
        } else {
            toast.error(result.error || "Failed to update settings")
        }

        setSaving(false)
    }

    return (
        <div className="space-y-6">
            {/* Notifications Section */}
            <Card className="border-border/50">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                            <Bell className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Notifications</CardTitle>
                            <CardDescription>Control how you receive chat notifications</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingRow
                        icon={<MessageCircle className="w-4 h-4" />}
                        label="Message Notifications"
                        description="Receive notifications for new messages"
                    >
                        <Switch
                            checked={formData.messageNotifications}
                            onCheckedChange={(checked) => updateField('messageNotifications', checked)}
                        />
                    </SettingRow>
                    <SettingRow
                        icon={<Volume2 className="w-4 h-4" />}
                        label="Sound Notifications"
                        description="Play a sound when you receive a message"
                    >
                        <Switch
                            checked={formData.soundEnabled}
                            onCheckedChange={(checked) => updateField('soundEnabled', checked)}
                        />
                    </SettingRow>
                </CardContent>
            </Card>

            {/* Privacy Section */}
            <Card className="border-border/50">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                            <Shield className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Privacy</CardTitle>
                            <CardDescription>Manage who can message you and what they can see</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingRow
                        icon={<Users className="w-4 h-4" />}
                        label="Allow Messages From"
                        description="Control who can send you messages"
                    >
                        <Select
                            value={formData.allowMessagesFrom}
                            onValueChange={(value: "everyone" | "followers" | "none") =>
                                updateField('allowMessagesFrom', value)
                            }
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="everyone">Everyone</SelectItem>
                                <SelectItem value="followers">People you follow</SelectItem>
                                <SelectItem value="none">No one</SelectItem>
                            </SelectContent>
                        </Select>
                    </SettingRow>
                    <SettingRow
                        icon={<Eye className="w-4 h-4" />}
                        label="Show Online Status"
                        description="Let others see when you're online"
                    >
                        <Switch
                            checked={formData.showOnlineStatus}
                            onCheckedChange={(checked) => updateField('showOnlineStatus', checked)}
                        />
                    </SettingRow>
                    <SettingRow
                        icon={<MessageCircle className="w-4 h-4" />}
                        label="Show Read Receipts"
                        description="Let others see when you've read their messages"
                    >
                        <Switch
                            checked={formData.showReadReceipts}
                            onCheckedChange={(checked) => updateField('showReadReceipts', checked)}
                        />
                    </SettingRow>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className={cn(
                "sticky bottom-0 p-4 bg-background/95 backdrop-blur border-t border-border/50 -mx-6 -mb-6 transition-all",
                hasChanges ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}>
                <Button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

function SettingRow({
    icon,
    label,
    description,
    children,
}: {
    icon: React.ReactNode
    label: string
    description: string
    children: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-background/50 text-muted-foreground mt-0.5">
                    {icon}
                </div>
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            {children}
        </div>
    )
}