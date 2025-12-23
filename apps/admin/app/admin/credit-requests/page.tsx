"use client";

import { useState, useEffect, Suspense } from "react";
import { 
    Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Gift, ExternalLink, Clock, Calendar, Eye, User, Search, Filter, ChevronLeft, 
    ChevronRight, Loader2, Mail, CreditCard, MessageSquare, Award, AlertCircle, 
    TrendingUp, Users, CheckCircle, XCircle, Timer, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getAllCreditRequests, processCreditRequest } from "@/actions/(main)/user/dashboard.action";

interface CreditRequest {
    id: string;
    userId: string;
    requestedCredits: number;
    linkedinPostUrl: string;
    userPostContent?: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminNotes?: string | null;
    createdAt: string;
    processedAt?: string | null;
    processedBy?: string | null;
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
    processedByUser?: {
        name: string | null;
        email: string;
    } | null;
}

interface CreditRequestsData {
    requests: CreditRequest[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
    };
    stats: {
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    };
}

function CreditRequestsPage() {
    const [requestsData, setRequestsData] = useState<CreditRequestsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");
    const [processing, setProcessing] = useState(false);
    const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);

    // Filters and pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const result = await getAllCreditRequests(
                currentPage,
                20,
                searchTerm.trim() || undefined,
                statusFilter
            );

            if (result.success && result.data) {
                setRequestsData(result.data as unknown as CreditRequestsData);
            } else {
                toast.error(result.error || "Failed to fetch credit requests");
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Failed to fetch credit requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [currentPage, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = () => {
        setCurrentPage(1);
        fetchRequests();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleProcessRequest = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
        if (!selectedRequest) return;

        // For rejection, require admin notes
        if (action === 'REJECT' && !adminNotes.trim()) {
            toast.error("Please provide a reason for rejecting this request");
            return;
        }

        try {
            setProcessing(true);

            const result = await processCreditRequest(requestId, action, adminNotes.trim() || undefined);

            if (result.success) {
                toast.success(`Request ${action.toLowerCase()}ed successfully${action === 'APPROVE' ? ' and email sent to user' : ''}!`);
                await fetchRequests();
                setIsSheetOpen(false);
                setSelectedRequest(null);
                setAdminNotes("");
                setActionType(null);
            } else {
                toast.error("Failed to process request");
            }
        } catch (error) {
            console.error("Error processing request:", error);
            toast.error("Failed to process request");
        } finally {
            setProcessing(false);
        }
    };

    const openRequestDetails = (request: CreditRequest) => {
        setSelectedRequest(request);
        setAdminNotes(request.adminNotes || "");
        setActionType(null);
        setIsSheetOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800';
            case 'APPROVED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800';
            case 'REJECTED':
                return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Timer className="h-3 w-3" />;
            case 'APPROVED':
                return <CheckCircle className="h-3 w-3" />;
            case 'REJECTED':
                return <XCircle className="h-3 w-3" />;
            default:
                return <Clock className="h-3 w-3" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && !requestsData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-black dark:via-gray-900/30 dark:to-black">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm"></div>
                        <div className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Loading Credit Requests</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Please wait while we fetch the data...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b dark:from-black dark:via-emerald-900 dark:to-black">
            <div className="space-y-8 p-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg blur-sm"></div>
                                <div className="relative p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                                    <Gift className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                                    Credit Requests Management
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Review and process user credit requests from LinkedIn sharing
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Live Updates</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-800">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                >
                    <Card className="p-3 relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
                        <CardHeader className="pb-3 relative">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Total Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                {requestsData?.stats.total || 0}
                            </div>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                All time
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-3 relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-300"></div>
                        <CardHeader className="pb-3 relative">
                            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                <Timer className="h-4 w-4" />
                                Pending Review
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                {requestsData?.stats.pending || 0}
                            </div>
                            <div className="flex items-center mt-2 text-xs text-amber-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Needs attention
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-3 relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-300"></div>
                        <CardHeader className="pb-3 relative">
                            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Approved
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                {requestsData?.stats.approved || 0}
                            </div>
                            <div className="flex items-center mt-2 text-xs text-emerald-500">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Credits awarded
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-3 relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 group-hover:from-red-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
                        <CardHeader className="pb-3 relative">
                            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                                <XCircle className="h-4 w-4" />
                                Rejected
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {requestsData?.stats.rejected || 0}
                            </div>
                            <div className="flex items-center mt-2 text-xs text-red-500">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Not approved
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Search & Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search Requests</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="search"
                                            placeholder="Search by user name, email, or LinkedIn URL..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            className="pl-10 h-11 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-lg shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="w-full lg:w-48">
                                    <Label htmlFor="status" className="text-sm font-medium mb-2 block">Filter by Status</Label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="h-11 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-lg shadow-sm">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Status</SelectItem>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="APPROVED">Approved</SelectItem>
                                            <SelectItem value="REJECTED">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={handleSearch}
                                        disabled={loading}
                                        className="h-11 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                        Search
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Gift className="h-5 w-5" />
                                    Credit Requests
                                </CardTitle>
                                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                                    Showing {Math.min(20, requestsData?.requests.length || 0)} of {requestsData?.pagination.totalCount || 0} requests
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {
                                requestsData?.requests.length === 0 ? (
                                    <div className="text-center py-16 px-6">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-gray-500/20 rounded-full blur-sm"></div>
                                            <div className="relative p-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full w-fit mx-auto">
                                                <Gift className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No credit requests found</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {
                                                searchTerm || statusFilter !== 'ALL'
                                                    ? 'Try adjusting your search criteria or filters'
                                                    : 'No users have submitted credit requests yet'
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-gray-200 dark:border-gray-800">
                                                        <TableHead className="font-semibold text-gray-900 dark:text-white">User</TableHead>
                                                        <TableHead className="font-semibold text-gray-900 dark:text-white">Credits</TableHead>
                                                        <TableHead className="font-semibold text-gray-900 dark:text-white">Status</TableHead>
                                                        <TableHead className="font-semibold text-gray-900 dark:text-white">Submitted</TableHead>
                                                        <TableHead className="font-semibold text-gray-900 dark:text-white text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {
                                                        requestsData?.requests.map((request, index) => (
                                                            <motion.tr
                                                                key={request.id}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className="border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                                            >
                                                                <TableCell>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="relative">
                                                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-sm"></div>
                                                                            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                                                                                {request.user.name?.charAt(0) || request.user.email.charAt(0).toUpperCase()}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                                {request.user.name || 'Unknown User'}
                                                                            </div>
                                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                                {request.user.email}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="p-1.5 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                                                                            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                        </div>
                                                                        <span className="font-semibold text-gray-900 dark:text-white">{request.requestedCredits}</span>
                                                                        <span className="text-xs text-gray-500">credits</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge className={`${getStatusColor(request.status)} border flex items-center gap-1.5 w-fit px-2.5 py-1 text-xs font-medium shadow-sm`}>
                                                                        {getStatusIcon(request.status)}
                                                                        {request.status.toLowerCase()}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {formatDate(request.createdAt)}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => openRequestDetails(request)}
                                                                        className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        Review
                                                                    </Button>
                                                                </TableCell>
                                                            </motion.tr>
                                                        ))
                                                    }
                                                </TableBody>
                                            </Table>
                                        </div>
                                        {
                                            requestsData && requestsData.pagination.totalPages > 1 && (
                                                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        Page {requestsData.pagination.currentPage} of {requestsData.pagination.totalPages}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(currentPage - 1)}
                                                            disabled={currentPage === 1 || loading}
                                                            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm"
                                                        >
                                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                                            Previous
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(currentPage + 1)}
                                                            disabled={currentPage === requestsData.pagination.totalPages || loading}
                                                            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm"
                                                        >
                                                            Next
                                                            <ChevronRight className="h-4 w-4 ml-1" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </>
                                )
                            }
                        </CardContent>
                    </Card>
                </motion.div>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetContent side="right" className="w-full sm:w-[700px] sm:max-w-[55vw] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800">
                        <SheetHeader className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg blur-sm"></div>
                                    <div className="relative p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                                        <Gift className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <SheetTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                        Credit Request Details
                                    </SheetTitle>
                                    <SheetDescription className="text-gray-600 dark:text-gray-400">
                                        Review the request details and take appropriate action
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>
                        {
                            selectedRequest && (
                                <div className="space-y-8 py-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            User Information
                                        </h3>
                                        <div className="p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-sm"></div>
                                                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                        {selectedRequest.user.name?.charAt(0) || selectedRequest.user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {selectedRequest.user.name || 'Unknown User'}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {selectedRequest.user.email}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-md font-medium">
                                                            User ID: {selectedRequest.user.id.slice(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <CreditCard className="h-5 w-5" />
                                            Request Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Credits Requested</span>
                                                </div>
                                                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                                    {selectedRequest.requestedCredits}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getStatusIcon(selectedRequest.status)}
                                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Current Status</span>
                                                </div>
                                                <Badge className={`${getStatusColor(selectedRequest.status)} text-sm px-3 py-1 font-semibold`}>
                                                    {selectedRequest.status.toLowerCase()}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Submission Date</span>
                                            </div>
                                            <div className="text-gray-900 dark:text-white font-medium">
                                                {formatDate(selectedRequest.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <ExternalLink className="h-5 w-5" />
                                            LinkedIn Post
                                        </h3>
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(selectedRequest.linkedinPostUrl, '_blank')}
                                                    className="flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    View LinkedIn Post
                                                </Button>
                                            </div>
                                            <div className="p-3 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                                <div className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                                                    {selectedRequest.linkedinPostUrl}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        selectedRequest.userPostContent && (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <MessageSquare className="h-5 w-5" />
                                                    User&apos;s Post Content
                                                </h3>
                                                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                                                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                                        <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {selectedRequest.userPostContent}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    {
                                        selectedRequest.status !== 'PENDING' && (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Award className="h-5 w-5" />
                                                    Processing Information
                                                </h3>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">Processed Date:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {selectedRequest.processedAt ? formatDate(selectedRequest.processedAt) : 'N/A'}
                                                            </span>
                                                        </div>
                                                        {
                                                            selectedRequest.processedByUser && (
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Processed By:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                        {selectedRequest.processedByUser.name || selectedRequest.processedByUser.email}
                                                                    </span>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                    {
                                                        selectedRequest.adminNotes && (
                                                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Admin Notes</div>
                                                                <p className="text-sm text-blue-700 dark:text-blue-300">{selectedRequest.adminNotes}</p>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        )
                                    }
                                    {
                                        selectedRequest.status === 'PENDING' && (
                                            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Award className="h-5 w-5" />
                                                    Process Request
                                                </h3>
                                                {
                                                    !actionType && (
                                                        <div className="space-y-4">
                                                            <Label className="text-sm font-medium">Choose Action</Label>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <Button
                                                                    onClick={() => setActionType('APPROVE')}
                                                                    className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                                                                >
                                                                    <CheckCircle className="h-6 w-6" />
                                                                    <span className="font-semibold">Approve Request</span>
                                                                    <span className="text-xs opacity-90">Grant credits to user</span>
                                                                </Button>
                                                                <Button
                                                                    onClick={() => setActionType('REJECT')}
                                                                    variant="destructive"
                                                                    className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                                                                >
                                                                    <XCircle className="h-6 w-6" />
                                                                    <span className="font-semibold">Reject Request</span>
                                                                    <span className="text-xs opacity-90">Decline with reason</span>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                {
                                                    actionType && (
                                                        <div className="space-y-6">
                                                            <div className={`p-6 rounded-xl border-l-4 shadow-sm ${actionType === 'APPROVE'
                                                                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-500 dark:border-emerald-400'
                                                                    : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-500 dark:border-red-400'
                                                                }`}>
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    {
                                                                        actionType === 'APPROVE' ? (
                                                                            <div className="p-2 bg-emerald-500 rounded-lg shadow-sm">
                                                                                <CheckCircle className="h-5 w-5 text-white" />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="p-2 bg-red-500 rounded-lg shadow-sm">
                                                                                <XCircle className="h-5 w-5 text-white" />
                                                                            </div>
                                                                        )
                                                                    }
                                                                    <div>
                                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                            {actionType === 'APPROVE' ? 'Approving Credit Request' : 'Rejecting Credit Request'}
                                                                        </h4>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {
                                                                                actionType === 'APPROVE'
                                                                                    ? 'The user will receive their credits and a confirmation email.'
                                                                                    : 'The user will receive an email explaining why their request was rejected.'
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <Label htmlFor="adminNotes" className="text-sm font-medium flex items-center gap-2">
                                                                    <MessageSquare className="h-4 w-4" />
                                                                    {actionType === 'APPROVE' ? 'Admin Notes (Optional)' : 'Rejection Reason (Required) *'}
                                                                </Label>
                                                                <Textarea
                                                                    id="adminNotes"
                                                                    placeholder={
                                                                        actionType === 'APPROVE'
                                                                            ? "Add any congratulatory message or notes..."
                                                                            : "Please explain why this request is being rejected (e.g., post is not public, missing @CoderzLab mention, doesn&apos;t meet requirements, etc.)"
                                                                    }
                                                                    value={adminNotes}
                                                                    onChange={(e) => setAdminNotes(e.target.value)}
                                                                    rows={actionType === 'REJECT' ? 4 : 3}
                                                                    className={`resize-none bg-white dark:bg-gray-950 border shadow-sm ${actionType === 'REJECT' && !adminNotes.trim()
                                                                            ? 'border-red-300 focus:border-red-500'
                                                                            : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500'
                                                                        }`}
                                                                />
                                                                {
                                                                    actionType === 'REJECT' && !adminNotes.trim() && (
                                                                        <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                                                                            <AlertCircle className="h-4 w-4" />
                                                                            Please provide a reason for rejection
                                                                        </div>
                                                                    )
                                                                }
                                                                {
                                                                    actionType === 'REJECT' && (
                                                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                                <strong className="text-gray-900 dark:text-white">Common rejection reasons:</strong>
                                                                                <ul className="mt-2 space-y-1 list-disc list-inside">
                                                                                    <li>LinkedIn post is not public or accessible</li>
                                                                                    <li>Missing @CoderzLab mention in the post</li>
                                                                                    <li>Post content doesn&apos;t match our template guidelines</li>
                                                                                    <li>Suspicious or duplicate request</li>
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <Button
                                                                    onClick={() => handleProcessRequest(selectedRequest.id, actionType)}
                                                                    disabled={processing || (actionType === 'REJECT' && !adminNotes.trim())}
                                                                    className={`flex-1 h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${actionType === 'APPROVE'
                                                                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
                                                                            : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
                                                                        }`}
                                                                >
                                                                    {
                                                                        processing ? (
                                                                            <>
                                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                Processing...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {
                                                                                    actionType === 'APPROVE' ? (
                                                                                        <>
                                                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                                                            Confirm Approval
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <XCircle className="mr-2 h-4 w-4" />
                                                                                            Confirm Rejection
                                                                                        </>
                                                                                    )
                                                                                }
                                                                            </>
                                                                        )
                                                                    }
                                                                </Button>
                                                                <Button
                                                                    onClick={() => {
                                                                        setActionType(null);
                                                                        setAdminNotes(selectedRequest?.adminNotes || "");
                                                                    }}
                                                                    disabled={processing}
                                                                    variant="outline"
                                                                    className="flex-1 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                                        Email notification will be sent to the user automatically
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        }
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
} 

export default function CreditRequests() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreditRequestsPage />
        </Suspense>
    )
}