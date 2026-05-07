"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import {
    Share2, Copy, Check, Globe, User, Twitter, Linkedin,
    Facebook, Mail
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import toast from "@repo/ui/components/ui/sonner";

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url: string;
    title: string;
    description?: string;
    type?: "project" | "general";
    visibility?: "PUBLIC" | "PRIVATE";
}

export function ShareDialog({
    open,
    onOpenChange,
    url,
    title,
    description,
    type = "general",
    visibility = "PUBLIC"
}: ShareDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    const handleShareTwitter = () => {
        const text = `Check out "${title}" on BuildrHQ!`;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, "_blank", "noopener,noreferrer");
    };

    const handleShareLinkedIn = () => {
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(shareUrl, "_blank", "noopener,noreferrer");
    };

    const handleShareFacebook = () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, "_blank", "noopener,noreferrer");
    };

    const handleShareEmail = () => {
        const subject = encodeURIComponent(`Check out: ${title}`);
        const body = encodeURIComponent(`I thought you might be interested in this:\n\n${title}\n${description || ""}\n\n${url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const typeLabel = type === "project" ? "Project" : "Content";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-500" />
                        Share {typeLabel}
                    </DialogTitle>
                    <DialogDescription>Share this {type} with others</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Copy Link */}
                    <div className="flex gap-2">
                        <Input value={url} readOnly className="flex-1 bg-neutral-50 dark:bg-neutral-900 text-sm" />
                        <Button onClick={handleCopyLink} variant="outline" size="icon">
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Copy this link to share anywhere</p>

                    {/* Social sharing */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/50" onClick={handleShareTwitter}>
                            <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                            <span className="text-xs">Twitter / X</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/50" onClick={handleShareLinkedIn}>
                            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                            <span className="text-xs">LinkedIn</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/50" onClick={handleShareFacebook}>
                            <Facebook className="w-5 h-5 text-[#1877F2]" />
                            <span className="text-xs">Facebook</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-red-500/10 hover:border-red-500/50" onClick={handleShareEmail}>
                            <Mail className="w-5 h-5 text-red-500" />
                            <span className="text-xs">Email</span>
                        </Button>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 mt-4">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", visibility === "PUBLIC" ? "bg-green-100 dark:bg-green-900/30" : "bg-neutral-200 dark:bg-neutral-800")}>
                            {visibility === "PUBLIC"
                                ? <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                                : <User className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />}
                        </div>
                        <div>
                            <div className="font-medium text-neutral-900 dark:text-white text-sm">
                                {visibility === "PUBLIC" ? `Public ${typeLabel}` : `Private ${typeLabel}`}
                            </div>
                            <div className="text-xs text-neutral-500">
                                {visibility === "PUBLIC" ? "Anyone with the link can view" : "Only invited members can access"}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ShareDialog;
