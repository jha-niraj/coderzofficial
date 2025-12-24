"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Plus, BookOpen, Award, Eye, Heart, Users, Clock, Loader2, MoreVertical,
    Trash2, Share2, Globe, Lock, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Card, CardContent
} from "@repo/ui/components/ui/card";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@repo/ui/components/ui/dropdown-menu";
import {
    getUserPracticeSets, getUserExamSets
} from "@/actions/(main)/assessments/user-sets.action";
import { toast } from "sonner";
import type { PracticeSetPreview, ExamSetPreview } from "@/types/assessment";

const statusIcons = {
    GENERATING: Clock,
    READY: CheckCircle2,
    FAILED: XCircle,
    ARCHIVED: AlertCircle,
};

const statusColors = {
    GENERATING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    READY: "bg-green-500/10 text-green-500 border-green-500/20",
    FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
    ARCHIVED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const difficultyColors = {
    BEGINNER: "bg-emerald-500",
    EASY: "bg-green-500",
    INTERMEDIATE: "bg-yellow-500",
    ADVANCED: "bg-orange-500",
    EXPERT: "bg-red-500",
};

export default function MySetsPage() {
    const [practiceSets, setPracticeSets] = useState<PracticeSetPreview[]>([]);
    const [examSets, setExamSets] = useState<ExamSetPreview[]>([]);
    const [practiceLoading, setPracticeLoading] = useState(true);
    const [examLoading, setExamLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("practice");

    const fetchPracticeSets = async () => {
        setPracticeLoading(true);
        const result = await getUserPracticeSets();
        if (result.success) {
            setPracticeSets(Array.isArray(result.data) ? result.data as PracticeSetPreview[] : []);
        }
        setPracticeLoading(false);
    };

    const fetchExamSets = async () => {
        setExamLoading(true);
        const result = await getUserExamSets();
        if (result.success) {
            setExamSets(Array.isArray(result.data) ? result.data as ExamSetPreview[] : []);
        }
        setExamLoading(false);
    };

    useEffect(() => {
        fetchPracticeSets();
        fetchExamSets();
    }, []);

    const handleShare = (url: string) => {
        navigator.clipboard.writeText(window.location.origin + url);
        toast.success("Link copied to clipboard!");
    };

    const renderSetCard = (set: PracticeSetPreview | ExamSetPreview, type: "practice" | "exam") => {
        const StatusIcon = statusIcons[set.status as keyof typeof statusIcons] || Clock;
        const isReady = set.status === "ACTIVE";

        return (
            <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className={`${!isReady ? "opacity-70" : ""}`}>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${type === "practice" ? "bg-blue-500/10" : "bg-red-500/10"}`}>
                                {
                                    type === "practice" ? (
                                        <BookOpen className={`h-5 w-5 ${type === "practice" ? "text-blue-500" : "text-red-500"}`} />
                                    ) : (
                                        <Award className="h-5 w-5 text-red-500" />
                                    )
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className={statusColors[set.status as keyof typeof statusColors]}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {set.status}
                                            </Badge>
                                            {
                                                set.isPublic ? (
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                                        <Globe className="h-3 w-3 mr-1" />
                                                        Public
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                                                        <Lock className="h-3 w-3 mr-1" />
                                                        Private
                                                    </Badge>
                                                )
                                            }
                                        </div>
                                        <h3 className="font-semibold truncate">{set.title}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                            <Badge variant="secondary" className="text-xs">
                                                {set.language}
                                            </Badge>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${difficultyColors[set.difficulty as keyof typeof difficultyColors]}`} />
                                                {set.difficulty}
                                            </span>
                                            <span>•</span>
                                            <span>{set.mode}</span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {
                                                isReady && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/assessments/${type}/set/${set.id}`}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleShare(`/assessments/${type}/set/${set.id}`)}>
                                                            <Share2 className="h-4 w-4 mr-2" />
                                                            Copy Link
                                                        </DropdownMenuItem>
                                                    </>
                                                )
                                            }
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        {set._count?.questions || 0} questions
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        {set._count?.attempts || 0} attempts
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart className="h-3.5 w-3.5" />
                                        {set._count?.likedBy || set.likes || 0} likes
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-3.5 w-3.5" />
                                        {set.views || 0} views
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Created {new Date(set.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 py-8">
            <div className="container max-w-5xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">My Sets</h1>
                            <p className="text-muted-foreground">Manage your created practice and exam sets</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/assessments/practice/create">
                            <Button variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Practice Set
                            </Button>
                        </Link>
                        <Link href="/assessments/exam/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Exam Set
                            </Button>
                        </Link>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid sm:grid-cols-2 gap-4 mb-8"
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <BookOpen className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Practice Sets</p>
                                        <p className="text-2xl font-bold">{practiceSets.length}</p>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                    <p>{practiceSets.filter(s => s.isPublic).length} public</p>
                                    <p>{practiceSets.filter(s => s.status === "ACTIVE").length} ready</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-500/10">
                                        <Award className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Exam Sets</p>
                                        <p className="text-2xl font-bold">{examSets.length}</p>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                    <p>{examSets.filter(s => s.isPublic).length} public</p>
                                    <p>{examSets.filter(s => s.status === "ACTIVE").length} ready</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="practice" className="gap-2">
                                <BookOpen className="h-4 w-4" />
                                Practice Sets ({practiceSets.length})
                            </TabsTrigger>
                            <TabsTrigger value="exam" className="gap-2">
                                <Award className="h-4 w-4" />
                                Exam Sets ({examSets.length})
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="practice">
                            {
                                practiceLoading ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : practiceSets.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-16 text-center">
                                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No practice sets yet</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Create your first AI-generated practice set
                                            </p>
                                            <Link href="/assessments/practice/create">
                                                <Button>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create Practice Set
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {practiceSets.map(set => renderSetCard(set, "practice"))}
                                    </div>
                                )
                            }
                        </TabsContent>
                        <TabsContent value="exam">
                            {
                                examLoading ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : examSets.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-16 text-center">
                                            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No exam sets yet</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Create your first AI-generated exam set
                                            </p>
                                            <Link href="/assessments/exam/create">
                                                <Button>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create Exam Set
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {examSets.map(set => renderSetCard(set, "exam"))}
                                    </div>
                                )
                            }
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    );
}