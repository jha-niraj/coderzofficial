
import { useState } from "react";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Loader2, Trash2, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "@repo/ui/components/ui/sonner";
import Image from "next/image";
import { StepBlock } from "./types";

export function VisualDataEditor({ block, updateBlock }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void }) {
    const data = (block.stepData || {}) as { images?: { url: string; caption?: string; alt?: string }[]; aiPrompt?: string };
    const images = data.images || [];
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiImagePrompt, setAiImagePrompt] = useState(data.aiPrompt || "");

    const updateData = (key: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...data, [key]: value } });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Using Cloudinary upload (you'll need to implement this action)
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "coderz_Learns");

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );

            const result = await response.json();
            if (result.secure_url) {
                updateData("images", [...images, { url: result.secure_url, caption: "", alt: file.name }]);
                toast.success("Image uploaded!");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAiGenerate = async () => {
        if (!aiImagePrompt.trim()) return;
        setIsGenerating(true);
        try {
            // AI image generation placeholder - would integrate with FalAI
            toast.info("AI image generation coming soon!");
            updateData("aiPrompt", aiImagePrompt);
        } catch {
            toast.error("Failed to generate image");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Images & Diagrams
                </Label>
                <div className="p-4 border-2 border-dashed border-cyan-200 dark:border-cyan-800 rounded-xl bg-cyan-50/30 dark:bg-cyan-950/10">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="visual-upload" disabled={isUploading} />
                    <label htmlFor="visual-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        {
                            isUploading ? (
                                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-cyan-500" />
                            )
                        }
                        <span className="text-sm font-medium">{isUploading ? "Uploading..." : "Click to upload image"}</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
                    </label>
                </div>
                <div className="flex gap-2">
                    <Input
                        value={aiImagePrompt}
                        onChange={e => setAiImagePrompt(e.target.value)}
                        placeholder="Describe the diagram/visual you need..."
                        className="flex-1 text-sm"
                    />
                    <Button onClick={handleAiGenerate} disabled={isGenerating || !aiImagePrompt.trim()} variant="outline" size="sm">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </Button>
                </div>

                {
                    images.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            {
                                images.map((img, i) => (
                                    <div key={i} className="relative group rounded-lg overflow-hidden border">
                                        <Image
                                            src={img.url}
                                            alt={img.alt || ""}
                                            className="w-full h-40 object-cover"
                                            fill
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => updateData("images", images.filter((_, j) => j !== i))}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Input
                                            value={img.caption || ""}
                                            onChange={e => {
                                                const updated = [...images];
                                                updated[i] = { ...img, caption: e.target.value };
                                                updateData("images", updated);
                                            }}
                                            placeholder="Caption..."
                                            className="absolute bottom-0 left-0 right-0 bg-black/70 border-0 text-white text-xs h-8"
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Visual Explanation (Markdown)</Label>
                <Textarea
                    value={block.content}
                    onChange={e => updateBlock(block.localId, { content: e.target.value })}
                    placeholder="Explain what this visual demonstrates..."
                    rows={6}
                    className="font-mono text-sm"
                />
            </div>
        </div>
    );
}
