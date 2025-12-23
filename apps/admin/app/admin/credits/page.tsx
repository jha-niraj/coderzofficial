'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, Users, DollarSign, TrendingUp, Mail,
    Send, Eye, Download, RefreshCw, Plus, Filter,
    Search, Coins, Gift, Award, Target, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getCreditTransactions, sendLowCreditEmail, distributeCredits, type CreditTransaction } from '@/actions/(admin)/admin/creditadmin.action';
import EmptyState from '../_components/empty-state';
import { toast } from 'sonner';

function CreditsAdminPage() {
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const res = await getCreditTransactions(currentPage, 30, searchTerm, typeFilter);
            if (res && res.success && res.data) {
                setTransactions(res.data.transactions);
                setTotalPages(res.data.totalPages);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [currentPage, searchTerm, typeFilter]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
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
                <h1 className="text-3xl font-bold text-foreground">Credit Transactions</h1>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="PURCHASE">Purchase</SelectItem>
                            <SelectItem value="SPEND">Spend</SelectItem>
                            <SelectItem value="BONUS">Bonus</SelectItem>
                            <SelectItem value="REWARD">Reward</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Credit Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {
                        transactions.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {
                                            transactions.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell>{transaction.userName}</TableCell>
                                                    <TableCell>{transaction.type}</TableCell>
                                                    <TableCell>{transaction.amount}</TableCell>
                                                    <TableCell>{transaction.description}</TableCell>
                                                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        {
                                                            typeof transaction.amount === 'number' && !isNaN(transaction.amount) && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={async () => {
                                                                        const res = await sendLowCreditEmail({
                                                                            email: transaction.email,
                                                                            userName: transaction.userName,
                                                                            userId: transaction.userId
                                                                        });
                                                                        if (res.success) {
                                                                            toast.success('Low credit email sent!');
                                                                        } else {
                                                                            toast.error('Failed to send email.');
                                                                        }
                                                                    }}
                                                                >
                                                                    Send Low Credit Email
                                                                </Button>
                                                            )
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        }
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
                                        {
                                            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </Button>
                                            ))
                                        }
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
                            <EmptyState icon={CreditCard} title="No Transactions" description="No credit transactions found." />
                        )
                    }
                </CardContent>
            </Card>
        </div>
    );
} 

export default function CreditAdmin() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreditsAdminPage />
        </Suspense>
    )
}