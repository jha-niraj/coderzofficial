"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Loader2 } from "lucide-react";
import { joinChallenge } from "@/actions/(main)/collective/challenge.actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface JoinChallengeButtonProps {
  challengeId: string;
  disabled?: boolean;
}

export function JoinChallengeButton({ challengeId, disabled }: JoinChallengeButtonProps) {
  const { data: session } = useSession();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to join challenges");
      return;
    }

    setIsJoining(true);
    try {
      await joinChallenge(challengeId);
      toast.success("Successfully joined the challenge! 🎉");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to join challenge");
    } finally {
      setIsJoining(false);
    }
  };

  if (!session?.user?.id) {
    return (
      <Button asChild className="w-full">
        <a href="/signin">
          <Users className="w-4 h-4 mr-2" />
          Sign In to Join
        </a>
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleJoin}
      disabled={disabled || isJoining}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    >
      {isJoining ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Joining...
        </>
      ) : (
        <>
          <Users className="w-4 h-4 mr-2" />
          Join Challenge
        </>
      )}
    </Button>
  );
}






