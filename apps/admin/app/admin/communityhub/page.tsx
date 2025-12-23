import { Suspense } from "react";
import {
	Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
	TrendingUp, Users, Trophy, Settings, Vote, CheckCircle
} from "lucide-react";
import { getTopProposals, getChallenges } from "@/actions/(main)/collective/admin.actions";
import { ProposalManagementCard } from "./_components/proposal-management-card";
import { ChallengeManagementCard } from "./_components/challenge-management-card";
import { CreateChallengeDialog } from "./_components/create-challenge-dialog";

export default function CommunityHubAdminPage() {
	return (
		<div className="container mx-auto px-4 py-8 space-y-8">
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-bold">Collective Admin</h1>
					<p className="text-muted-foreground mt-2">
						Manage community proposals and challenges
					</p>
				</div>
				<CreateChallengeDialog />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
						<Vote className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<Suspense fallback={<div className="text-2xl font-bold">-</div>}>
							<PendingProposalsCount />
						</Suspense>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
						<Trophy className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<Suspense fallback={<div className="text-2xl font-bold">-</div>}>
							<ActiveChallengesCount />
						</Suspense>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Participants</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<Suspense fallback={<div className="text-2xl font-bold">-</div>}>
							<TotalParticipantsCount />
						</Suspense>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">78%</div>
						<p className="text-xs text-muted-foreground">
							Proposals approved
						</p>
					</CardContent>
				</Card>
			</div>
			<Tabs defaultValue="proposals" className="space-y-6">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="proposals" className="flex items-center gap-2">
						<Vote className="w-4 h-4" />
						Proposal Review
					</TabsTrigger>
					<TabsTrigger value="challenges" className="flex items-center gap-2">
						<Settings className="w-4 h-4" />
						Challenge Management
					</TabsTrigger>
				</TabsList>
				<TabsContent value="proposals">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<div>
								<h2 className="text-2xl font-semibold">Proposal Review</h2>
								<p className="text-muted-foreground">
									Review and approve community proposals for challenges
								</p>
							</div>
							<Badge variant="secondary" className="bg-blue-100 text-blue-800">
								<Vote className="w-3 h-3 mr-1" />
								Awaiting Review
							</Badge>
						</div>
						<Suspense fallback={<ProposalsSkeleton />}>
							<ProposalsList />
						</Suspense>
					</div>
				</TabsContent>
				<TabsContent value="challenges">
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<div>
								<h2 className="text-2xl font-semibold">Challenge Management</h2>
								<p className="text-muted-foreground">
									Manage active challenges and create new ones
								</p>
							</div>
							<Badge variant="secondary" className="bg-green-100 text-green-800">
								<Trophy className="w-3 h-3 mr-1" />
								Active Management
							</Badge>
						</div>
						<Suspense fallback={<ChallengesSkeleton />}>
							<ChallengesList />
						</Suspense>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

async function PendingProposalsCount() {
	const proposals = await getTopProposals();
	return (
		<>
			<div className="text-2xl font-bold">{proposals.length}</div>
			<p className="text-xs text-muted-foreground">
				Need review
			</p>
		</>
	);
}

async function ActiveChallengesCount() {
	const challenges = await getChallenges();
	const activeChallenges = challenges.filter(c => c.status === "ACTIVE");
	return (
		<>
			<div className="text-2xl font-bold">{activeChallenges.length}</div>
			<p className="text-xs text-muted-foreground">
				Currently running
			</p>
		</>
	);
}

async function TotalParticipantsCount() {
	const challenges = await getChallenges();
	const totalParticipants = challenges.reduce((sum, challenge) =>
		sum + challenge._count.participations, 0
	);
	return (
		<>
			<div className="text-2xl font-bold">{totalParticipants}</div>
			<p className="text-xs text-muted-foreground">
				Across all challenges
			</p>
		</>
	);
}

async function ProposalsList() {
	const proposals = await getTopProposals();

	if (proposals.length === 0) {
		return (
			<Card className="p-8 text-center">
				<CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
				<h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
				<p className="text-muted-foreground">
					No proposals awaiting review at the moment.
				</p>
			</Card>
		);
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{
				proposals.map((proposal) => (
					<ProposalManagementCard key={proposal.id} proposal={proposal} />
				))
			}
		</div>
	);
}

async function ChallengesList() {
	const challenges = await getChallenges();

	if (challenges.length === 0) {
		return (
			<Card className="p-8 text-center">
				<Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
				<h3 className="text-lg font-semibold mb-2">No Challenges Yet</h3>
				<p className="text-muted-foreground mb-4">
					Create your first challenge from approved proposals.
				</p>
				<CreateChallengeDialog />
			</Card>
		);
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{
				challenges.map((challenge) => (
					<ChallengeManagementCard key={challenge.id} challenge={challenge} />
				))
			}
		</div>
	);
}

function ProposalsSkeleton() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{
				Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} className="animate-pulse">
						<CardHeader>
							<div className="h-4 bg-gray-200 rounded w-3/4"></div>
							<div className="h-3 bg-gray-200 rounded w-1/2"></div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="h-3 bg-gray-200 rounded"></div>
								<div className="h-3 bg-gray-200 rounded w-5/6"></div>
								<div className="flex gap-2 mt-4">
									<div className="h-8 bg-gray-200 rounded w-20"></div>
									<div className="h-8 bg-gray-200 rounded w-20"></div>
								</div>
							</div>
						</CardContent>
					</Card>
				))
			}
		</div>
	);
}

function ChallengesSkeleton() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{
				Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} className="animate-pulse">
						<CardHeader>
							<div className="h-4 bg-gray-200 rounded w-3/4"></div>
							<div className="h-3 bg-gray-200 rounded w-1/2"></div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="h-3 bg-gray-200 rounded"></div>
								<div className="h-3 bg-gray-200 rounded w-5/6"></div>
								<div className="flex gap-2 mt-4">
									<div className="h-8 bg-gray-200 rounded w-24"></div>
									<div className="h-8 bg-gray-200 rounded w-24"></div>
								</div>
							</div>
						</CardContent>
					</Card>
				))
			}
		</div>
	);
}