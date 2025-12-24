"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Label } from "@repo/ui/components/ui/label";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    ThumbsUp, Star, Loader2, Check, Sparkles, Award, Users
} from "lucide-react";
import toast from "@repo/ui/components/ui/sonner";
import { cn } from "@repo/ui/lib/utils";

interface EndorseSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    skill: {
        id: string;
        name: string;
        level: string;
        category: string;
        endorsements?: Array<{
            id: string;
            endorser: {
                id: string;
                name: string | null;
                image: string | null;
            };
            level: string;
            message: string | null;
        }>;
    };
    targetUser: {
        id: string;
        name: string | null;
        image: string | null;
    };
    onEndorse: (skillId: string, level: string, message?: string) => Promise<void>;
    isOwnProfile: boolean;
}

const ENDORSEMENT_LEVELS = [
    {
        id: "BEGINNER",
        label: "Beginner",
        description: "Just getting started",
        icon: Star,
        color: "text-gray-500 bg-gray-100 dark:bg-gray-800",
    },
    {
        id: "INTERMEDIATE",
        label: "Intermediate",
        description: "Good working knowledge",
        icon: ThumbsUp,
        color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
    },
    {
        id: "ADVANCED",
        label: "Advanced",
        description: "Highly skilled",
        icon: Award,
        color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
    },
    {
        id: "EXPERT",
        label: "Expert",
        description: "Industry expert",
        icon: Sparkles,
        color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
    },
];

export function EndorseSkillModal({
    isOpen,
    onClose,
    skill,
    targetUser,
    onEndorse,
    isOwnProfile,
}: EndorseSkillModalProps) {
    const [selectedLevel, setSelectedLevel] = useState<string>("INTERMEDIATE");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEndorse = async () => {
        if (isOwnProfile) {
            toast.error("You cannot endorse your own skills");
            return;
        }

        setIsSubmitting(true);
        try {
            await onEndorse(skill.id, selectedLevel, message || undefined);
            toast.success(`Endorsed ${targetUser.name}'s ${skill.name} skill!`);
            onClose();
            setMessage("");
            setSelectedLevel("INTERMEDIATE");
        } catch (error) {
            toast.error("Failed to endorse skill");
        } finally {
            setIsSubmitting(false);
        }
    };

    const endorsementCount = skill.endorsements?.length || 0;
    const topEndorsers = skill.endorsements?.slice(0, 5) || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ThumbsUp className="w-5 h-5 text-primary" />
                        {isOwnProfile ? "Skill Endorsements" : `Endorse ${skill.name}`}
                    </DialogTitle>
                    <DialogDescription>
                        {isOwnProfile
                            ? `View who has endorsed your ${skill.name} skill`
                            : `Help ${targetUser.name} by endorsing their ${skill.name} skill`}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                            <h4 className="font-medium">{skill.name}</h4>
                            <p className="text-sm text-muted-foreground">{skill.category}</p>
                        </div>
                        <Badge variant="secondary">{skill.level}</Badge>
                    </div>
                    {
                        endorsementCount > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {endorsementCount} Endorsement{endorsementCount !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="flex -space-x-2">
                                    {
                                        topEndorsers.map((endorsement, index) => (
                                            <Avatar
                                                key={endorsement.id}
                                                className="w-8 h-8 border-2 border-background"
                                                style={{ zIndex: topEndorsers.length - index }}
                                            >
                                                <AvatarImage src={endorsement.endorser.image || ""} />
                                                <AvatarFallback className="text-xs">
                                                    {endorsement.endorser.name?.charAt(0) || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))
                                    }
                                    {
                                        endorsementCount > 5 && (
                                            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                                                +{endorsementCount - 5}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        )
                    }
                    {
                        !isOwnProfile && (
                            <>
                                <div className="space-y-3">
                                    <Label>How would you rate their skill level?</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {
                                            ENDORSEMENT_LEVELS.map((level) => {
                                                const Icon = level.icon;
                                                const isSelected = selectedLevel === level.id;
                                                return (
                                                    <motion.button
                                                        key={level.id}
                                                        type="button"
                                                        onClick={() => setSelectedLevel(level.id)}
                                                        className={cn(
                                                            "p-3 rounded-lg border text-left transition-all",
                                                            isSelected
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:border-primary/50"
                                                        )}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className={cn("p-1 rounded", level.color)}>
                                                                <Icon className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="font-medium text-sm">{level.label}</span>
                                                            {isSelected && (
                                                                <Check className="w-4 h-4 text-primary ml-auto" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {level.description}
                                                        </p>
                                                    </motion.button>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Add a note (optional)</Label>
                                    <Textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Share your experience working with them on this skill..."
                                        rows={3}
                                        maxLength={200}
                                    />
                                    <p className="text-xs text-muted-foreground text-right">
                                        {message.length}/200
                                    </p>
                                </div>
                                <Button
                                    onClick={handleEndorse}
                                    disabled={isSubmitting}
                                    className="w-full"
                                >
                                    {
                                        isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Endorsing...
                                            </>
                                        ) : (
                                            <>
                                                <ThumbsUp className="w-4 h-4 mr-2" />
                                                Endorse Skill
                                            </>
                                        )
                                    }
                                </Button>
                            </>
                        )
                    }
                    {
                        isOwnProfile && endorsementCount === 0 && (
                            <div className="text-center py-6 text-muted-foreground">
                                <ThumbsUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No endorsements yet</p>
                                <p className="text-xs mt-1">
                                    Share your profile to get endorsements from others!
                                </p>
                            </div>
                        )
                    }
                    {
                        isOwnProfile && endorsementCount > 0 && (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {
                                    skill.endorsements?.map((endorsement) => {
                                        const levelConfig = ENDORSEMENT_LEVELS.find(
                                            (l) => l.id === endorsement.level
                                        );
                                        return (
                                            <div
                                                key={endorsement.id}
                                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                                            >
                                                <Avatar className="w-9 h-9">
                                                    <AvatarImage src={endorsement.endorser.image || ""} />
                                                    <AvatarFallback>
                                                        {endorsement.endorser.name?.charAt(0) || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm truncate">
                                                            {endorsement.endorser.name}
                                                        </span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {levelConfig?.label}
                                                        </Badge>
                                                    </div>
                                                    {
                                                        endorsement.message && (
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                "{endorsement.message}"
                                                            </p>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        )
                    }
                </div>
            </DialogContent>
        </Dialog>
    );
}