import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Send,
	TrendingUp,
	Users,
	CheckCircle,
	Calendar,
	Clock,
	ExternalLink,
	Banknote
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function AdminTransfersPage() {
	const session = await auth();

	// Check if user is admin
	if (!session?.user?.email) {
		redirect('/api/auth/signin');
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email }
	});

	if (!user || user.role !== 'Admin') {
		redirect('/');
	}

	// Fetch transfer statistics
	const transfers = await prisma.creditTransferOut.findMany({
		include: {
			user: {
				select: { name: true, email: true }
			}
		},
		orderBy: { createdAt: 'desc' },
		take: 100
	});

	const stats = await prisma.creditTransferOut.aggregate({
		_sum: { creditsTransferred: true },
		_count: true
	});

	// Calculate additional statistics
	const totalCreditsTransferred = stats._sum.creditsTransferred || 0;
	const totalTransfers = stats._count;
	const successRate = totalTransfers > 0 ? 100 : 0; // All transfers are completed in current implementation

	// Get unique users who have made transfers
	const uniqueUsers = new Set(transfers.map(t => t.userId)).size;

	// Get transfers from last 7 days
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const recentTransfers = await prisma.creditTransferOut.count({
		where: {
			createdAt: {
				gte: sevenDaysAgo
			}
		}
	});

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a")
		} catch (error) {
			return "Invalid date"
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
			case "PENDING":
				return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
			case "FAILED":
				return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400"
			default:
				return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400"
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
								<Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
									Credit Transfer Dashboard
								</h1>
								<p className="text-slate-600 dark:text-slate-400">
									Monitor and track credit transfers to external platforms
								</p>
							</div>
						</div>
						<Button asChild variant="outline">
							<Link href="/">Back to Home</Link>
						</Button>
					</div>
				</div>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card className="shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Total Transfers
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-blue-600" />
								<span className="text-2xl font-bold text-slate-900 dark:text-white">
									{totalTransfers}
								</span>
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Credits Transferred
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-2">
								<Banknote className="h-4 w-4 text-green-600" />
								<span className="text-2xl font-bold text-slate-900 dark:text-white">
									{totalCreditsTransferred.toLocaleString()}
								</span>
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Unique Users
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 text-purple-600" />
								<span className="text-2xl font-bold text-slate-900 dark:text-white">
									{uniqueUsers}
								</span>
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
								Last 7 Days
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-orange-600" />
								<span className="text-2xl font-bold text-slate-900 dark:text-white">
									{recentTransfers}
								</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Transfers Table */}
				<Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Send className="h-5 w-5 text-blue-600" />
							Recent Transfers
							<Badge variant="secondary" className="ml-auto">
								{transfers.length}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{transfers.length === 0 ? (
							<div className="text-center py-8">
								<Send className="h-12 w-12 text-slate-400 mx-auto mb-4" />
								<p className="text-slate-600 dark:text-slate-400">
									No transfers found yet.
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-slate-50 dark:bg-slate-700/50">
										<tr>
											<th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
												Date & Time
											</th>
											<th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
												User
											</th>
											<th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
												Credits
											</th>
											<th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
												Platform
											</th>
											<th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
												Status
											</th>
											<th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
												Transfer ID
											</th>
											<th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
												IP Address
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200 dark:divide-slate-600">
										{transfers.map((transfer) => (
											<tr key={transfer.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
												<td className="px-4 py-3">
													<div className="flex items-center gap-2">
														<Calendar className="h-3 w-3 text-slate-500" />
														<span className="text-sm text-slate-900 dark:text-white">
															{formatDate(transfer.createdAt.toISOString())}
														</span>
													</div>
												</td>
												<td className="px-4 py-3">
													<div>
														<div className="font-medium text-slate-900 dark:text-white">
															{transfer.user.name || 'N/A'}
														</div>
														<div className="text-sm text-slate-500">
															{transfer.user.email}
														</div>
													</div>
												</td>
												<td className="px-4 py-3">
													<span className="font-semibold text-red-600">
														-{transfer.creditsTransferred}
													</span>
												</td>
												<td className="px-4 py-3">
													<div className="flex items-center gap-2">
														<ExternalLink className="h-3 w-3 text-slate-500" />
														<span className="text-sm text-slate-900 dark:text-white capitalize">
															{transfer.destinationPlatform}
														</span>
													</div>
												</td>
												<td className="px-4 py-3">
													<Badge className={getStatusColor(transfer.status)}>
														{transfer.status}
													</Badge>
												</td>
												<td className="px-4 py-3">
													<div className="flex items-center gap-2">
														<Clock className="h-3 w-3 text-slate-500" />
														<span className="text-sm font-mono text-slate-600 dark:text-slate-400">
															{transfer.transferId.slice(0, 8)}...
														</span>
													</div>
												</td>
												<td className="px-4 py-3">
													<span className="text-sm text-slate-600 dark:text-slate-400">
														{transfer.ipAddress || 'N/A'}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 