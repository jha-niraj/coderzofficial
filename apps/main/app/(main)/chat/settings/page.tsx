import { getChatSettings } from "@/actions/(chat)/settings.action"
import ChatSettingsForm from "@/components/chat/chat-settings-form"
import { Settings2 } from "lucide-react"

export default async function SettingsPage() {
    const { settings } = await getChatSettings()

    return (
        <div className="h-full overflow-y-auto">
            <div className="border-b border-border/50 p-6 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
                        <Settings2 className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                            Chat Settings
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Customize your messaging experience
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-6 max-w-2xl">
                {settings && <ChatSettingsForm settings={settings} />}
            </div>
        </div>
    )
}