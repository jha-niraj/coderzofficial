'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Briefcase, Users, Clock, TrendingUp, Calendar,
    Eye, Download, RefreshCw, BarChart3, Star,
    MessageSquare, Award, Filter, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAdminJobInterviewSessions, getAdminJobInterviewStats } from '@/actions/(admin)/admin/adminai.action';
import EmptyState from '../../_components/empty-state';

interface Position {
    position: string;
    count: number;
    avgScore: number;
}

interface JobInterviewStats {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    completionRate: number;
    popularPositions: Position[];
}

interface JobInterviewSession {
    id: string;
    userName: string;
    position: string;
    companyUrl: string;
    status: string;
    technicalCount: number;
    behavioralCount: number;
    codingCount: number;
    createdAt: string;
}

export default function JobInterviewAdminPage() {
    const [data, setData] = useState<{
        sessions: JobInterviewSession[];
        stats: JobInterviewStats | null;
    }>({
        sessions: [],
        stats: null
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filteredSessions, setFilteredSessions] = useState<JobInterviewSession[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [sessionsRes, statsRes] = await Promise.all([
                getAdminJobInterviewSessions(currentPage, 30, searchTerm),
                getAdminJobInterviewStats()
            ]);

            if (sessionsRes && sessionsRes.success && sessionsRes.data) {
                setData(prev => ({
                    ...prev,
                    sessions: sessionsRes.data.sessions
                }));
                setTotalPages(sessionsRes.data.totalPages);
            }

            if (statsRes && statsRes.success && statsRes.data) {
                setData(prev => ({
                    ...prev,
                    stats: {
                        totalSessions: statsRes.data.totalSessions,
                        completedSessions: statsRes.data.completedSessions,
                        averageScore: statsRes.data.averageScore,
                        completionRate: statsRes.data.completionRate ?? 0,
                        popularPositions: statsRes.data.popularPositions ?? []
                    }
                }));
            }
            setIsLoading(false);
        };
        fetchData();
    }, [currentPage, searchTerm]);

    useEffect(() => {
        if (statusFilter === 'ALL') {
            setFilteredSessions(data.sessions);
        } else {
            setFilteredSessions(data.sessions.filter(session => session.status === statusFilter));
        }
    }, [statusFilter, data.sessions]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
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
                    <h1 className="text-3xl font-bold text-foreground">Job Interview Assistant</h1>
                    <p className="text-muted-foreground">
                        Monitor and analyze job interview practice sessions across the platform.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </Button>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {
                    [
                        { title: "Total Sessions", value: data.stats?.totalSessions ?? 0 },
                        { title: "Completed Sessions", value: data.stats?.completedSessions ?? 0 },
                        { title: "Average Score", value: data.stats?.averageScore ?? '-' },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="rounded-xl bg-white dark:bg-slate-900 p-5 shadow-md hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between pb-2">
                                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {item.title}
                                </h4>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                {item.value}
                            </div>
                        </div>
                    ))
                }
            </div>
            <Tabs defaultValue="sessions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="positions">Popular Positions</TabsTrigger>
                </TabsList>
                <TabsContent value="sessions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters & Search
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by user, position, or company..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Status</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Sessions</CardTitle>
                            <CardDescription>
                                {filteredSessions.length} sessions found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {
                                filteredSessions.length > 0 ? (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Position</TableHead>
                                                    <TableHead>Company</TableHead>
                                                    <TableHead>Questions</TableHead>
                                                    <TableHead>Date</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredSessions.map((session) => (
                                                    <TableRow key={session.id}>
                                                        <TableCell>{session.userName}</TableCell>
                                                        <TableCell>{session.position}</TableCell>
                                                        <TableCell>{session.companyUrl}</TableCell>
                                                        <TableCell>T:{session.technicalCount} B:{session.behavioralCount} C:{session.codingCount}</TableCell>
                                                        <TableCell>{new Date(session.createdAt).toLocaleDateString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="flex items-center justify-center space-x-2 py-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <EmptyState icon={Briefcase} title="No Interview Sessions" description="No job interview sessions found." />
                                )
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Session Analytics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600">
                                            {data.stats?.completionRate ?? '-'}%
                                        </div>
                                        <p className="text-sm text-muted-foreground">Average Completion Rate</p>
                                    </div>
                                    <div className="bg-muted/50 h-32 rounded-lg flex items-center justify-center">
                                        <p className="text-muted-foreground">Chart Component Placeholder</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Performance Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600">
                                            {data.stats?.averageScore ?? '-'}%
                                        </div>
                                        <p className="text-sm text-muted-foreground">Average Score</p>
                                    </div>
                                    <div className="bg-muted/50 h-32 rounded-lg flex items-center justify-center">
                                        <p className="text-muted-foreground">Trend Chart Placeholder</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="positions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Popular Job Positions</CardTitle>
                            <CardDescription>
                                Most practiced positions and their performance metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {
                                data.stats?.popularPositions && data.stats.popularPositions.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Position</TableHead>
                                                <TableHead>Sessions</TableHead>
                                                <TableHead>Avg Score</TableHead>
                                                <TableHead>Trend</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {
                                                data.stats.popularPositions.map((position: Position, index: number) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{position.position}</TableCell>
                                                        <TableCell>{position.count}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 text-yellow-500" />
                                                                {position.avgScore}%
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className="bg-green-100 text-green-800">
                                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                                Popular
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
                                        title="No Popular Positions"
                                        description="No job position data available yet."
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