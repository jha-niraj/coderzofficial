"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { Trophy, Medal, Star } from "lucide-react";
import type { LeaderboardUser } from "@/actions/(main)/learn/leaderboard";

interface LeaderboardListProps {
    ranking: LeaderboardUser[];
    currentUserRank: LeaderboardUser | null;
}

export function LeaderboardList({ ranking, currentUserRank }: LeaderboardListProps) {
    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />; // Bronze
        return <span className="font-bold text-muted-foreground w-6 text-center">{rank}</span>;
    };

    return (
        <div className="relative h-[calc(100vh-200px)] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 pb-24 space-y-2">
                {ranking.map((user) => (
                    <div
                        key={user.id}
                        className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border bg-card transition-colors hover:bg-muted/50",
                            user.id === currentUserRank?.id && "border-primary bg-primary/5"
                        )}
                    >
                        <div className="flex-shrink-0 flex items-center justify-center w-8">
                            {getRankIcon(user.rank)}
                        </div>
                        <Avatar className="h-10 w-10 border-2 border-background">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                                {user.name || "Anonymous User"}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                                @{user.username || "user"} • {user.learnsCompleted} Learns completed
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-primary text-lg">
                                {user.score.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                Points
                            </div>
                        </div>
                    </div>
                ))}

                {ranking.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No rankings available yet. Be the first!
                    </div>
                )}
            </div>

            {/* Current User Fixed Bottom */}
            {currentUserRank && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background/95 backdrop-blur shadow-lg border-x border-b rounded-b-xl -mx-4 -mb-4 md:mb-0 md:rounded-xl md:mx-0">
                    <div className="flex items-center gap-4">
                        <div className="text-muted-foreground font-medium text-sm">
                            Your Rank
                        </div>
                        <div className="flex-1" />
                    </div>
                    <div className="flex items-center gap-4 mt-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 font-bold text-primary">
                            #{currentUserRank.rank}
                        </div>
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src={currentUserRank.image || ""} />
                            <AvatarFallback>{currentUserRank.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">
                                {currentUserRank.name} (You)
                            </div>
                        </div>
                        <div className="font-bold text-primary">
                            {currentUserRank.score.toLocaleString()} pts
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
