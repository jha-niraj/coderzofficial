"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft, Coins, Lock, Sparkles, CheckCircle, BookOpen,
    Eye, Heart, Clock, Shield
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Card, CardContent
} from "@repo/ui/components/ui/card";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
    DialogFooter
} from "@repo/ui/components/ui/dialog";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import toast from "@repo/ui/components/ui/sonner";
import { purchaseConcept } from "@/actions/(main)/concepts/concept.action";
import {
    ConceptCategory, ConceptDifficulty
} from "@repo/prisma/client";
import { cn } from "@repo/ui/lib/utils";

interface ConceptPurchaseGateProps {
    concept: {
        id: string;
        slug: string;
        title: string;
        description: string;
        category: ConceptCategory;
        difficulty: ConceptDifficulty;
        iconEmoji: string | null;
        accentColor: string | null;
        estimatedTime: number | null;
        tags: string[];
        price: number;
        platformFeePercent: number;
        creator: {
            id: string;
            name: string | null;
            username: string | null;
            image: string | null;
        };
        _count: {
            likes: number;
            views: number;
            bookmarks: number;
            comments: number;
        };
        steps: unknown[];
    };
    userCredits: number;
    isLoggedIn: boolean;
}

const difficultyConfig: Record<ConceptDifficulty, { label: string; color: string }> = {
    BEGINNER: { label: "Beginner", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    INTERMEDIATE: { label: "Intermediate", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    ADVANCED: { label: "Advanced", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    EXPERT: { label: "Expert", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function ConceptPurchaseGate({
    concept,
    userCredits,
    isLoggedIn,
}: ConceptPurchaseGateProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const canAfford = userCredits >= concept.price;

    const handlePurchase = async () => {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        if (!canAfford) {
            toast.error("Insufficient credits");
            return;
        }

        setIsPurchasing(true);
        try {
            const result = await purchaseConcept(concept.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Concept unlocked! Enjoy learning!");
                setIsDialogOpen(false);
                router.refresh();
            }
        } catch {
            toast.error("Failed to purchase concept");
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        {
                            isLoggedIn && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Coins className="w-4 h-4 text-amber-500" />
                                    <span className="font-medium">{userCredits.toLocaleString()} credits</span>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                        <span className="text-4xl">{concept.iconEmoji || "📚"}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                        {concept.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {concept.description}
                    </p>
                </motion.div>
                <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        {concept._count.views} views
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        {concept._count.likes} likes
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        {concept.steps.length} steps
                    </div>
                    {
                        concept.estimatedTime && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {concept.estimatedTime} min
                            </div>
                        )
                    }
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
                    <Badge className={cn(difficultyConfig[concept.difficulty].color)}>
                        {difficultyConfig[concept.difficulty].label}
                    </Badge>
                    {
                        concept.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))
                    }
                </div>
                <Card className="max-w-md mx-auto border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-lg">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Premium Concept</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Unlock this concept to access all steps and learn at your own pace
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Coins className="w-6 h-6 text-amber-500" />
                            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                {concept.price}
                            </span>
                            <span className="text-muted-foreground">credits</span>
                        </div>

                        {
                            !isLoggedIn ? (
                                <Link href="/login">
                                    <Button size="lg" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Login to Purchase
                                    </Button>
                                </Link>
                            ) : !canAfford ? (
                                <div className="space-y-4">
                                    <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                                        <AlertDescription className="text-sm text-red-700 dark:text-red-400">
                                            You need {concept.price - userCredits} more credits to unlock this concept
                                        </AlertDescription>
                                    </Alert>
                                    <Link href="/credits">
                                        <Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                                            <Coins className="w-4 h-4 mr-2" />
                                            Get More Credits
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                    onClick={() => setIsDialogOpen(true)}
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Unlock Now
                                </Button>
                            )
                        }

                        <div className="mt-6 pt-6 border-t border-amber-200 dark:border-amber-800">
                            <div className="flex items-center justify-center gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={concept.creator.image || undefined} />
                                    <AvatarFallback className="text-sm">
                                        {concept.creator.name?.charAt(0) || "C"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <p className="text-sm font-medium">
                                        {concept.creator.name || concept.creator.username || "Creator"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Creator</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-12 max-w-md mx-auto">
                    <h3 className="text-sm font-semibold text-center text-muted-foreground mb-4 tracking-wide">
                        WHAT YOU GET
                    </h3>
                    <div className="space-y-3">
                        {
                            [
                                { icon: BookOpen, text: `${concept.steps.length} detailed learning steps` },
                                { icon: Sparkles, text: "Interactive code examples" },
                                { icon: Shield, text: "Lifetime access" },
                                { icon: CheckCircle, text: "Progress tracking" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <item.icon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                    </div>
                                    {item.text}
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Coins className="w-5 h-5 text-amber-500" />
                            Confirm Purchase
                        </DialogTitle>
                        <DialogDescription>
                            You are about to unlock &ldquo;{concept.title}&rdquo;
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-semibold">{concept.price} credits</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Your balance</span>
                            <span className="font-semibold">{userCredits} credits</span>
                        </div>
                        <div className="border-t pt-4 flex justify-between items-center">
                            <span className="font-medium">Balance after purchase</span>
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {userCredits - concept.price} credits
                            </span>
                        </div>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePurchase}
                            disabled={isPurchasing}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                            {
                                isPurchasing ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Confirm Purchase
                                    </>
                                )
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}