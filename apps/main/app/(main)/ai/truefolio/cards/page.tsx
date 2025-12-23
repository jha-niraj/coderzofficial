"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    ImageIcon, Share, Download, Copy, Twitter, Linkedin, Plus, Calendar, Eye,
    TrendingUp, Shield, ExternalLink, Sparkles, MoreVertical, Heart, Zap, Code2, X
} from "lucide-react";
import { toast } from "sonner";
import { getUserCards, incrementShareCount } from "@/actions/card.action";
import Image from "next/image";

interface PortfolioCard {
    id: string;
    title: string;
    description: string;
    cardData: {
        userName: string;
        userAvatar: string;
        overallScore: string;
        activityLevel: string;
        careerLevel: string;
        skills: {
            languages: string[];
            frameworks: string[];
        };
        [key: string]: any;
    };
    isPublic: boolean;
    shareCount: number;
    createdAt: string;
    imageUrl?: string | null;
    userId?: string;
    updatedAt?: string;
}

export default function CardsPage() {
    const { user } = useUser();
    const [cards, setCards] = useState<PortfolioCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<PortfolioCard | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const result = await getUserCards();
            if (result.success) {
                // Transform the database result to match our interface
                const transformedCards = result.cards.map(card => ({
                    ...card,
                    cardData: card.cardData as any,
                    createdAt: card.createdAt.toISOString(),
                    updatedAt: card.updatedAt.toISOString()
                }));
                setCards(transformedCards);
            } else {
                toast.error(result.error || "Failed to fetch cards");
            }
        } catch (error) {
            console.error('Error fetching cards:', error);
            toast.error("Failed to fetch cards");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async (platform: string) => {
        if (selectedCard) {
            const result = await incrementShareCount(selectedCard.id);
            if (result.success) {
                setCards(cards.map(card =>
                    card.id === selectedCard.id
                        ? { ...card, shareCount: card.shareCount + 1 }
                        : card
                ));
            }
        }

        const url = `${window.location.origin}/portfolio/${user?.username}`;
        const text = `Check out my AI-verified portfolio card!`;

        if (platform === "twitter") {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        } else if (platform === "linkedin") {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        } else if (platform === "copy") {
            navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        }
        setShareDialogOpen(false);
    };

    const handleDownload = (card: PortfolioCard) => {
        toast.success("Card download will be available soon!");
    };

    const handleCardClick = (card: PortfolioCard) => {
        setSelectedCard(card);
        setPreviewDialogOpen(true);
    };

    const CardPreview = ({ card }: { card: PortfolioCard }) => (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group cursor-pointer"
            onClick={() => handleCardClick(card)}
        >
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <div className="aspect-[16/10] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-1">
                    <div className="w-full h-full bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-teal-500/30 to-cyan-500/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/20">
                                            {
                                                card.cardData.userAvatar ? (
                                                    <Image
                                                        src={card.cardData.userAvatar}
                                                        alt={card.cardData.userName}
                                                        className="w-full h-full object-cover"
                                                        height={32}
                                                        width={32}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-lg font-bold">
                                                        {card.cardData.userName.split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center">
                                            <Shield className="h-3 w-3 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{card.cardData.userName}</h3>
                                        <p className="text-emerald-200 text-xs">{card.title}</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-2 backdrop-blur-xl">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                                        {card.cardData.overallScore}
                                    </div>
                                    <div className="text-xs text-emerald-200 text-center">Score</div>
                                </div>
                            </div>
                            <div className="mb-4 flex-1">
                                <div className="flex flex-wrap gap-1">
                                    {
                                        card.cardData.skills.languages.slice(0, 4).map((skill, i) => (
                                            <div key={i} className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                                                <Code2 className="h-2.5 w-2.5 text-emerald-300" />
                                                <span className="text-xs font-medium text-white">{skill}</span>
                                            </div>
                                        ))
                                    }
                                    {
                                        card.cardData.skills.languages.length > 4 && (
                                            <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-medium backdrop-blur-sm">
                                                +{card.cardData.skills.languages.length - 4}
                                            </span>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center">
                                        <span className="text-xs font-bold">T</span>
                                    </div>
                                    <span className="text-xs font-semibold text-white">TrueFolio</span>
                                </div>
                                <div className="text-xs text-emerald-200">AI-Verified</div>
                            </div>
                        </div>
                    </div>
                </div>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-foreground text-lg">{card.title}</h3>
                        <Badge
                            variant={card.isPublic ? "default" : "secondary"}
                            className={card.isPublic ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""}
                        >
                            {card.isPublic ? "Public" : "Private"}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{card.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {card.shareCount} shares
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(card.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCard(card);
                                setShareDialogOpen(true);
                            }}
                            className="flex-1 h-9 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:from-blue-500/20 hover:to-purple-500/20"
                        >
                            <Share className="h-3 w-3 mr-1" />
                            Share
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(card);
                            }}
                            className="flex-1 h-9 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:from-emerald-500/20 hover:to-cyan-500/20"
                        >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const FullCardPreview = ({ card }: { card: PortfolioCard }) => (
        <div className="relative max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-1 shadow-2xl">
                <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-3xl p-8 text-white overflow-hidden relative backdrop-blur-xl">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-teal-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-white/20 shadow-xl">
                                        {
                                            card.cardData.userAvatar ? (
                                                <Image
                                                    src={card.cardData.userAvatar}
                                                    alt={card.cardData.userName}
                                                    className="w-full h-full object-cover"
                                                    width={32}
                                                    height={32}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-2xl font-bold">
                                                    {card.cardData.userName.split(" ").map(n => n[0]).join("") || "U"}
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center border-2 border-slate-900">
                                        <Shield className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-1 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                                        {card.cardData.userName}
                                    </h3>
                                    <p className="text-emerald-200 text-base font-medium">{card.title}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                        <span className="text-emerald-300 text-sm font-medium">AI Verified</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 backdrop-blur-xl border border-white/10">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                                        {card.cardData.overallScore}
                                    </div>
                                    <div className="text-xs text-emerald-200 font-semibold tracking-wider uppercase">Portfolio Score</div>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-emerald-200 mb-4 tracking-wider uppercase">Top Skills & Technologies</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {
                                    card.cardData.skills.languages.slice(0, 6).map((skill, i) => (
                                        <div key={i} className="bg-gradient-to-r from-white/15 to-white/5 rounded-lg px-3 py-2 backdrop-blur-sm border border-white/10 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Code2 className="h-3 w-3 text-emerald-300" />
                                                <span className="text-white text-xs font-medium">{skill}</span>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl p-4 text-center backdrop-blur-sm border border-emerald-400/20">
                                <div className="text-lg font-bold text-emerald-300 mb-1">
                                    {card.cardData.activityLevel || "High"}
                                </div>
                                <div className="text-xs text-emerald-200 font-semibold tracking-wider uppercase">Activity</div>
                            </div>
                            <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl p-4 text-center backdrop-blur-sm border border-teal-400/20">
                                <div className="text-lg font-bold text-teal-300 mb-1">
                                    {card.cardData.careerLevel || "Mid-Level"}
                                </div>
                                <div className="text-xs text-teal-200 font-semibold tracking-wider uppercase">Level</div>
                            </div>
                            <div className="bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-xl p-4 text-center backdrop-blur-sm border border-cyan-400/20">
                                <div className="text-lg font-bold text-cyan-300 mb-1">
                                    {card.cardData.skills.languages.length || 0}+
                                </div>
                                <div className="text-xs text-cyan-200 font-semibold tracking-wider uppercase">Technologies</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white text-sm font-bold">T</span>
                                </div>
                                <div>
                                    <span className="text-white text-lg font-bold">TrueFolio</span>
                                    <p className="text-emerald-200 text-xs">Premium Portfolio Platform</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-emerald-200 text-sm">
                                    {
                                        new Date(card.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            year: 'numeric'
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const StatsCard = ({ title, value, icon: Icon, color, description }: any) => (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                            <p className="text-3xl font-bold text-foreground">{value}</p>
                            {
                                description && (
                                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                                )
                            }
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                            <Icon className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <Skeleton className="h-10 w-64 mb-4" />
                        <Skeleton className="h-6 w-96" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                        {
                            [...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-32" />
                            ))
                        }
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {
                            [...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-96" />
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-900 to-teal-50 dark:from-teal-650 dark:via-emerald-900 dark:to-teal-650 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                Portfolio Cards
                            </h1>
                            <p className="text-muted-foreground text-base md:text-lg">
                                Create and share beautiful portfolio cards showcasing your skills and achievements
                            </p>
                        </div>
                        <Button
                            onClick={() => window.location.href = '/portfolio'}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 h-12 px-6"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Card
                        </Button>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
                >
                    <StatsCard
                        title="Total Cards"
                        value={cards.length}
                        icon={ImageIcon}
                        color="bg-purple-500/10 text-purple-500"
                        description="Cards created"
                    />
                    <StatsCard
                        title="Total Shares"
                        value={cards.reduce((sum, card) => sum + card.shareCount, 0)}
                        icon={Share}
                        color="bg-emerald-500/10 text-emerald-500"
                        description="Times shared"
                    />
                    <StatsCard
                        title="Public Cards"
                        value={cards.filter(card => card.isPublic).length}
                        icon={Eye}
                        color="bg-blue-500/10 text-blue-500"
                        description="Publicly visible"
                    />
                    <StatsCard
                        title="Avg. Score"
                        value={cards.length > 0 ? Math.round(cards.reduce((sum, card) => sum + parseInt(card.cardData.overallScore), 0) / cards.length) : 0}
                        icon={TrendingUp}
                        color="bg-amber-500/10 text-amber-500"
                        description="Portfolio average"
                    />
                </motion.div>
                <AnimatePresence>
                    {
                        cards.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
                            >
                                {
                                    cards.map((card, index) => (
                                        <motion.div
                                            key={card.id}
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: 0.1 * index, duration: 0.3 }}
                                        >
                                            <CardPreview card={card} />
                                        </motion.div>
                                    ))
                                }
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16 md:py-24"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <ImageIcon className="h-12 w-12 text-purple-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">No cards yet</h3>
                                <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                                    Create your first portfolio card to start sharing your achievements and skills with the world.
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/portfolio'}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 h-12 px-8"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Create Your First Card
                                </Button>
                            </motion.div>
                        )
                    }
                </AnimatePresence>
                <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="flex items-center gap-2 text-xl">
                                        <ImageIcon className="h-5 w-5 text-emerald-500" />
                                        Card Preview
                                    </DialogTitle>
                                    <DialogDescription>
                                        Preview how your portfolio card will look when shared
                                    </DialogDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPreviewDialogOpen(false)}
                                    className="rounded-full h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </DialogHeader>
                        <div className="space-y-6">
                            {selectedCard && <FullCardPreview card={selectedCard} />}

                            <div className="flex items-center justify-center gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (selectedCard) {
                                            setPreviewDialogOpen(false);
                                            setShareDialogOpen(true);
                                        }
                                    }}
                                    className="flex-1 max-w-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:from-blue-500/20 hover:to-purple-500/20"
                                >
                                    <Share className="h-4 w-4 mr-2" />
                                    Share Card
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (selectedCard) {
                                            handleDownload(selectedCard);
                                        }
                                    }}
                                    className="flex-1 max-w-xs bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:from-emerald-500/20 hover:to-cyan-500/20"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Card
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Share className="h-5 w-5 text-purple-500" />
                                Share Portfolio Card
                            </DialogTitle>
                            <DialogDescription>
                                Share your portfolio card across different platforms
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleShare("twitter")}
                                    className="flex items-center gap-2 h-12 bg-blue-500/5 border-blue-500/20 text-blue-600 hover:bg-blue-500/10"
                                >
                                    <Twitter className="h-4 w-4" />
                                    Twitter
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleShare("linkedin")}
                                    className="flex items-center gap-2 h-12 bg-blue-600/5 border-blue-600/20 text-blue-700 hover:bg-blue-600/10"
                                >
                                    <Linkedin className="h-4 w-4" />
                                    LinkedIn
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => handleShare("copy")}
                                className="w-full flex items-center gap-2 h-12 bg-purple-500/5 border-purple-500/20 text-purple-600 hover:bg-purple-500/10"
                            >
                                <Copy className="h-4 w-4" />
                                Copy Link
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
} 