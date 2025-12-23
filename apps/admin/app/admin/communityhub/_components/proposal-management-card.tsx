"use client";

import { useState } from "react";
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	ThumbsUp, ThumbsDown, MessageCircle, CheckCircle, X, ExternalLink,
	Calendar, TrendingUp
} from "lucide-react";
import {
	approveProposal, rejectProposal
} from "@/actions/(main)/collective/admin.actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { CreateChallengeDialog } from "./create-challenge-dialog";
import Link from "next/link";

interface ProposalManagementCardProps {
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

export function ProposalManagementCard({ proposal }: ProposalManagementCardProps) {
	const [isProcessing, setIsProcessing] = useState(false);

	const handleApprove = async () => {
		setIsProcessing(true);
		try {
			await approveProposal(proposal.id);
			toast.success("Proposal approved successfully!");
		} catch (error) {
			toast.error("Failed to approve proposal");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleReject = async () => {
		setIsProcessing(true);
		try {
			await rejectProposal(proposal.id);
			toast.success("Proposal rejected");
		} catch (error) {
			toast.error("Failed to reject proposal");
		} finally {
			setIsProcessing(false);
		}
	};

	const getScoreColor = (score: number) => {
		if (score >= 10) return "text-green-600";
		if (score >= 5) return "text-yellow-600";
		return "text-red-600";
	};

	const getScoreBadge = (score: number) => {
		if (score >= 10) return "High";
		if (score >= 5) return "Medium";
		return "Low";
	};

	return (
		<Card className="border-l-4 border-l-blue-500">
			<CardHeader className="space-y-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<Avatar className="w-10 h-10">
							<AvatarImage src={proposal.proposer.image || ""} />
							<AvatarFallback>
								{proposal.proposer.name?.charAt(0) || "U"}
							</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-medium">{proposal.proposer.name}</p>
							<p className="text-sm text-muted-foreground">
								{formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge
							variant={proposal.netVotes >= 10 ? "default" : proposal.netVotes >= 5 ? "secondary" : "destructive"}
						>
							<TrendingUp className="w-3 h-3 mr-1" />
							{getScoreBadge(proposal.netVotes)}
						</Badge>
					</div>
				</div>
				<div>
					<CardTitle className="text-lg">{proposal.title}</CardTitle>
					<CardDescription className="mt-2 line-clamp-3">
						{proposal.description}
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-wrap gap-1">
					{
						proposal.tags.slice(0, 4).map((tag) => (
							<Badge key={tag} variant="outline" className="text-xs">
								{tag}
							</Badge>
						))
					}
					{
						proposal.tags.length > 4 && (
							<Badge variant="outline" className="text-xs">
								+{proposal.tags.length - 4}
							</Badge>
						)
					}
				</div>
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div className="flex items-center gap-2">
						<Calendar className="w-4 h-4 text-muted-foreground" />
						<span>{proposal.estimatedDays} days</span>
					</div>
					{
						proposal.playlistUrl && (
							<div className="flex items-center gap-2">
								<ExternalLink className="w-4 h-4 text-muted-foreground" />
								<Link
									href={proposal.playlistUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline truncate"
								>
									Resource
								</Link>
							</div>
						)
					}
				</div>
				<div className="bg-gray-50 rounded-lg p-4">
					<div className="grid grid-cols-3 gap-4 text-center">
						<div>
							<div className="flex items-center justify-center gap-1 text-green-600">
								<ThumbsUp className="w-4 h-4" />
								<span className="font-semibold">{proposal.upvotes}</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1">Upvotes</p>
						</div>
						<div>
							<div className="flex items-center justify-center gap-1 text-red-600">
								<ThumbsDown className="w-4 h-4" />
								<span className="font-semibold">{proposal.downvotes}</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1">Downvotes</p>
						</div>
						<div>
							<div className="flex items-center justify-center gap-1 text-muted-foreground">
								<MessageCircle className="w-4 h-4" />
								<span className="font-semibold">{proposal._count.comments}</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1">Comments</p>
						</div>
					</div>
					<div className="mt-3 pt-3 border-t text-center">
						<div className={`text-lg font-bold ${getScoreColor(proposal.netVotes)}`}>
							Net Score: {proposal.netVotes > 0 ? "+" : ""}{proposal.netVotes}
						</div>
					</div>
				</div>
				<div className="text-sm text-muted-foreground">
					<p>
						Voting ended {formatDistanceToNow(new Date(proposal.votingEndAt), { addSuffix: true })}
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={handleReject}
						variant="outline"
						size="sm"
						disabled={isProcessing}
						className="flex-1 hover:bg-red-50 hover:border-red-300"
					>
						<X className="w-4 h-4 mr-2" />
						Reject
					</Button>
					<Button
						onClick={handleApprove}
						size="sm"
						disabled={isProcessing}
						className="flex-1 bg-green-600 hover:bg-green-700"
					>
						<CheckCircle className="w-4 h-4 mr-2" />
						Approve
					</Button>
				</div>
				{
					proposal.netVotes >= 5 && (
						<div className="pt-2 border-t">
							<CreateChallengeDialog proposal={proposal}>
								<Button variant="outline" size="sm" className="w-full">
									Create Challenge Immediately
								</Button>
							</CreateChallengeDialog>
						</div>
					)
				}
			</CardContent>
		</Card>
	);
}