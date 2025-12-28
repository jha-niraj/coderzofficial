import { notFound } from "next/navigation";
import { 
    Card, CardContent, CardHeader, CardTitle 
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { 
	Avatar, AvatarFallback, AvatarImage 
} from "@repo/ui/components/ui/avatar";
import { Separator } from "@repo/ui/components/ui/separator";
import { 
	Clock, ExternalLink, Calendar, Users, TrendingUp, ArrowLeft 
} from "lucide-react";
import { getProposalByTitle } from "@/actions/(main)/collective/proposal.actions";
import { VotingSection } from "../../_components/voting-section";
import { CommentsSection } from "../../_components/comments-section";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

interface VotingPageProps {
	params: Promise<{
		slug: string;
	}>;
}

export default async function VotingPage({ params }: VotingPageProps) {
	const { slug } = await params;
	// Convert slug back to title for search
	const title = slug.replace(/-/g, " ");
	const proposal = await getProposalByTitle(title);

	if (!proposal) {
		notFound();
	}

	const isVotingActive = new Date() < new Date(proposal.votingEndAt);
	const timeLeft = formatDistanceToNow(new Date(proposal.votingEndAt), { addSuffix: true });

	return (
		<div className="min-h-screen bg-gradient-to-br from-neutral-50 via-purple-50 to-blue-50 dark:from-neutral-950 dark:via-purple-950/30 dark:to-blue-950/30">
			<div className="max-w-6xl mx-auto px-4 py-8">
				<div className="mb-8">
					<div className="flex items-center gap-2 text-sm mb-6">
						<Link href="/communityhub" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
							<ArrowLeft className="w-4 h-4" />
							Back to Collective
						</Link>
					</div>
					<div className="flex items-start justify-between mb-4">
						<div className="flex items-center gap-3">
							<Avatar className="w-12 h-12">
								<AvatarImage src={proposal.proposer.image || ""} />
								<AvatarFallback>
									{proposal.proposer.name?.charAt(0) || "U"}
								</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="font-semibold">{proposal.proposer.name}</h3>
								<p className="text-sm text-muted-foreground">
									Proposed {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{
								isVotingActive ? (
									<Badge className="bg-green-100 text-green-800">
										<Clock className="w-3 h-3 mr-1" />
										Voting Active
									</Badge>
								) : (
									<Badge variant="outline">
										Voting Ended
									</Badge>
								)
							}
						</div>
					</div>
					<h1 className="text-3xl font-bold mb-4">{proposal.title}</h1>
					<div className="flex flex-wrap gap-2 mb-6">
						{
							proposal.tags.map((tag) => (
								<Badge key={tag} variant="secondary">
									{tag}
								</Badge>
							))
						}
					</div>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Proposal Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="prose prose-sm max-w-none">
									<p className="whitespace-pre-wrap">{proposal.description}</p>
								</div>
								<div className="grid grid-cols-2 gap-4 pt-4 border-t">
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="w-4 h-4 text-muted-foreground" />
										<span>{proposal.estimatedDays} days estimated</span>
									</div>
									{
										proposal.playlistUrl && (
											<div className="flex items-center gap-2 text-sm">
												<ExternalLink className="w-4 h-4 text-muted-foreground" />
												<Link
													href={proposal.playlistUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:underline"
												>
													View Resource
												</Link>
											</div>
										)
									}
								</div>
							</CardContent>
						</Card>
						<VotingSection proposal={proposal} />
						<CommentsSection proposal={proposal} />
					</div>
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<TrendingUp className="w-5 h-5" />
									Voting Status
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Upvotes</span>
										<span className="font-semibold text-green-600">{proposal.upvotes}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Downvotes</span>
										<span className="font-semibold text-red-600">{proposal.downvotes}</span>
									</div>
									<Separator />
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium">Net Score</span>
										<span className={`font-bold text-lg ${proposal.netVotes >= 0 ? "text-green-600" : "text-red-600"}`}>
											{proposal.netVotes > 0 ? "+" : ""}{proposal.netVotes}
										</span>
									</div>
								</div>
								<div className="space-y-2 pt-4 border-t">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Started</span>
										<span>{format(new Date(proposal.votingStartAt), "MMM d, HH:mm")}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Ends</span>
										<span>{format(new Date(proposal.votingEndAt), "MMM d, HH:mm")}</span>
									</div>
									{
										isVotingActive && (
											<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
												<p className="text-sm text-blue-800 font-medium">
													<Clock className="w-4 h-4 inline mr-1" />
													Voting ends {timeLeft}
												</p>
											</div>
										)
									}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="w-5 h-5" />
									Engagement
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Total Votes</span>
									<span className="font-semibold">{proposal.votes.length}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Comments</span>
									<span className="font-semibold">{proposal.comments.length}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Engagement Rate</span>
									<span className="font-semibold">
										{proposal.votes.length > 0
											? Math.round((proposal.comments.length / proposal.votes.length) * 100)
											: 0}%
									</span>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>What&apos;s Next?</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3 text-sm">
									{
										isVotingActive ? (
											<>
												<p>🗳️ Voting is currently active</p>
												<p>💬 Share your thoughts in comments</p>
												<p>📈 Help spread the word</p>
											</>
										) : (
											<>
												<p>⏰ Voting period has ended</p>
												<p>👥 Awaiting admin review</p>
												<p>🏆 Top proposals become challenges</p>
											</>
										)
									}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}