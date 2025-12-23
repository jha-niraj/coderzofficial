"use client";

import { useState, useEffect } from 'react';
import {
    Users, BarChart3, DollarSign, TrendingUp, BugPlay, Briefcase, UserPlus, CreditCard
} from 'lucide-react';
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@repo/ui/components/ui/card';
import { Badge } from '@repo/ui/components/ui/badge';
import { Button } from '@repo/ui/components/ui/button';
import { 
    Tabs, TabsContent, TabsList, TabsTrigger 
} from '@repo/ui/components/ui/tabs';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@repo/ui/components/ui/table';
import { 
    Avatar, AvatarFallback 
} from '@repo/ui/components/ui/avatar';
import { 
    getPlatformStats, getAllUsers, getCreditTransactions, getJobInterviewSessions, 
    type PlatformStats 
} from '@/actions/admin.action';
import EmptyState from './_components/empty-state';

export default function AdminDashboard() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [recentChallenges, setRecentChallenges] = useState<any[]>([]);
    const [recentSessions, setRecentSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [
                    platformStatsResponse,
                    usersResponse,
                    transactionsResponse,
                    sessionsResponse
                ] = await Promise.all([
                    getPlatformStats(),
                    getAllUsers(1, 5),
                    getCreditTransactions(1, 5),
                    getJobInterviewSessions(1, 5)
                ]);

                setStats((platformStatsResponse && platformStatsResponse.success && platformStatsResponse.data) ? platformStatsResponse.data : null);
                setRecentUsers((usersResponse && usersResponse.success && usersResponse.data && Array.isArray(usersResponse.data.users)) ? usersResponse.data.users : []);
                setRecentTransactions((transactionsResponse && transactionsResponse.success && transactionsResponse.data && Array.isArray(transactionsResponse.data.transactions)) ? transactionsResponse.data.transactions : []);
                setRecentSessions((sessionsResponse && sessionsResponse.success && sessionsResponse.data && Array.isArray(sessionsResponse.data.sessions)) ? sessionsResponse.data.sessions : []);
            } catch (error) {
                setStats(null);
                setRecentUsers([]);
                setRecentTransactions([]);
                setRecentChallenges([]);
                setRecentSessions([]);
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'PURCHASE':
                return 'bg-green-100 text-green-800';
            case 'BONUS':
                return 'bg-blue-100 text-blue-800';
            case 'SPEND':
                return 'bg-orange-100 text-orange-800';
            case 'REWARD':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here&apos;s what&apos;s happening on your platform today.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Refresh Data
                    </Button>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <Badge className="bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +{stats?.userGrowth || 0}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || 0}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <Badge className="bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +{stats?.revenueGrowth || 0}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bug Hunt Challenges</CardTitle>
                        <BugPlay className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interview Sessions</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalInterviewSessions || 0}</div>
                        <p className="text-xs text-muted-foreground">Total sessions completed</p>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">Recent Users</TabsTrigger>
                    <TabsTrigger value="transactions">Credit Transactions</TabsTrigger>
                    <TabsTrigger value="challenges">Bug Hunt Challenges</TabsTrigger>
                    <TabsTrigger value="interviews">Interview Sessions</TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Recent Users
                            </CardTitle>
                            <CardDescription>
                                Latest user registrations on the platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {
                                recentUsers.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Credits</TableHead>
                                                <TableHead>Level</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead>Challenges</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {
                                                recentUsers.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
                                                                        {user.name?.slice(0, 2)?.toUpperCase() || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-medium">{user.name || 'Unknown'}</div>
                                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{user.role}</Badge>
                                                        </TableCell>
                                                        <TableCell>{user.credits}</TableCell>
                                                        <TableCell>{user.level}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {new Date(user.joinedAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {user.completedChallenges}/{user.totalChallenges}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <EmptyState
                                        icon={Users}
                                        title="No Users Yet"
                                        description="No users have registered on the platform yet. User registrations will appear here."
                                    />
                                )
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="transactions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Recent Credit Transactions
                            </CardTitle>
                            <CardDescription>
                                Latest credit transactions and user activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {
                                recentTransactions.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {
                                                recentTransactions.map((transaction) => (
                                                    <TableRow key={transaction.id}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{transaction.userName}</div>
                                                                <div className="text-sm text-muted-foreground">{transaction.email}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getTypeColor(transaction.type)}>
                                                                {transaction.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                                                }`}>
                                                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-xs truncate">
                                                            {transaction.description}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {new Date(transaction.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <EmptyState
                                        icon={CreditCard}
                                        title="No Transactions Yet"
                                        description="No credit transactions have been made yet. User transactions will appear here."
                                    />
                                )
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="challenges" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BugPlay className="h-5 w-5" />
                                Recent Bug Hunt Challenges
                            </CardTitle>
                            <CardDescription>
                                Latest challenges created by users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {
                                recentChallenges.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Creator</TableHead>
                                                <TableHead>Difficulty</TableHead>
                                                <TableHead>Language</TableHead>
                                                <TableHead>Attempts</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {
                                                recentChallenges.map((challenge) => (
                                                    <TableRow key={challenge.id}>
                                                        <TableCell className="font-medium">
                                                            {challenge.title}
                                                        </TableCell>
                                                        <TableCell>{challenge.creator}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{challenge.difficulty}</Badge>
                                                        </TableCell>
                                                        <TableCell>{challenge.language}</TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {challenge.successfulSolves}/{challenge.totalAttempts}
                                    </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={challenge.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                                {challenge.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <EmptyState
                                        icon={BugPlay}
                                        title="No Challenges Yet"
                                        description="No bug hunt challenges have been created yet. User challenges will appear here."
                                    />
                                )
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="interviews" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Recent Interview Sessions
                            </CardTitle>
                            <CardDescription>
                                Latest job interview practice sessions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {
                                recentSessions.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Position</TableHead>
                                                <TableHead>Company</TableHead>
                                                <TableHead>Questions</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {
                                                recentSessions.map((session) => (
                                                    <TableRow key={session.id}>
                                                        <TableCell className="font-medium">
                                                            {session.userName}
                                                        </TableCell>
                                                        <TableCell>{session.position}</TableCell>
                                                        <TableCell>
                                                            <div className="max-w-xs truncate">
                                                                {session.companyUrl}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                T:{session.technicalCount} B:{session.behavioralCount} C:{session.codingCount}
                    </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {new Date(session.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getStatusColor(session.status)}>
                                                                {session.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <EmptyState
                                        icon={Briefcase}
                                        title="No Interview Sessions Yet"
                                        description="No interview sessions have been created yet. User sessions will appear here."
                                    />
                                )
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}