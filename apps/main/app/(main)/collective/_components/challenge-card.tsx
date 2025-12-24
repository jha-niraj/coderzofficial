"use client";

import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { 
  Avatar, AvatarFallback, AvatarImage 
} from "@repo/ui/components/ui/avatar";
import { Progress } from "@repo/ui/components/ui/progress";
import { 
  Trophy, Users, Calendar, Clock, ExternalLink, Star 
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    playlistUrl?: string | null;
    status: string;
    startDate?: Date | null;
    endDate?: Date | null;
    totalSteps: number;
    xpReward: number;
    creditReward: number;
    createdAt: Date;
    proposal?: {
      proposer: {
        id: string;
        name: string | null;
        image: string | null;
      };
    } | null;
    _count: {
      participations: number;
      steps: number;
    };
  };
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const isActive = challenge.status === "ACTIVE";
  const hasStarted = challenge.startDate ? new Date() >= new Date(challenge.startDate) : true;
  const hasEnded = challenge.endDate ? new Date() > new Date(challenge.endDate) : false;
  
  const daysLeft = challenge.endDate 
    ? Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {challenge.proposal?.proposer && (
              <>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={challenge.proposal.proposer.image || ""} />
                  <AvatarFallback>
                    {challenge.proposal.proposer.name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{challenge.proposal.proposer.name}</p>
                  <p className="text-muted-foreground text-xs">Challenge Creator</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isActive && hasStarted && !hasEnded ? (
              <Badge className="bg-green-100 text-green-800">
                <Trophy className="w-3 h-3 mr-1" />
                Live
              </Badge>
            ) : hasEnded ? (
              <Badge variant="outline">
                Completed
              </Badge>
            ) : (
              <Badge variant="secondary">
                Coming Soon
              </Badge>
            )}
          </div>
        </div>
        
        <div>
          <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
            <Link href={`/communityhub/challenge/${challenge.id}`}>
              {challenge.title}
            </Link>
          </CardTitle>
          <CardDescription className="mt-2 line-clamp-2">
            {challenge.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Challenge Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{challenge._count.participations} participants</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{challenge.totalSteps} steps</span>
          </div>
        </div>

        {/* Timeline */}
        {challenge.startDate && challenge.endDate && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Timeline</span>
              {daysLeft !== null && daysLeft > 0 && (
                <span className="font-medium text-orange-600">
                  {daysLeft} days left
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(challenge.startDate), "MMM d")} - {format(new Date(challenge.endDate), "MMM d, yyyy")}
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Rewards</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {challenge.xpReward > 0 && (
                <span className="text-blue-600 font-medium">
                  {challenge.xpReward} XP
                </span>
              )}
              {challenge.creditReward > 0 && (
                <span className="text-green-600 font-medium">
                  {challenge.creditReward} Credits
                </span>
              )}
            </div>
          </div>
        </div>

        {/* External Links */}
        {challenge.playlistUrl && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="w-4 h-4" />
            <span>Includes learning resources</span>
          </div>
        )}

        {/* Action Button */}
        <Button 
          asChild 
          className="w-full" 
          variant={isActive && hasStarted && !hasEnded ? "default" : "outline"}
          disabled={!hasStarted || hasEnded}
        >
          <Link href={`/communityhub/challenge/${challenge.id}`}>
            {!hasStarted ? "Coming Soon" : 
             hasEnded ? "View Results" : 
             "Join Challenge"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}






