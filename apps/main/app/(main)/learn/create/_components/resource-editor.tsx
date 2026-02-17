
import { useState } from "react";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { Separator } from "@repo/ui/components/ui/separator";
import { Video, Plus, X, Globe } from "lucide-react";
import { StepBlock } from "./types";

export function ResourceEditor({ block, updateBlock }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void }) {
    const data = (block.stepData || {}) as { videos?: { url: string; title?: string; duration?: string }[]; docs?: { url: string; title?: string; type?: string }[] };
    const videos = data.videos || [];
    const docs = data.docs || [];

    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [newVideoTitle, setNewVideoTitle] = useState("");
    const [newDocUrl, setNewDocUrl] = useState("");
    const [newDocTitle, setNewDocTitle] = useState("");

    const updateData = (field: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...block.stepData, [field]: value } });
    };

    const addVideo = () => {
        if (!newVideoUrl.trim()) return;
        updateData("videos", [...videos, { url: newVideoUrl.trim(), title: newVideoTitle.trim() || undefined }]);
        setNewVideoUrl(""); setNewVideoTitle("");
    };

    const addDoc = () => {
        if (!newDocUrl.trim()) return;
        updateData("docs", [...docs, { url: newDocUrl.trim(), title: newDocTitle.trim() || undefined }]);
        setNewDocUrl(""); setNewDocTitle("");
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Videos
                </Label>

                {
                    videos.map((v, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg border bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                            <span className="text-sm">🎬</span>
                            <a href={v.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-blue-600 hover:underline truncate">
                                {v.title || v.url}
                            </a>
                            {v.duration && <span className="text-[10px] text-muted-foreground">{v.duration}</span>}
                            <button onClick={() => updateData("videos", videos.filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-red-500">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                }

                <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                        <Input value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="YouTube URL..." className="h-8 text-xs" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <Input value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} placeholder="Title (optional)" className="h-8 text-xs" />
                    </div>
                    <Button variant="outline" size="sm" onClick={addVideo} disabled={!newVideoUrl.trim()} className="h-8 text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                </div>
            </div>

            <Separator />

            <div className="space-y-3">
                <Label className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Documentation
                </Label>

                {
                    docs.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg border bg-white dark:bg-neutral-900 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
                            <span className="text-sm">📄</span>
                            <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-blue-600 hover:underline truncate">
                                {d.title || d.url}
                            </a>
                            {d.type && <Badge variant="outline" className="text-[10px]">{d.type}</Badge>}
                            <button onClick={() => updateData("docs", docs.filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-red-500">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                }

                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <Input value={newDocUrl} onChange={e => setNewDocUrl(e.target.value)} placeholder="Documentation URL..." className="h-8 text-xs" />
                    </div>
                    <div className="flex-1">
                        <Input value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} placeholder="Title (optional)" className="h-8 text-xs" />
                    </div>
                    <Button variant="outline" size="sm" onClick={addDoc} disabled={!newDocUrl.trim()} className="h-8 text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                </div>
            </div>

            {
                videos.length === 0 && docs.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed border-purple-200 dark:border-purple-900 rounded-2xl bg-purple-50/30 dark:bg-purple-950/10">
                        <Video className="w-8 h-8 mx-auto mb-3 text-purple-400 opacity-50" />
                        <p className="text-sm font-medium mb-1">No Resources Yet</p>
                        <p className="text-xs text-muted-foreground">Use the AI generator to find resources, or add links manually above.</p>
                    </div>
                )
            }
        </div>
    );
}
