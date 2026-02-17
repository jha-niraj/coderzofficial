
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Zap, Trash2, Plus } from "lucide-react";
import CodeEditor from "@/components/main/code-editor";
import { StepBlock } from "./types";

export function ChallengeDataEditor({ block, updateBlock }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void }) {
    const data = (block.stepData || {}) as { starterCode?: string; solution?: string; hints?: string[]; language?: string };
    const update = (field: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...block.stepData, [field]: value } });
    };

    if (!data.starterCode && !block.content) {
        return (
            <div className="text-center p-10 border-2 border-dashed border-yellow-200 dark:border-yellow-900 rounded-2xl bg-yellow-50/30 dark:bg-yellow-950/10">
                <Zap className="w-8 h-8 mx-auto mb-3 text-yellow-400 opacity-50" />
                <p className="text-sm font-medium mb-1">No Challenge Generated Yet</p>
                <p className="text-xs text-muted-foreground">Use the AI generator above to create a coding challenge.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 rounded-xl bg-yellow-50/50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-900">
            <Label className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase">Challenge Configuration</Label>
            <div>
                <Label className="text-xs text-muted-foreground">Task Description</Label>
                <Textarea value={block.content} onChange={e => updateBlock(block.localId, { content: e.target.value })} rows={3} className="mt-1 text-sm bg-white dark:bg-neutral-950" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="text-xs text-muted-foreground">Starter Code</Label>
                    <div className="mt-1 rounded-xl overflow-hidden border border-yellow-200 dark:border-yellow-800">
                        <CodeEditor code={data.starterCode || ""} language={data.language || "javascript"} height="180px" showLanguageSelector
                            onChange={code => update("starterCode", code)} onLanguageChange={lang => update("language", lang)} />
                    </div>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Solution</Label>
                    <div className="mt-1 rounded-xl overflow-hidden border border-yellow-200 dark:border-yellow-800">
                        <CodeEditor code={data.solution || ""} language={data.language || "javascript"} height="180px" showLanguageSelector={false}
                            onChange={code => update("solution", code)} />
                    </div>
                </div>
            </div>
            <div>
                <Label className="text-xs text-muted-foreground">Hints</Label>
                {
                    (data.hints || []).map((hint, i) => (
                        <div key={i} className="flex items-center gap-2 mt-1">
                            <Input value={hint} onChange={e => { const hints = [...(data.hints || [])]; hints[i] = e.target.value; update("hints", hints); }} className="flex-1 text-sm h-8" />
                            <button onClick={() => update("hints", (data.hints || []).filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-red-500">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                }
                <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => update("hints", [...(data.hints || []), ""])}>
                    <Plus className="w-3 h-3 mr-1" /> Add Hint
                </Button>
            </div>
        </div>
    );
}
