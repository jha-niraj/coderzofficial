"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import { Input } from "@repo/ui/components/ui/input";
import {
    UserPlus, Gift, Copy, Check, Users, Coins
} from "lucide-react";
import { toast } from "sonner";

interface ReferralStats {
    totalReferrals: number;
    creditsEarned: number;
    recentReferrals: {
        id: string;
        name: string | null;
        image: string | null;
        createdAt: Date;
    }[];
}

interface ReferralsProps {
    stats: ReferralStats;
}

export default function Referrals({ stats }: ReferralsProps) {
    const [copied, setCopied] = useState(false);

    // Generate referral code (in production, this should come from backend)
    const referralCode = "CODER-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const referralLink = `https://thecoderz.com/signup?ref=${referralCode}`;

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error("Failed to copy");
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Card className="border-primary/10">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                        <UserPlus className="h-4 w-4 text-purple-500" />
                    </div>
                    <CardTitle className="text-lg">Referrals</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-purple-500" />
                            <span className="text-xs text-muted-foreground">
                                Total Referrals
                            </span>
                        </div>
                        <p className="text-xl font-bold text-purple-500">
                            {stats.totalReferrals}
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Coins className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-muted-foreground">
                                Credits Earned
                            </span>
                        </div>
                        <p className="text-xl font-bold text-green-500">
                            {stats.creditsEarned}
                        </p>
                    </motion.div>
                </div>
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Your Referral Code
                    </p>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Input
                                readOnly
                                value={referralCode}
                                className="pr-10 font-mono text-center tracking-wider"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full"
                                onClick={() => copyToClipboard(referralCode)}
                            >
                                {
                                    copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )
                                }
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <Gift className="h-8 w-8 text-purple-500" />
                    <div>
                        <p className="text-sm font-medium">Earn 50 credits per referral!</p>
                        <p className="text-xs text-muted-foreground">
                            When your friend signs up using your code
                        </p>
                    </div>
                </div>
                {
                    stats.recentReferrals.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Recent Referrals
                            </p>
                            <div className="space-y-2">
                                {
                                    stats.recentReferrals.slice(0, 3).map((referral) => (
                                        <motion.div
                                            key={referral.id}
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={referral.image || ""}
                                                    alt={referral.name || "User"}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {referral.name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {referral.name || "New User"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Joined {formatDate(referral.createdAt)}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs bg-green-500/10 text-green-500"
                                            >
                                                +50
                                            </Badge>
                                        </motion.div>
                                    ))
                                }
                            </div>
                        </div>
                    )
                }
            </CardContent>
        </Card>
    );
}