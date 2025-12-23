import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { getChallengeLeaderboard } from "@/actions/(main)/collective/challenge.actions";

interface ChallengeLeaderboardProps {
  challengeId: string;
}

export async function ChallengeLeaderboard({ challengeId }: ChallengeLeaderboardProps) {
  const leaderboard = await getChallengeLeaderboard(challengeId);

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            Challenge leaderboard will appear here once participants start completing steps
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Rankings Yet</h3>
          <p className="text-muted-foreground">
            Be the first to complete steps and climb the leaderboard!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 2: return "bg-gray-100 text-gray-800 border-gray-300";
      case 3: return "bg-amber-100 text-amber-800 border-amber-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          Top performers in this challenge
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {leaderboard.slice(0, 10).map((entry) => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              entry.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200" : "bg-gray-50"
            }`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8">
              {getRankIcon(entry.rank)}
            </div>

            {/* User Info */}
            <Avatar className="w-10 h-10">
              <AvatarImage src={entry.user.image || ""} />
              <AvatarFallback>
                {entry.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">
                  {entry.user.name || entry.user.username || "Anonymous"}
                </p>
                {entry.rank <= 3 && (
                  <Badge variant="outline" className={getRankBadge(entry.rank)}>
                    #{entry.rank}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {Math.round(entry.completionRate)}% complete
                </span>
                <span className="text-blue-600 font-medium">
                  {entry.totalXp} XP
                </span>
              </div>
            </div>

            {/* Rank Display for lower ranks */}
            {entry.rank > 3 && (
              <div className="text-right">
                <div className="text-lg font-bold text-muted-foreground">
                  #{entry.rank}
                </div>
              </div>
            )}
          </div>
        ))}

        {leaderboard.length > 10 && (
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing top 10 of {leaderboard.length} participants
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}






