"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet';
import { Button } from '@repo/ui/components/ui/button';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/ui/avatar';
import { Badge } from '@repo/ui/components/ui/badge';
import {
    MessageSquare, Heart, Send, MoreHorizontal, Trash2, Flag,
    Loader2, ChevronDown
} from 'lucide-react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@repo/ui/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@repo/ui/lib/utils';
import toast from '@repo/ui/components/ui/sonner';

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        id: string;
        name?: string | null;
        username?: string | null;
        image?: string | null;
    };
    likes: number;
    isLiked?: boolean;
    replies?: Comment[];
}

interface CommentsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    spaceId: string;
    stepId?: string;
    stepTitle?: string;
    currentUserId?: string;
}

// Mock data for demonstration
const mockComments: Comment[] = [
    {
        id: '1',
        content: 'This step was really helpful! The project requirements are clear.',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        user: {
            id: 'u1',
            name: 'John Doe',
            username: 'johndoe',
            image: null
        },
        likes: 5,
        isLiked: false
    },
    {
        id: '2',
        content: 'I had some trouble with the authentication part. Anyone else facing similar issues?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        user: {
            id: 'u2',
            name: 'Jane Smith',
            username: 'janesmith',
            image: null
        },
        likes: 3,
        isLiked: true,
        replies: [
            {
                id: '2-1',
                content: 'Yes! Check the documentation link in step 2, it helped me.',
                createdAt: new Date(Date.now() - 1000 * 60 * 45),
                user: {
                    id: 'u3',
                    name: 'Bob Wilson',
                    username: 'bobwilson',
                    image: null
                },
                likes: 2,
                isLiked: false
            }
        ]
    }
];

export default function CommentsSheet({
    open,
    onOpenChange,
    spaceId,
    stepId,
    stepTitle,
    currentUserId
}: CommentsSheetProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const COMMENTS_PER_PAGE = 50;

    const loadComments = useCallback(async (pageNum: number = 1) => {
        if (pageNum === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            // TODO: Replace with actual API call
            // const result = await getComments({ spaceId, stepId, page: pageNum, limit: COMMENTS_PER_PAGE });
            
            // Simulating API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (pageNum === 1) {
                setComments(mockComments);
            } else {
                setComments(prev => [...prev, ...mockComments]);
            }
            
            // For demo, we'll say there's no more after page 1
            setHasMore(pageNum < 2);
            setPage(pageNum);
        } catch (error) {
            console.error('Error loading comments:', error);
            toast.error('Failed to load comments');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [spaceId, stepId]);

    useEffect(() => {
        if (open) {
            loadComments(1);
        }
    }, [open, loadComments]);

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            // TODO: Replace with actual API call
            // await createComment({ spaceId, stepId, content: newComment, parentId: replyingTo });
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const newCommentObj: Comment = {
                id: Date.now().toString(),
                content: newComment,
                createdAt: new Date(),
                user: {
                    id: currentUserId || 'current',
                    name: 'You',
                    username: 'you',
                    image: null
                },
                likes: 0,
                isLiked: false
            };

            if (replyingTo) {
                setComments(prev => prev.map(c => {
                    if (c.id === replyingTo) {
                        return {
                            ...c,
                            replies: [...(c.replies || []), newCommentObj]
                        };
                    }
                    return c;
                }));
            } else {
                setComments(prev => [newCommentObj, ...prev]);
            }

            setNewComment('');
            setReplyingTo(null);
            toast.success('Comment added!');
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikeComment = async (commentId: string) => {
        // TODO: Implement like functionality
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                return {
                    ...c,
                    likes: c.isLiked ? c.likes - 1 : c.likes + 1,
                    isLiked: !c.isLiked
                };
            }
            return c;
        }));
    };

    const handleDeleteComment = async (commentId: string) => {
        // TODO: Implement delete functionality
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast.success('Comment deleted');
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            loadComments(page + 1);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-hidden flex flex-col">
                <SheetHeader className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
                    <SheetTitle className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        Comments
                    </SheetTitle>
                    {
                        stepTitle && (
                            <SheetDescription>
                                Discussion for: {stepTitle}
                            </SheetDescription>
                        )
                    }
                </SheetHeader>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {
                        loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                                    No Comments Yet
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    Be the first to start the discussion!
                                </p>
                            </div>
                        ) : (
                            <>
                                <AnimatePresence>
                                    {
                                        comments.map((comment, index) => (
                                            <CommentItem
                                                key={comment.id}
                                                comment={comment}
                                                currentUserId={currentUserId}
                                                onLike={handleLikeComment}
                                                onDelete={handleDeleteComment}
                                                onReply={(id) => setReplyingTo(id)}
                                                index={index}
                                            />
                                        ))
                                    }
                                </AnimatePresence>
                                {
                                    hasMore && (
                                        <div className="flex justify-center pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                            >
                                                {
                                                    loadingMore ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 mr-2" />
                                                    )
                                                }
                                                Load More
                                            </Button>
                                        </div>
                                    )
                                }
                            </>
                        )
                    }
                </div>

                {/* Comment Input */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    {
                        replyingTo && (
                            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950 rounded-lg px-3 py-2 mb-2">
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                    Replying to comment...
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReplyingTo(null)}
                                    className="h-6 px-2"
                                >
                                    Cancel
                                </Button>
                            </div>
                        )
                    }
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={2}
                            className="resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmitComment();
                                }
                            }}
                        />
                        <Button
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim() || submitting}
                            className="shrink-0"
                        >
                            {
                                submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )
                            }
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

interface CommentItemProps {
    comment: Comment;
    currentUserId?: string;
    onLike: (id: string) => void;
    onDelete: (id: string) => void;
    onReply: (id: string) => void;
    index: number;
    isReply?: boolean;
}

function CommentItem({
    comment,
    currentUserId,
    onLike,
    onDelete,
    onReply,
    index,
    isReply = false
}: CommentItemProps) {
    const isOwn = comment.user.id === currentUserId;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.03 }}
            className={cn("group", isReply ? "ml-10" : "")}
        >
            <div className="flex gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={comment.user.image || undefined} />
                    <AvatarFallback className="text-xs">
                        {comment.user.name?.charAt(0) || comment.user.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-neutral-900 dark:text-white">
                            {comment.user.name || comment.user.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-neutral-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                        {comment.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                        <button
                            onClick={() => onLike(comment.id)}
                            className={cn(
                                "flex items-center gap-1 text-xs transition-colors",
                                comment.isLiked
                                    ? "text-red-500"
                                    : "text-neutral-500 hover:text-red-500"
                            )}
                        >
                            <Heart className={cn("w-4 h-4", comment.isLiked && "fill-current")} />
                            {comment.likes}
                        </button>
                        {
                            !isReply && (
                                <button
                                    onClick={() => onReply(comment.id)}
                                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-blue-500 transition-colors"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Reply
                                </button>
                            )
                        }
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {
                                    isOwn && (
                                        <DropdownMenuItem
                                            onClick={() => onDelete(comment.id)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    )
                                }
                                <DropdownMenuItem>
                                    <Flag className="w-4 h-4 mr-2" />
                                    Report
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Replies */}
            {
                comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 space-y-3">
                        {
                            comment.replies.map((reply, replyIndex) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUserId={currentUserId}
                                    onLike={onLike}
                                    onDelete={onDelete}
                                    onReply={onReply}
                                    index={replyIndex}
                                    isReply
                                />
                            ))
                        }
                    </div>
                )
            }
        </motion.div>
    );
}


