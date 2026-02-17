"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
    Share2, Copy, Check, Globe, User, Twitter, Linkedin, Send,
    MessageSquare, Loader2, Facebook, Mail, Link2
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import toast from "@repo/ui/components/ui/sonner";
import { getUserCommunities } from "@/actions/(main)/community/community.action";
import { createPost } from "@/actions/(main)/community/post.action";

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url: string;
    title: string;
    description?: string;
    image?: string;
    type?: "space" | "Learn" | "project" | "studio" | "general";
    entityId?: string;
    visibility?: "PUBLIC" | "PRIVATE";
}

interface UserCommunity {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    themeColor: string;
}

export function ShareDialog({
    open,
    onOpenChange,
    url,
    title,
    description,
    type = "general",
    entityId,
    visibility = "PUBLIC"
}: ShareDialogProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<"link" | "social" | "community">("link");
    const [communities, setCommunities] = useState<UserCommunity[]>([]);
    const [loadingCommunities, setLoadingCommunities] = useState(false);
    const [sharingTo, setSharingTo] = useState<string | null>(null);

    // Load user's communities when community tab is selected
    useEffect(() => {
        if (activeTab === "community" && communities.length === 0) {
            loadCommunities();
        }
    }, [activeTab, communities.length]);

    const loadCommunities = async () => {
        setLoadingCommunities(true);
        try {
            const result = await getUserCommunities();
            if (result.success && result.data) {
                setCommunities(result.data as UserCommunity[]);
            }
        } catch {
            toast.error("Failed to load communities");
        } finally {
            setLoadingCommunities(false);
        }
    };

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
        const text = `Check out "${title}" on The Coderz!`;
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

    const handleShareToCommunity = async (community: UserCommunity) => {
        if (!entityId) {
            toast.error("Cannot share this content");
            return;
        }

        setSharingTo(community.id);
        try {
            const content = `🔗 Check out this ${type}: **${title}**\n\n${description || ""}\n\n[View ${type}](${url})`;

            const embeds = [{
                itemType: type,
                id: entityId,
                title,
                description,
                url
            }];

            const result = await createPost({
                communityId: community.id,
                content,
                type: "SHOWCASE",
                embeds,
            });

            if (result.success) {
                toast.success(`Shared to ${community.name}!`);
            } else {
                toast.error(result.error || "Failed to share");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setSharingTo(null);
        }
    };

    const getTypeLabel = () => {
        switch (type) {
            case "space": return "Space";
            case "Learn": return "Learn";
            case "project": return "Project";
            case "studio": return "Studio";
            default: return "Content";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-500" />
                        Share {getTypeLabel()}
                    </DialogTitle>
                    <DialogDescription>
                        Share this {type} with others
                    </DialogDescription>
                </DialogHeader>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "link" | "social" | "community")} className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="link" className="gap-1.5">
                            <Link2 className="w-3.5 h-3.5" />
                            Link
                        </TabsTrigger>
                        <TabsTrigger value="social" className="gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            Social
                        </TabsTrigger>
                        <TabsTrigger value="community" className="gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Community
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="link" className="space-y-4 mt-4">
                        <div className="flex gap-2">
                            <Input
                                value={url}
                                readOnly
                                className="flex-1 bg-neutral-50 dark:bg-neutral-900 text-sm"
                            />
                            <Button onClick={handleCopyLink} variant="outline" size="icon">
                                {
                                    copied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )
                                }
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Copy this link to share anywhere
                        </p>
                    </TabsContent>
                    <TabsContent value="social" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/50"
                                onClick={handleShareTwitter}
                            >
                                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                                <span className="text-xs">Twitter / X</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/50"
                                onClick={handleShareLinkedIn}
                            >
                                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                                <span className="text-xs">LinkedIn</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/50"
                                onClick={handleShareFacebook}
                            >
                                <Facebook className="w-5 h-5 text-[#1877F2]" />
                                <span className="text-xs">Facebook</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-red-500/10 hover:border-red-500/50"
                                onClick={handleShareEmail}
                            >
                                <Mail className="w-5 h-5 text-red-500" />
                                <span className="text-xs">Email</span>
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="community" className="space-y-4 mt-4">
                        {
                            loadingCommunities ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : communities.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                                    <p className="text-neutral-500 mb-2">No communities yet</p>
                                    <p className="text-xs text-neutral-400">
                                        Join communities to share content with them
                                    </p>
                                </div>
                            ) : (
                                <ScrollArea className="max-h-[200px]">
                                    <div className="space-y-2">
                                        {
                                            communities.map((community) => (
                                                <Button
                                                    key={community.id}
                                                    variant="outline"
                                                    className="w-full justify-between h-auto py-3"
                                                    onClick={() => handleShareToCommunity(community)}
                                                    disabled={sharingTo === community.id}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={community.logo || undefined} />
                                                            <AvatarFallback
                                                                style={{ backgroundColor: community.themeColor + "20" }}
                                                                className="text-xs font-semibold"
                                                            >
                                                                {community.name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">{community.name}</span>
                                                    </div>
                                                    {
                                                        sharingTo === community.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Send className="w-4 h-4" />
                                                        )
                                                    }
                                                </Button>
                                            ))
                                        }
                                    </div>
                                </ScrollArea>
                            )
                        }
                    </TabsContent>
                </Tabs>
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 mt-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            visibility === "PUBLIC"
                                ? "bg-green-100 dark:bg-green-900/30"
                                : "bg-neutral-200 dark:bg-neutral-800"
                        )}>
                            {
                                visibility === "PUBLIC" ? (
                                    <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                    <User className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                                )
                            }
                        </div>
                        <div>
                            <div className="font-medium text-neutral-900 dark:text-white text-sm">
                                {visibility === "PUBLIC" ? `Public ${getTypeLabel()}` : `Private ${getTypeLabel()}`}
                            </div>
                            <div className="text-xs text-neutral-500">
                                {
                                    visibility === "PUBLIC"
                                        ? "Anyone with the link can view"
                                        : "Only invited members can access"
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ShareDialog;