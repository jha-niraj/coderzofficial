"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { addComment } from "@/actions/(main)/collective/proposal.actions";
import { toast } from "sonner";
import { useSession } from '@repo/auth';
import { formatDistanceToNow } from "date-fns";

interface CommentsSectionProps {
  proposal: {
    id: string;
    comments: Array<{
      id: string;
      content: string;
      createdAt: Date;
      user: {
        id: string;
        name: string | null;
        image: string | null;
      };
    }>;
  };
}

export function CommentsSection({ proposal }: CommentsSectionProps) {
  const { data: session } = useSession();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addComment(proposal.id, comment);
      toast.success("Comment added!");
      setComment("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Discussion ({proposal.comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {session?.user?.id ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback>
                  {session.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts, suggestions, or questions about this proposal..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!comment.trim() || isSubmitting}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800">
              <a href="/signin" className="font-medium hover:underline">
                Sign in
              </a>{" "}
              to join the discussion
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {proposal.comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
              <p className="text-muted-foreground">
                Be the first to share your thoughts on this proposal!
              </p>
            </div>
          ) : (
            proposal.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.user.image || ""} />
                  <AvatarFallback>
                    {comment.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.user.name || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Guidelines */}
        <div className="bg-gray-50 rounded-lg p-4 border-t">
          <h4 className="font-medium text-sm mb-2">Discussion Guidelines</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Be respectful and constructive in your feedback</li>
            <li>• Suggest specific improvements or alternatives</li>
            <li>• Ask questions to better understand the proposal</li>
            <li>• Share relevant resources or similar challenges</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}






