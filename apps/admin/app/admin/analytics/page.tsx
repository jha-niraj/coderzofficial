'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Users, Activity, DollarSign, Eye, Download, RefreshCw,
    Target, Globe
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
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select';
import {
    getPlatformStats, getUserEngagementStats
} from '@/actions/admin.action';

const allowedRanges = ['7d', '30d', '90d', '1y'] as const;
type TimeRange = typeof allowedRanges[number];

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [engagement, setEngagement] = useState<any>(null);

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            const [statsRes, engagementRes] = await Promise.all([
                getPlatformStats(timeRange),
                getUserEngagementStats(timeRange)
            ]);
            setStats(statsRes && statsRes.success ? statsRes.data : null);
            setEngagement(engagementRes && engagementRes.success ? engagementRes.data : null);
            setIsLoading(false);
        };
        fetchData();
    }, [timeRange]);

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
                    <h1 className="text-3xl font-bold text-foreground">Platform Analytics</h1>
                    <p className="text-muted-foreground">
                        Comprehensive insights into platform performance and user behavior.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Select value={timeRange} onValueChange={v => setTimeRange(v as TimeRange)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
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
                        <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() ?? 0}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <Badge className="bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +{stats?.userGrowth ?? 0}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeUsers?.toLocaleString() ?? 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total users
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() ?? 0}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <Badge className="bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +{stats?.revenueGrowth ?? 0}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalChallenges ?? 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Bug Hunt + Interview
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="engagement">User Engagement</TabsTrigger>
                    <TabsTrigger value="platform">Platform Usage</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
                    <TabsTrigger value="technical">Technical Metrics</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Daily Active Users
                                </CardTitle>
                                <CardDescription>User activity over the selected period</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-2xl font-bold">{engagement?.totalActiveUsers ?? 0}</div>
                                    <div className="text-sm text-muted-foreground">Avg Sessions/User: {engagement?.avgSessionsPerUser ?? 0}</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Device Breakdown
                                </CardTitle>
                                <CardDescription>How users access the platform</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[]}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="engagement" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    User Engagement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{engagement?.totalActiveUsers ?? 0}</div>
                                <div className="text-sm text-muted-foreground">Avg Sessions/User: {engagement?.avgSessionsPerUser ?? 0}</div>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Pages</CardTitle>
                            <CardDescription>Most visited pages and their performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[]}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="platform" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Bug Hunt</CardTitle>
                                <CardDescription>Challenge platform metrics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Total Challenges</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Active Now</span>
                                    <Badge className="bg-green-100 text-green-800">
                                        0
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Participants</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Completion Rate</span>
                                    <span className="font-semibold">0%</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Job Interview</CardTitle>
                                <CardDescription>Interview practice metrics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Total Sessions</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Active Now</span>
                                    <Badge className="bg-blue-100 text-blue-800">
                                        0
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Avg Duration</span>
                                    <span className="font-semibold">0m</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Success Rate</span>
                                    <span className="font-semibold">0%</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Mock Interviews</CardTitle>
                                <CardDescription>Mock interview analytics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Total Sessions</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Company-wise</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Peer-to-Peer</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Average Rating</span>
                                    <span className="font-semibold">0/5</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="revenue" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Revenue Breakdown
                                </CardTitle>
                                <CardDescription>Revenue by source</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[]}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Growth Metrics
                                </CardTitle>
                                <CardDescription>Platform growth indicators</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">User Growth</span>
                                        <Badge className="bg-green-100 text-green-800">
                                            +0%
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Revenue Growth</span>
                                        <Badge className="bg-green-100 text-green-800">
                                            +0%
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Monthly ARR</span>
                                        <span className="font-semibold">
                                            $0K
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Customer LTV</span>
                                        <span className="font-semibold">
                                            $0
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="technical" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Server Uptime</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">0%</div>
                                <p className="text-xs text-muted-foreground">Last 30 days</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">API Response Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">0ms</div>
                                <p className="text-xs text-muted-foreground">Average response</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Error Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">0%</div>
                                <p className="text-xs text-muted-foreground">API error rate</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Page Load Speed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">0s</div>
                                <p className="text-xs text-muted-foreground">Average load time</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 