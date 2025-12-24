"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle, DialogTrigger
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
    Coins, Send, ArrowDownLeft, Sparkles
} from "lucide-react";
import toast from "@repo/ui/components/ui/sonner";

interface Transfer {
    id: string;
    amount: number;
    transferReference: string;
    createdAt: Date;
    sender: {
        id: string;
        name: string | null;
        image: string | null;
        username: string | null;
    };
    receiver: {
        id: string;
        name: string | null;
        image: string | null;
        username: string | null;
    };
}

interface ShareCreditsProps {
    transfers: Transfer[];
    currentCredits: number;
}

export default function ShareCredits({ transfers, currentCredits }: ShareCreditsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shareData, setShareData] = useState({
        username: "",
        amount: 10,
        reason: "",
    });

    const handleShare = async () => {
        if (!shareData.username.trim()) {
            toast.error("Please enter a username");
            return;
        }
        if (shareData.amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (shareData.amount > currentCredits) {
            toast.error("Insufficient credits");
            return;
        }

        setIsSubmitting(true);
        try {
            // TODO: Implement share credits action
            toast.success(`Sent ${shareData.amount} credits to @${shareData.username}`);
            setIsOpen(false);
            setShareData({ username: "", amount: 10, reason: "" });
        } catch (error) {
            toast.error("Failed to send credits");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return "Just now";
    };

    return (
        <Card className="border-primary/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <Coins className="h-4 w-4 text-green-500" />
                        </div>
                        <CardTitle className="text-lg">Credits</CardTitle>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Send className="h-3 w-3 mr-1" />
                                Share
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Share Credits</DialogTitle>
                                <DialogDescription>
                                    Send credits to another user
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">
                                        Your balance
                                    </span>
                                    <span className="font-semibold text-green-500">
                                        {currentCredits.toLocaleString()} credits
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="@username"
                                        value={shareData.username}
                                        onChange={(e) =>
                                            setShareData({
                                                ...shareData,
                                                username: e.target.value.replace("@", ""),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        min={1}
                                        max={currentCredits}
                                        value={shareData.amount}
                                        onChange={(e) =>
                                            setShareData({
                                                ...shareData,
                                                amount: parseInt(e.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason (optional)</Label>
                                    <Input
                                        id="reason"
                                        placeholder="Thanks for helping me!"
                                        value={shareData.reason}
                                        onChange={(e) =>
                                            setShareData({
                                                ...shareData,
                                                reason: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleShare} disabled={isSubmitting}>
                                    {isSubmitting ? "Sending..." : "Send Credits"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-4"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">
                                Available Balance
                            </p>
                            <p className="text-2xl font-bold text-green-500">
                                {currentCredits.toLocaleString()}
                            </p>
                        </div>
                        <Sparkles className="h-8 w-8 text-green-500/50" />
                    </div>
                </motion.div>
                <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Recent Transfers
                    </p>
                    {
                        transfers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No recent transfers
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {
                                    transfers.map((transfer) => {
                                        const isSent =
                                            transfer.sender.id !== transfer.receiver.id;
                                        const isReceived = true; // Determine based on current user

                                        return (
                                            <motion.div
                                                key={transfer.id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={transfer.sender.image || ""}
                                                        alt={transfer.sender.name || "User"}
                                                    />
                                                    <AvatarFallback className="text-xs">
                                                        {transfer.sender.name?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        @{transfer.sender.username || "user"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        Credit transfer
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm font-medium text-green-500">
                                                    <ArrowDownLeft className="h-3 w-3" />
                                                    +{transfer.amount}
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                }
                            </div>
                        )
                    }
                </div>
            </CardContent>
        </Card>
    );
}