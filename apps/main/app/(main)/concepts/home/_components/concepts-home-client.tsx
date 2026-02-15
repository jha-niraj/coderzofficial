"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Plus, Eye, Heart, Coins, Users, FileText,
    TrendingUp, Clock, CheckCircle2, Archive,
    Share2, MoreVertical, Edit, Trash2, Copy, Twitter, Linkedin,
    BarChart3
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    Tabs, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@repo/ui/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogDescription
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import toast from "@repo/ui/components/ui/sonner";
import { cn } from "@repo/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Concept {
    id: string;
    slug: string;
    title: string;
    iconEmoji: string | null;
    status: string;
    pricingType: string;
    price: number;
    viewCount: number;
    likeCount: number;
    bookmarkCount: number;
    commentCount: number;
    verifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        steps: number;
        purchases: number;
        progress: number;
    };
}

interface TotalStats {
    totalConcepts: number;
    totalViews: number;
    totalLikes: number;
    totalBookmarks: number;
    totalComments: number;
    totalEarnings: number;
    totalPurchases: number;
    totalLearners: number;
}

interface StatusCounts {
    draft: number;
    pending: number;
    published: number;
    archived: number;
}

interface Purchase {
    id: string;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
    };
    concept: {
        title: string;
        slug: string;
        iconEmoji: string | null;
    };
}

interface ConceptsHomeClientProps {
    concepts: Concept[];
    totalStats: TotalStats;
    statusCounts: StatusCounts;
    recentPurchases: Purchase[];
}

const statusConfig = {
    DRAFT: { label: "Draft", color: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300", icon: FileText },
    PENDING_VERIFICATION: { label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
    PUBLISHED: { label: "Published", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
    ARCHIVED: { label: "Archived", color: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500", icon: Archive },
};

export default function ConceptsHomeClient({
    concepts,
    totalStats,
    statusCounts,
    recentPurchases,
}: ConceptsHomeClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

    const filteredConcepts = concepts.filter(c => {
        if (activeTab === "all") return true;
        if (activeTab === "draft") return c.status === "DRAFT";
        if (activeTab === "pending") return c.status === "PENDING_VERIFICATION";
        if (activeTab === "published") return c.status === "PUBLISHED" && c.verifiedAt;
        if (activeTab === "paid") return c.pricingType === "PAID";
        return true;
    });

    const handleShare = (concept: Concept) => {
        setSelectedConcept(concept);
        setShareDialogOpen(true);
    };

    const handleCopyLink = async () => {
        if (!selectedConcept) return;
        const url = `${window.location.origin}/concepts/${selectedConcept.slug}`;
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const handleShareTwitter = () => {
        if (!selectedConcept) return;
        const url = `${window.location.origin}/concepts/${selectedConcept.slug}`;
        const text = `Check out my concept "${selectedConcept.title}" on TheCoderz!`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    };

    const handleShareLinkedIn = () => {
        if (!selectedConcept) return;
        const url = `${window.location.origin}/concepts/${selectedConcept.slug}`;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Creator Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your concepts and track your earnings
                    </p>
                </div>
                <Link href="/concepts/create">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Concept
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalStats.totalViews.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Total Views</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalStats.totalLikes.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Total Likes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalStats.totalLearners.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Learners</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Coins className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalStats.totalEarnings.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Credits Earned</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Concepts List */}
                <div className="lg:col-span-2">
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">My Concepts</CardTitle>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                                <TabsList className="bg-neutral-100 dark:bg-neutral-800/50">
                                    <TabsTrigger value="all" className="text-xs">
                                        All ({concepts.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="draft" className="text-xs">
                                        Drafts ({statusCounts.draft})
                                    </TabsTrigger>
                                    <TabsTrigger value="pending" className="text-xs">
                                        Pending ({statusCounts.pending})
                                    </TabsTrigger>
                                    <TabsTrigger value="published" className="text-xs">
                                        Published ({statusCounts.published})
                                    </TabsTrigger>
                                    <TabsTrigger value="paid" className="text-xs">
                                        Paid
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent>
                            {filteredConcepts.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground">No concepts found</p>
                                    <Link href="/concepts/create">
                                        <Button variant="outline" className="mt-4">
                                            Create your first concept
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <ScrollArea className="h-[500px]">
                                    <div className="space-y-3 pr-4">
                                        {filteredConcepts.map((concept) => {
                                            const statusInfo = statusConfig[concept.status as keyof typeof statusConfig] || statusConfig.DRAFT;
                                            const StatusIcon = statusInfo.icon;
                                            
                                            return (
                                                <motion.div
                                                    key={concept.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all bg-white dark:bg-neutral-900"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-2xl">{concept.iconEmoji || "📚"}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <Link 
                                                                    href={`/concepts/${concept.slug}`}
                                                                    className="font-semibold text-sm hover:text-blue-600 transition-colors"
                                                                >
                                                                    {concept.title}
                                                                </Link>
                                                                <Badge className={cn("text-[10px]", statusInfo.color)}>
                                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                                    {statusInfo.label}
                                                                </Badge>
                                                                {concept.pricingType === "PAID" && (
                                                                    <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                                        <Coins className="w-3 h-3 mr-1" />
                                                                        {concept.price} credits
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Eye className="w-3 h-3" />
                                                                    {concept.viewCount}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Heart className="w-3 h-3" />
                                                                    {concept.likeCount}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="w-3 h-3" />
                                                                    {concept._count.progress}
                                                                </span>
                                                                {concept.pricingType === "PAID" && (
                                                                    <span className="flex items-center gap-1 text-amber-600">
                                                                        <TrendingUp className="w-3 h-3" />
                                                                        {concept._count.purchases} sales
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => router.push(`/concepts/${concept.slug}`)}>
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => router.push(`/concepts/create?edit=${concept.id}`)}>
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                {concept.status === "PUBLISHED" && concept.verifiedAt && (
                                                                    <DropdownMenuItem onClick={() => handleShare(concept)}>
                                                                        <Share2 className="w-4 h-4 mr-2" />
                                                                        Share
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-red-600">
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Recent Activity */}
                <div className="space-y-6">
                    {/* Earnings Card */}
                    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Coins className="w-4 h-4 text-amber-600" />
                                Earnings Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Earned</span>
                                    <span className="text-xl font-bold text-amber-600">{totalStats.totalEarnings}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Sales</span>
                                    <span className="font-medium">{totalStats.totalPurchases}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Purchases */}
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                Recent Sales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentPurchases.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">
                                    No sales yet. Create paid concepts to start earning!
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentPurchases.slice(0, 5).map((purchase) => (
                                        <div key={purchase.id} className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={purchase.user.image || undefined} />
                                                <AvatarFallback className="text-xs">
                                                    {purchase.user.name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">
                                                    {purchase.user.name || purchase.user.username || "User"}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                    purchased {purchase.concept.title}
                                                </p>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(purchase.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                Content Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Concepts</span>
                                    <span className="font-semibold">{totalStats.totalConcepts}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Bookmarks</span>
                                    <span className="font-semibold">{totalStats.totalBookmarks}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Comments</span>
                                    <span className="font-semibold">{totalStats.totalComments}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-blue-500" />
                            Share Concept
                        </DialogTitle>
                        <DialogDescription>
                            Share &ldquo;{selectedConcept?.title}&rdquo; with your network
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="flex gap-2">
                            <Input
                                value={selectedConcept ? `${window.location.origin}/concepts/${selectedConcept.slug}` : ""}
                                readOnly
                                className="flex-1 bg-neutral-50 dark:bg-neutral-900"
                            />
                            <Button onClick={handleCopyLink} variant="outline">
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={handleShareTwitter} className="flex items-center gap-2">
                                <Twitter className="w-4 h-4" />
                                Twitter
                            </Button>
                            <Button variant="outline" onClick={handleShareLinkedIn} className="flex items-center gap-2">
                                <Linkedin className="w-4 h-4" />
                                LinkedIn
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}