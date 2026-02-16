"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/ui/button';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@repo/ui/components/ui/sheet';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@repo/ui/components/ui/dialog';
import { Input } from '@repo/ui/components/ui/input';
import { 
    Tabs, TabsContent, TabsList, TabsTrigger 
} from '@repo/ui/components/ui/tabs';
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar';
import { Badge } from '@repo/ui/components/ui/badge';
import { ScrollArea } from '@repo/ui/components/ui/scroll-area';
import {
    ArrowLeft, Settings, Users, Share2, Copy, Check, Globe, MessageSquare,
    Crown, User, BarChart3, Heart, Eye, Layers, Activity, ExternalLink,
    Twitter, Linkedin, Send
} from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import toast from '@repo/ui/components/ui/sonner';
import type { SpaceWithDetails, SpaceActivityFromDB } from '@/types/space';
import { getSpaceActivities } from '@/actions/(main)/space/social.action';
import { formatDistanceToNow } from 'date-fns';

interface SpaceHeaderProps {
    space: SpaceWithDetails;
}

export default function SpaceHeader({ space }: SpaceHeaderProps) {
    const router = useRouter();
    const [membersOpen, setMembersOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [activitiesOpen, setActivitiesOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shareTab, setShareTab] = useState<'link' | 'social' | 'community'>('link');

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/space/${space.slug}`
        : `/space/${space.slug}`;

    const shareTitle = `Check out "${space.title}" on The Coderz!`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const handleShareTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleShareLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleAnalytics = () => {
        router.push(`/space/${space.slug}/analytics`);
    };

    const handleSettings = () => {
        router.push(`/space/${space.slug}/settings`);
    };

    return (
        <>
            <div className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-0 z-10">
                <div className="w-full px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/space">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                                    {space.emoji || '🚀'}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                                        {space.title}
                                    </h1>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        by {space.creator?.name || space.creator?.username || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="font-semibold">{space.memberCount}</span>
                                <span className="text-neutral-500">members</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Layers className="w-4 h-4 text-purple-500" />
                                <span className="font-semibold">{space.totalSteps}</span>
                                <span className="text-neutral-500">steps</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="font-semibold">{space.likeCount}</span>
                                <span className="text-neutral-500">likes</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Eye className="w-4 h-4 text-green-500" />
                                <span className="font-semibold">{space.viewCount}</span>
                                <span className="text-neutral-500">views</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActivitiesOpen(true)}
                                className="hidden sm:flex"
                            >
                                <Activity className="w-4 h-4 mr-2" />
                                Activity
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAnalytics}
                                className="hidden sm:flex"
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setMembersOpen(true)}
                            >
                                <Users className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Members</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShareOpen(true)}
                            >
                                <Share2 className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Share</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSettings}
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Sheet open={membersOpen} onOpenChange={setMembersOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-xl flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Space Members
                        </SheetTitle>
                        <SheetDescription>
                            {space.memberCount} members in this space
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-12 h-12 border-2 border-amber-400">
                                    <AvatarImage src={space.creator?.image || undefined} />
                                    <AvatarFallback className="bg-amber-100 text-amber-700">
                                        {space.creator?.name?.charAt(0) || 'C'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-neutral-900 dark:text-white">
                                            {space.creator?.name || space.creator?.username || 'Creator'}
                                        </span>
                                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                            <Crown className="w-3 h-3 mr-1" />
                                            Creator
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-neutral-500 truncate">
                                        @{space.creator?.username || 'unknown'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-neutral-500 px-1">Members</h3>
                            {
                                space.members && space.members.length > 0 ? (
                                    space.members
                                        .filter((m) => m.userId !== space.creatorId)
                                        .map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                                            >
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={member.user?.image || undefined} />
                                                    <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                                                        {member.user?.name?.charAt(0) || 'M'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-neutral-900 dark:text-white">
                                                            {member.user?.name || 'Member'}
                                                        </span>
                                                        {
                                                            member.role === 'CREATOR' && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Admin
                                                                </Badge>
                                                            )
                                                        }
                                                    </div>
                                                    <p className="text-sm text-neutral-500 truncate">
                                                        {Math.round(member.progressPercent || 0)}% complete
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-neutral-500">
                                                        {member.completedSteps?.length || 0} steps
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-sm text-neutral-500 text-center py-8">
                                        No other members yet
                                    </p>
                                )
                            }
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            <ActivitiesSheet
                open={activitiesOpen}
                onOpenChange={setActivitiesOpen}
                spaceId={space.id}
            />
            <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-blue-500" />
                            Share Space
                        </DialogTitle>
                        <DialogDescription>
                            Share this learning space with others
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs value={shareTab} onValueChange={(v) => setShareTab(v as 'link' | 'social' | 'community')} className="mt-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="link">Link</TabsTrigger>
                            <TabsTrigger value="social">Social</TabsTrigger>
                            <TabsTrigger value="community">Community</TabsTrigger>
                        </TabsList>
                        <TabsContent value="link" className="space-y-4 mt-4">
                            <div className="flex gap-2">
                                <Input
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 bg-neutral-50 dark:bg-neutral-900"
                                />
                                <Button onClick={handleCopyLink} variant="outline">
                                    {
                                        copied ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )
                                    }
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="social" className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex flex-col items-center gap-2"
                                    onClick={handleShareTwitter}
                                >
                                    <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                                    <span className="text-xs">Share on Twitter</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-auto py-4 flex flex-col items-center gap-2"
                                    onClick={handleShareLinkedIn}
                                >
                                    <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                                    <span className="text-xs">Share on LinkedIn</span>
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="community" className="space-y-4 mt-4">
                            <CommunityShareSection />
                        </TabsContent>
                    </Tabs>
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 mt-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2 rounded-lg",
                                space.visibility === 'PUBLIC'
                                    ? "bg-green-100 dark:bg-green-900"
                                    : "bg-neutral-200 dark:bg-neutral-800"
                            )}>
                                {
                                    space.visibility === 'PUBLIC' ? (
                                        <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <User className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                                    )
                                }
                            </div>
                            <div>
                                <div className="font-medium text-neutral-900 dark:text-white">
                                    {space.visibility === 'PUBLIC' ? 'Public Space' : 'Private Space'}
                                </div>
                                <div className="text-xs text-neutral-500">
                                    {
                                        space.visibility === 'PUBLIC'
                                            ? 'Anyone can join this space'
                                            : 'Only invited members can join'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function ActivitiesSheet({
    open,
    onOpenChange,
    spaceId
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    spaceId: string;
}) {
    const [activities, setActivities] = useState<SpaceActivityFromDB[]>([]);
    const [loading, setLoading] = useState(false);

    const loadActivities = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getSpaceActivities(spaceId);
            if (result.success && result.data) {
                setActivities(result.data.activities);
            }
        } catch (err) {
            console.error('Failed to load activities:', err);
        } finally {
            setLoading(false);
        }
    }, [spaceId]);

    useEffect(() => {
        if (open) {
            loadActivities();
        }
    }, [open, loadActivities]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'STEP_COMPLETED': return <Check className="w-4 h-4 text-green-500" />;
            case 'MEMBER_JOINED': return <Users className="w-4 h-4 text-blue-500" />;
            case 'COMMENT_ADDED': return <MessageSquare className="w-4 h-4 text-purple-500" />;
            case 'LIKE_ADDED': return <Heart className="w-4 h-4 text-red-500" />;
            case 'CONTENT_ADDED': return <Layers className="w-4 h-4 text-amber-500" />;
            default: return <Activity className="w-4 h-4 text-neutral-500" />;
        }
    };

    const getActivityText = (activity: SpaceActivityFromDB) => {
        switch (activity.type) {
            case 'STEP_COMPLETED': return 'completed a step';
            case 'MEMBER_JOINED': return 'joined the space';
            case 'COMMENT_ADDED': return 'added a comment';
            case 'LIKE_ADDED': return 'liked a step';
            case 'CONTENT_ADDED': return 'added new content';
            default: return 'performed an action';
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Recent Activity
                    </SheetTitle>
                    <SheetDescription>
                        What&apos;s happening in this space
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-180px)]">
                    {
                        loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                                <p className="text-neutral-500">No recent activity</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {
                                    activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                                        >
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={activity.user?.image || undefined} />
                                                <AvatarFallback className="text-xs">
                                                    {activity.user?.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-neutral-900 dark:text-white">
                                                        {activity.user?.name || 'Someone'}
                                                    </span>
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                                <p className="text-sm text-neutral-500">
                                                    {getActivityText(activity)}
                                                </p>
                                                <span className="text-xs text-neutral-400">
                                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        )
                    }
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

interface CommunityItem {
    id: string;
    name: string;
    image?: string;
}

function CommunityShareSection() {
    const [communities, setCommunities] = useState<CommunityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch user's communities
        // For now, show placeholder
        setLoading(false);
        setCommunities([]);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (communities.length === 0) {
        return (
            <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500 mb-2">No communities yet</p>
                <p className="text-xs text-neutral-400">
                    Join communities to share content with them
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/communities">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Browse Communities
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <p className="text-sm text-neutral-500 mb-3">
                Share to your communities
            </p>
            {
                communities.map((community) => (
                    <Button
                        key={community.id}
                        variant="outline"
                        className="w-full justify-between h-auto py-3"
                        onClick={() => {
                            // TODO: Implement share to community
                            toast.info('Sharing to community coming soon!');
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={community.image} />
                                <AvatarFallback>{community.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{community.name}</span>
                        </div>
                        <Send className="w-4 h-4" />
                    </Button>
                ))
            }
        </div>
    );
}