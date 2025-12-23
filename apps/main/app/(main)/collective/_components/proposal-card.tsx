"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, MessageCircle, Clock, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ProposalCardProps {
  proposal: {
    id: string;
    title: string;
    description: string;
    playlistUrl?: string | null;
    estimatedDays: number;
    tags: string[];
    status: string;
    votingEndAt: Date;
    upvotes: number;
    downvotes: number;
    netVotes: number;
    createdAt: Date;
    proposer: {
      id: string;
      name: string | null;
      image: string | null;
      username: string | null;
    };
    _count: {
      votes: number;
      comments: number;
    };
  };
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const isVotingActive = new Date() < new Date(proposal.votingEndAt);
  const timeLeft = formatDistanceToNow(new Date(proposal.votingEndAt), { addSuffix: true });
  
  // Create slug from title
  const slug = proposal.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={proposal.proposer.image || ""} />
              <AvatarFallback>
                {proposal.proposer.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{proposal.proposer.name}</p>
              <p className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isVotingActive ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Clock className="w-3 h-3 mr-1" />
                Voting
              </Badge>
            ) : (
              <Badge variant="outline">
                Ended
              </Badge>
            )}
          </div>
        </div>
        
        <div>
          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
            <Link href={`/communityhub/${slug}/voting`}>
              {proposal.title}
            </Link>
          </CardTitle>
          <CardDescription className="mt-2 line-clamp-2">
            {proposal.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {proposal.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {proposal.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{proposal.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Challenge Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {proposal.estimatedDays} days
          </div>
          {proposal.playlistUrl && (
            <div className="flex items-center gap-1">
              <ExternalLink className="w-4 h-4" />
              Playlist
            </div>
          )}
        </div>

        {/* Voting Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <ThumbsUp className="w-4 h-4 text-green-600" />
              <span className="font-medium">{proposal.upvotes}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <ThumbsDown className="w-4 h-4 text-red-600" />
              <span className="font-medium">{proposal.downvotes}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span>{proposal._count.comments}</span>
            </div>
          </div>
          
          <div className="text-sm font-medium">
            Net: <span className={proposal.netVotes >= 0 ? "text-green-600" : "text-red-600"}>
              {proposal.netVotes > 0 ? "+" : ""}{proposal.netVotes}
            </span>
          </div>
        </div>

        {/* Time Left */}
        {isVotingActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <Clock className="w-4 h-4 inline mr-1" />
              Voting ends {timeLeft}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button asChild className="w-full" variant={isVotingActive ? "default" : "outline"}>
          <Link href={`/communityhub/${slug}/voting`}>
            {isVotingActive ? "Vote & Discuss" : "View Results"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}






