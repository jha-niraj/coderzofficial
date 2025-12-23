"use client"

import { useEffect, useState } from 'react';
import { getAdminMockSessions, getAdminMockStats } from '@/actions/(admin)/admin/adminmock.action';
import EmptyState from '../../_components/empty-state';
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

export default function GeneralMockAdminPage() {
    const [data, setData] = useState<any>({ sessions: [], stats: null });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [sessionsRes, statsRes] = await Promise.all([
                getAdminMockSessions(1, 10, 'GENERAL'),
                getAdminMockStats()
            ]);
            setData({
                sessions: (sessionsRes && sessionsRes.success && sessionsRes.data && Array.isArray(sessionsRes.data.sessions)) ? sessionsRes.data.sessions : [],
                stats: (statsRes && statsRes.success && statsRes.data) ? statsRes.data : null
            });
            setIsLoading(false);
        };
        fetchData();
    }, []);

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
                    <h1 className="text-3xl font-bold text-foreground">General Mock Sessions</h1>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total General Mocks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats?.totalGeneral ?? 0}</div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>General Mock Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    {
                        data.sessions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Start Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        data.sessions.map((session: any) => (
                                            <TableRow key={session.id}>
                                                <TableCell>{session.userName}</TableCell>
                                                <TableCell>{session.status}</TableCell>
                                                <TableCell>{new Date(session.startTime).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState icon={Award} title="No General Mock Sessions" description="No general mock sessions found." />
                        )
                    }
                </CardContent>
            </Card>
        </div>
    );
} 