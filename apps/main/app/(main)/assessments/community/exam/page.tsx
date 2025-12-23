"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Search, Filter, Award, Clock, Users, Heart, Eye, Code2, CheckCircle2,
    MessageSquare, Shuffle, Loader2, SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card, CardContent, CardFooter, CardHeader
} from "@/components/ui/card";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@/components/ui/avatar";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet";
import { getPublicExamSets } from "@/actions/(main)/assessments/user-sets.action";
import type { ExamSetPreview } from "@/types/assessment";
import {
    AssessmentLanguage, AssessmentMode, QuestionDifficulty
} from "@prisma/client";

const LANGUAGES = [
    "JAVASCRIPT", "PYTHON", "TYPESCRIPT", "REACTJS", "NODEJS",
    "JAVA", "CPP", "C", "GO", "RUST", "PHP", "SWIFT", "KOTLIN", "RUBY", "SCALA"
];

const MODES = ["QUIZ", "CODE", "MOCK", "MIXED"];
const DIFFICULTIES = ["INTERMEDIATE", "ADVANCED", "EXPERT"];
const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
];

const modeIcons = {
    QUIZ: CheckCircle2,
    CODE: Code2,
    MOCK: MessageSquare,
    MIXED: Shuffle,
};

const modeColors = {
    QUIZ: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    CODE: "bg-green-500/10 text-green-500 border-green-500/20",
    MOCK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    MIXED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const difficultyColors = {
    BEGINNER: "bg-emerald-500",
    EASY: "bg-green-500",
    INTERMEDIATE: "bg-yellow-500",
    ADVANCED: "bg-orange-500",
    EXPERT: "bg-red-500",
};

export default function CommunityExamPage() {
    const [examSets, setExamSets] = useState<ExamSetPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        language: "",
        mode: "",
        difficulty: "",
        sortBy: "newest" as "newest" | "popular" | "rating",
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
    });

    const fetchExamSets = useCallback(async (page = 1) => {
        setLoading(true);
        const result = await getPublicExamSets({
            language: (filters.language || undefined) as AssessmentLanguage | undefined,
            mode: (filters.mode || undefined) as AssessmentMode | undefined,
            difficulty: (filters.difficulty || undefined) as QuestionDifficulty | undefined,
            topic: searchQuery || undefined,
            sortBy: filters.sortBy,
            page,
            limit: pagination.limit,
        });

        if (result.success) {
            setExamSets(Array.isArray(result.data) ? result.data as ExamSetPreview[] : []);
            if (result.pagination) {
                setPagination(result.pagination);
            }
        }
        setLoading(false);
    }, [filters, pagination.limit, searchQuery]);

    useEffect(() => {
        fetchExamSets(1);
    }, [filters, fetchExamSets]);

    const handleSearch = () => {
        fetchExamSets(1);
    };

    const clearFilters = () => {
        setFilters({
            language: "",
            mode: "",
            difficulty: "",
            sortBy: "newest",
        });
        setSearchQuery("");
    };

    const hasActiveFilters = filters.language || filters.mode || filters.difficulty || searchQuery;

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-red-500/10">
                            <Award className="h-8 w-8 text-red-500" />
                        </div>
                        <h1 className="text-4xl font-bold">Community Exam Sets</h1>
                    </div>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Challenge yourself with exam sets created by the community.
                        Test your skills with intermediate and advanced level questions.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by topic..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch}>Search</Button>
                        </div>
                        <div className="hidden lg:flex gap-2">
                            <Select
                                value={filters.language}
                                onValueChange={(value) => setFilters(f => ({ ...f, language: value }))}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Languages</SelectItem>
                                    {
                                        LANGUAGES.map(lang => (
                                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.mode}
                                onValueChange={(value) => setFilters(f => ({ ...f, mode: value }))}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Modes</SelectItem>
                                    {
                                        MODES.map(mode => (
                                            <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.difficulty}
                                onValueChange={(value) => setFilters(f => ({ ...f, difficulty: value }))}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Levels</SelectItem>
                                    {
                                        DIFFICULTIES.map(diff => (
                                            <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.sortBy}
                                onValueChange={(value: "newest" | "popular" | "rating") => setFilters(f => ({ ...f, sortBy: value }))}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        SORT_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden">
                                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                                    Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                </SheetHeader>
                                <div className="space-y-4 mt-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Language</label>
                                        <Select
                                            value={filters.language}
                                            onValueChange={(value) => setFilters(f => ({ ...f, language: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Languages" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Languages</SelectItem>
                                                {
                                                    LANGUAGES.map(lang => (
                                                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mode</label>
                                        <Select
                                            value={filters.mode}
                                            onValueChange={(value) => setFilters(f => ({ ...f, mode: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Modes" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Modes</SelectItem>
                                                {
                                                    MODES.map(mode => (
                                                        <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Difficulty</label>
                                        <Select
                                            value={filters.difficulty}
                                            onValueChange={(value) => setFilters(f => ({ ...f, difficulty: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Levels" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Levels</SelectItem>
                                                {
                                                    DIFFICULTIES.map(diff => (
                                                        <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Sort By</label>
                                        <Select
                                            value={filters.sortBy}
                                            onValueChange={(value: "newest" | "popular" | "rating") => setFilters(f => ({ ...f, sortBy: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    SORT_OPTIONS.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={clearFilters}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {
                        hasActiveFilters && (
                            <div className="flex items-center gap-2 mt-4 flex-wrap">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {
                                    filters.language && (
                                        <Badge variant="secondary">{filters.language}</Badge>
                                    )
                                }
                                {
                                    filters.mode && (
                                        <Badge variant="secondary">{filters.mode}</Badge>
                                    )
                                }
                                {
                                    filters.difficulty && (
                                        <Badge variant="secondary">{filters.difficulty}</Badge>
                                    )
                                }
                                {
                                    searchQuery && (
                                        <Badge variant="secondary">"{searchQuery}"</Badge>
                                    )
                                }
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    Clear all
                                </Button>
                            </div>
                        )
                    }
                </motion.div>

                {
                    loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : examSets.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Filter className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No exam sets found</h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your filters or search query
                            </p>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </motion.div>
                    ) : (
                        <>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {
                                    examSets.map((set, index) => {
                                        const ModeIcon = modeIcons[set.mode as keyof typeof modeIcons] || CheckCircle2;

                                        return (
                                            <motion.div
                                                key={set.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link href={`/assessments/exam/set/${set.id}`}>
                                                    <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
                                                        <CardHeader className="pb-3">
                                                            <div className="flex items-start justify-between">
                                                                <div className={`p-2 rounded-lg ${modeColors[set.mode as keyof typeof modeColors]}`}>
                                                                    <ModeIcon className="h-5 w-5" />
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className={`w-2 h-2 rounded-full ${difficultyColors[set.difficulty as keyof typeof difficultyColors]}`} />
                                                                    <span className="text-xs text-muted-foreground">{set.difficulty}</span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3">
                                                                <Badge variant="outline" className="text-xs mb-2 bg-red-500/10 text-red-500 border-red-500/20">
                                                                    <Award className="h-3 w-3 mr-1" />
                                                                    Exam
                                                                </Badge>
                                                                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                                                    {set.title}
                                                                </h3>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="pb-3">
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {set.language}
                                                                </Badge>
                                                                <span>•</span>
                                                                <span>{set._count?.questions || 0} questions</span>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="h-3.5 w-3.5" />
                                                                    {set._count?.attempts || 0}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Heart className="h-3.5 w-3.5" />
                                                                    {set._count?.likedBy || 0}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                    {set.views || 0}
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                        <CardFooter className="pt-3 border-t">
                                                            <div className="flex items-center gap-2 w-full">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage src={set.creator?.image ?? undefined} />
                                                                    <AvatarFallback className="text-xs">
                                                                        {set.creator?.name?.charAt(0) || "U"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-xs text-muted-foreground truncate">
                                                                    {set.creator?.name || "Anonymous"}
                                                                </span>
                                                                {
                                                                    set.timeLimit && (
                                                                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                                                                            <Clock className="h-3 w-3" />
                                                                            {Math.floor(set.timeLimit / 60)}m
                                                                        </span>
                                                                    )
                                                                }
                                                            </div>
                                                        </CardFooter>
                                                    </Card>
                                                </Link>
                                            </motion.div>
                                        );
                                    })
                                }
                            </div>

                            {
                                pagination.totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-10">
                                        <Button
                                            variant="outline"
                                            disabled={pagination.page === 1}
                                            onClick={() => fetchExamSets(pagination.page - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {
                                                Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                    const pageNum = i + 1;
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={pagination.page === pageNum ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => fetchExamSets(pageNum)}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })
                                            }
                                            {
                                                pagination.totalPages > 5 && (
                                                    <span className="px-2 text-muted-foreground">...</span>
                                                )
                                            }
                                        </div>
                                        <Button
                                            variant="outline"
                                            disabled={pagination.page === pagination.totalPages}
                                            onClick={() => fetchExamSets(pagination.page + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </div>
        </div>
    );
}