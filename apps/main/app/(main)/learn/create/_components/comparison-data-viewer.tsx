
import { Label } from "@repo/ui/components/ui/label";
import { BarChart3 } from "lucide-react";
import { StepBlock } from "./types";

export function ComparisonDataViewer({ block, updateBlock: _updateBlock, previewMode: _previewMode }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void; previewMode: boolean }) {
    const data = (block.stepData || {}) as { items?: { title: string; description: string; pros: string[]; cons: string[] }[]; conclusion?: string };

    if (!data.items?.length) {
        return (
            <div className="text-center p-10 border-2 border-dashed border-orange-200 dark:border-orange-900 rounded-2xl bg-orange-50/30 dark:bg-orange-950/10">
                <BarChart3 className="w-8 h-8 mx-auto mb-3 text-orange-400 opacity-50" />
                <p className="text-sm font-medium mb-1">No Comparison Generated Yet</p>
                <p className="text-xs text-muted-foreground">Use the AI generator above to create a comparison.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Label className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase">Comparison</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {
                    data.items.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border bg-orange-50/50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-800">
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            {item.pros?.length > 0 && <div className="mt-2 space-y-0.5">{item.pros.map((p, j) => <p key={j} className="text-xs text-green-600">✓ {p}</p>)}</div>}
                            {item.cons?.length > 0 && <div className="mt-1 space-y-0.5">{item.cons.map((c, j) => <p key={j} className="text-xs text-red-500">✗ {c}</p>)}</div>}
                        </div>
                    ))
                }
            </div>
            {
                data.conclusion && (
                    <div className="p-3 rounded-lg bg-orange-100/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                        <p className="text-xs font-medium">Conclusion:</p>
                        <p className="text-xs text-muted-foreground mt-1">{data.conclusion}</p>
                    </div>
                )
            }
        </div>
    );
}
