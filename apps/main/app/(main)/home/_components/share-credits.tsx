"use client";

import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import Link from "next/link";
import {
    Coins, Send, ArrowDownLeft, Sparkles
} from "lucide-react";

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
                    <Link href="/sharecredits">
                        <Button variant="outline" size="sm">
                            <Send className="h-3 w-3 mr-1" />
                            Share
                        </Button>
                    </Link>
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