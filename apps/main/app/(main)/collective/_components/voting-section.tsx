"use client";

import { useState, useOptimistic } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { ThumbsUp, ThumbsDown, Users } from "lucide-react";
import { voteOnProposal } from "@/actions/(main)/collective/proposal.actions";
import { toast } from "sonner";
import { useSession } from '@repo/auth';

interface VotingSectionProps {
  proposal: {
    id: string;
    upvotes: number;
    downvotes: number;
    netVotes: number;
    votingEndAt: Date;
    votes: Array<{
      id: string;
      value: number;
      userId: string;
      user: {
        id: string;
        name: string | null;
        image: string | null;
      };
    }>;
  };
}

export function VotingSection({ proposal }: VotingSectionProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);
  
  const isVotingActive = new Date() < new Date(proposal.votingEndAt);
  const userVote = proposal.votes.find(vote => vote.userId === session?.user?.id);
  
  // Optimistic updates for vote counts
  const [optimisticVotes, setOptimisticVotes] = useOptimistic(
    { upvotes: proposal.upvotes, downvotes: proposal.downvotes, netVotes: proposal.netVotes },
    (state, newVote: { value: number; previousValue?: number }) => {
      let upvotes = state.upvotes;
      let downvotes = state.downvotes;
      
      // Remove previous vote if exists
      if (newVote.previousValue === 1) upvotes--;
      if (newVote.previousValue === -1) downvotes--;
      
      // Add new vote
      if (newVote.value === 1) upvotes++;
      if (newVote.value === -1) downvotes++;
      
      return {
        upvotes,
        downvotes,
        netVotes: upvotes - downvotes,
      };
    }
  );

  const handleVote = async (value: number) => {
    if (!session?.user?.id) {
      toast.error("Please sign in to vote");
      return;
    }

    if (!isVotingActive) {
      toast.error("Voting period has ended");
      return;
    }

    setIsVoting(true);
    
    // Optimistic update
    setOptimisticVotes({ value, previousValue: userVote?.value });
    
    try {
      await voteOnProposal(proposal.id, value);
      toast.success(value === 1 ? "Upvoted!" : "Downvoted!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to vote");
      // Revert optimistic update on error
      setOptimisticVotes({ value: userVote?.value || 0, previousValue: value });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Community Voting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vote Buttons */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <Button
              size="lg"
              variant={userVote?.value === 1 ? "default" : "outline"}
              className={`w-20 h-20 rounded-full ${
                userVote?.value === 1 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "hover:bg-green-50 hover:border-green-300"
              }`}
              onClick={() => handleVote(1)}
              disabled={!isVotingActive || isVoting}
            >
              <ThumbsUp className="w-8 h-8" />
            </Button>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-600">
                {optimisticVotes.upvotes}
              </div>
              <div className="text-sm text-muted-foreground">Upvotes</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold mb-1">
              <span className={optimisticVotes.netVotes >= 0 ? "text-green-600" : "text-red-600"}>
                {optimisticVotes.netVotes > 0 ? "+" : ""}{optimisticVotes.netVotes}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Net Score</div>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              variant={userVote?.value === -1 ? "destructive" : "outline"}
              className={`w-20 h-20 rounded-full ${
                userVote?.value === -1 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "hover:bg-red-50 hover:border-red-300"
              }`}
              onClick={() => handleVote(-1)}
              disabled={!isVotingActive || isVoting}
            >
              <ThumbsDown className="w-8 h-8" />
            </Button>
            <div className="mt-2">
              <div className="text-2xl font-bold text-red-600">
                {optimisticVotes.downvotes}
              </div>
              <div className="text-sm text-muted-foreground">Downvotes</div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {!session?.user?.id && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800">
              <a href="/signin" className="font-medium hover:underline">
                Sign in
              </a>{" "}
              to vote on this proposal
            </p>
          </div>
        )}

        {!isVotingActive && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-800 font-medium">
              Voting period has ended
            </p>
            <p className="text-sm text-gray-600 mt-1">
              This proposal is now being reviewed by the admin team
            </p>
          </div>
        )}

        {userVote && isVotingActive && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800">
              You {userVote.value === 1 ? "upvoted" : "downvoted"} this proposal
            </p>
            <p className="text-sm text-green-600 mt-1">
              You can change your vote anytime before voting ends
            </p>
          </div>
        )}

        {/* Voting Guidelines */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Voting Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Upvote if you'd like to see this as a challenge</li>
            <li>• Consider the learning value and feasibility</li>
            <li>• Downvote only if the proposal needs significant improvement</li>
            <li>• Use comments to provide constructive feedback</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}






