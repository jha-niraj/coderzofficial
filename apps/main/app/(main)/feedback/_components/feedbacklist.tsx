"use client"

import { useState, useEffect } from "react"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { 
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter 
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDistanceToNow } from "date-fns"
import {
    ChevronUp, Award, Gift, LightbulbIcon
} from "lucide-react"
import { useSession } from '@repo/auth'
import { FeedbackStatus, FeedbackCategory, Role } from "@prisma/client"
import Image from "next/image"
import { useFeedbackStore } from "@/app/store/feedbackStore"

const getCategoryColor = (category: string) => {
    switch (category) {
        case "BUG":
            return "destructive"
        case "FEATURE":
            return "default"
        case "UI":
            return "secondary"
        default:
            return "outline"
    }
}
const getStatusColor = (status: string) => {
    switch (status) {
        case "PENDING":
        case "UNDER_REVIEW":
            return "secondary"
        case "PLANNED":
            return "default"
        case "COMPLETED":
            return "default"
        default:
            return "outline"
    }
}

interface FeedbackItem {
    id: string;
    title: string;
    description: string;
    category: FeedbackCategory;
    status: FeedbackStatus;
    createdAt: Date;
    upvotes: number;
    imageUrl?: string | null;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
    rewards?: {
        id: string;
        type: string;
        credits: number | null;
        xp: number | null;
        description: string;
    } | null;
}

interface FeedbackListProps {
    status: string;
    onStatusChange: (status: string) => void;
    setFeedbackSheetStatus: () => void;
}

export default function FeedbackList({ status, onStatusChange, setFeedbackSheetStatus }: FeedbackListProps) {
    const { data: session } = useSession();
    const { feedbackByStatus, loading, fetchFeedback } = useFeedbackStore();
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
    const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null)
    const [rewardData, setRewardData] = useState({
        type: "credits",
        credits: 50,
        xp: 0,
        description: "Feedback reward",
    });
    const [assigningReward, setAssigningReward] = useState(false);
    const isAdmin = session?.user?.role === Role.Admin;

    const getStatusEnum = (statusStr: string) => {
        switch (statusStr) {
            case "planned":
                return FeedbackStatus.PLANNED
            case "completed":
                return FeedbackStatus.COMPLETED
            default:
                return FeedbackStatus.UNDER_REVIEW
        }
    }

    useEffect(() => {
        fetchFeedback(getStatusEnum(status));
    }, [status, fetchFeedback]);

    // Feedback items are already sorted by newest first from the server
    const feedbackItems = feedbackByStatus[status] || [];

    const handleStatusChange = async (id: string, newStatus: string) => {
        await useFeedbackStore.getState().updateFeedbackStatus(id, newStatus as FeedbackStatus);
        if (onStatusChange) {
            onStatusChange(status);
        }
    }

    const handleUpvote = async (id: string) => {
        await useFeedbackStore.getState().upvoteFeedback(id);
    }

    const handleReward = (feedback: FeedbackItem) => {
        setSelectedFeedback(feedback)
    }

    const submitReward = async () => {
        if (!selectedFeedback) return;

        setAssigningReward(true);
        try {
            await useFeedbackStore.getState().assignReward(selectedFeedback.id, {
                type: rewardData.type,
                credits: rewardData.type === "credits" ? rewardData.credits : 0,
                xp: rewardData.type === "xp" ? rewardData.xp : 0,
                description: rewardData.description,
            });
            setSelectedFeedback(null);
        } finally {
            setAssigningReward(false);
        }
    };

    if (loading[status]) {
        return (
            <div className="space-y-3">
                {
                    [1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-5 w-12" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <div className="flex items-center justify-between pt-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    ))
                }
            </div>
        )
    }

    if (feedbackItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-full mb-4">
                    <LightbulbIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    No feedback yet
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-3">
                {
                    feedbackItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-lg p-4 transition-all duration-300 hover:shadow-lg cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2 flex-1">
                                    {item.title}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex flex-col items-center gap-0 h-auto py-1 px-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 ml-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpvote(item.id);
                                    }}
                                >
                                    <ChevronUp className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{item.upvotes}</span>
                                </Button>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
                                {item.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-500">
                                <div className="flex items-center gap-2">
                                    <span className="truncate">
                                        {item.user.name?.split(' ')[0] || 'Anonymous'}
                                    </span>
                                    <span>•</span>
                                    <span className="truncate">
                                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>

                            {
                                item.rewards && (
                                    <div className="mt-3 flex items-center gap-2 p-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                                        <Award className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                        <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                                            {
                                                item.rewards.type === "credits"
                                                    ? `${item.rewards.credits} credits`
                                                    : `${item.rewards.xp} XP`
                                            }
                                        </span>
                                    </div>
                                )
                            }
                        </div>
                    ))
                }
            </div>
            <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <SheetContent 
                    className="max-w-2xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    side="right"
                    style={{ maxWidth: '500px' }}
                >
                    {
                        selectedItem && (
                            <>
                                <SheetHeader>
                                    <SheetTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 pr-6">
                                        {selectedItem.title}
                                    </SheetTitle>
                                    <SheetDescription className="text-neutral-600 dark:text-neutral-400">
                                        Submitted by {selectedItem.user.name} • {formatDistanceToNow(new Date(selectedItem.createdAt), { addSuffix: true })}
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="space-y-6 py-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Description</h4>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                                            {selectedItem.description}
                                        </p>
                                    </div>

                                    {
                                        selectedItem.imageUrl && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Attached Image</h4>
                                                <Image
                                                    src={selectedItem.imageUrl}
                                                    alt="Feedback attachment"
                                                    width={300}
                                                    height={200}
                                                    className="w-full h-auto rounded-lg border border-neutral-200 dark:border-neutral-800"
                                                />
                                            </div>
                                        )
                                    }

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-500">Category:</span>
                                            <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium">
                                                {selectedItem.category.charAt(0) + selectedItem.category.slice(1).toLowerCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-500">Upvotes:</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 h-7 px-3"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUpvote(selectedItem.id);
                                                }}
                                            >
                                                <ChevronUp className="h-3 w-3" />
                                                <span className="text-xs font-medium">{selectedItem.upvotes}</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {
                                        selectedItem.rewards && (
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                <div>
                                                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Rewarded!</p>
                                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                                        {
                                                        selectedItem.rewards.description} - {
                                                            selectedItem.rewards.type === "credits"
                                                                ? `${selectedItem.rewards.credits} credits`
                                                                : `${selectedItem.rewards.xp} XP`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    }

                                    {
                                        isAdmin && (
                                            <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                                {
                                                    !selectedItem.rewards && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReward(selectedItem)}
                                                        >
                                                            <Gift className="h-4 w-4 mr-2" />
                                                            Assign Reward
                                                        </Button>
                                                    )
                                                }
                                                {
                                                    selectedItem.status !== FeedbackStatus.COMPLETED && (
                                                        <Select onValueChange={(value) => handleStatusChange(selectedItem.id, value)}>
                                                            <SelectTrigger className="w-48">
                                                                <SelectValue placeholder="Change Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {
                                                                    selectedItem.status !== FeedbackStatus.UNDER_REVIEW && (
                                                                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                                                    )
                                                                }
                                                                {
                                                                    selectedItem.status !== FeedbackStatus.PLANNED && (
                                                                        <SelectItem value="PLANNED">Planned</SelectItem>
                                                                    )
                                                                }
                                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                                <SheetFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedItem(null)}
                                        className="w-full sm:w-auto"
                                    >
                                        Close
                                    </Button>
                                </SheetFooter>
                            </>
                        )
                    }
                </SheetContent>
            </Sheet>
            <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Reward</DialogTitle>
                        <DialogDescription>
                            Recognize {selectedFeedback?.user.name}&apos;s contribution for &quot;{selectedFeedback?.title}&quot;
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reward-type" className="text-right">
                                Type
                            </Label>
                            <Select
                                value={rewardData.type}
                                onValueChange={(value) => setRewardData({ ...rewardData, type: value, credits: value === 'credits' ? rewardData.credits : 0, xp: value === 'xp' ? rewardData.xp : 0 })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select reward type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credits">Credits</SelectItem>
                                    <SelectItem value="xp">XP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {
                            rewardData.type === 'credits' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="credits" className="text-right">
                                        Credits
                                    </Label>
                                    <Input
                                        id="credits"
                                        type="number"
                                        value={rewardData.credits || ''}
                                        onChange={(e) => setRewardData({ ...rewardData, credits: Number.parseInt(e.target.value) || 0 })}
                                        className="col-span-3"
                                        placeholder="Enter credits"
                                    />
                                </div>
                            )
                        }
                        {
                            rewardData.type === 'xp' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="xp" className="text-right">
                                        XP
                                    </Label>
                                    <Input
                                        id="xp"
                                        type="number"
                                        value={rewardData.xp || ''}
                                        onChange={(e) => setRewardData({ ...rewardData, xp: Number.parseInt(e.target.value) || 0 })}
                                        className="col-span-3"
                                        placeholder="Enter XP"
                                    />
                                </div>
                            )
                        }
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                value={rewardData.description}
                                onChange={(e) => setRewardData({ ...rewardData, description: e.target.value })}
                                className="col-span-3"
                                placeholder="e.g., Reward for valuable feedback"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
                            Cancel
                        </Button>
                        <Button onClick={submitReward} disabled={!rewardData.type || (!rewardData.credits && !rewardData.xp) || assigningReward}>
                            {
                                assigningReward ? "Assigning Reward..." : "Assign Reward"
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}