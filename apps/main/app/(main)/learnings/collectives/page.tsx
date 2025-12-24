"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Users2, ChevronRight, Loader2, Calendar, MessageSquare,
    Crown, Shield, User
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { 
    Avatar, AvatarFallback, AvatarImage 
} from "@repo/ui/components/ui/avatar";
import { getCommunityLearnings } from "@/actions/(main)/learnings/learnings.action";
import { cn } from "@repo/ui/lib/utils";

const roleStyles = {
    ADMIN: { icon: Crown, color: "text-amber-500", label: "Admin" },
    MODERATOR: { icon: Shield, color: "text-blue-500", label: "Moderator" },
    MEMBER: { icon: User, color: "text-neutral-500", label: "Member" },
};

export default function CollectivesLearningsPage() {
    const [communities, setCommunities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const result = await getCommunityLearnings();
                if (result.success && result.data) {
                    setCommunities(result.data);
                }
            } catch (error) {
                console.error("Error loading communities:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <section className="border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-neutral-950">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                <Users2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    My Collectives
                                </h1>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {communities.length} communities you&apos;ve joined
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8 pb-24 lg:pb-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                    </div>
                ) : communities.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <Users2 className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                            No communities yet
                        </h3>
                        <p className="text-neutral-500 mb-6">
                            Join communities to connect with other learners
                        </p>
                        <Button asChild>
                            <Link href="/communities/discover">
                                Discover Communities
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {communities.map((community, index) => {
                                const roleConfig = roleStyles[community.role as keyof typeof roleStyles] || roleStyles.MEMBER;
                                const RoleIcon = roleConfig.icon;
                                
                                return (
                                    <motion.div
                                        key={community.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link href={`/communities/${community.slug}`}>
                                            <div className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg">
                                                {/* Banner */}
                                                <div className="relative h-24 bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                                                    {community.banner && (
                                                        <Image
                                                            src={community.banner}
                                                            alt={community.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-5 pt-0 relative">
                                                    {/* Icon */}
                                                    <div className="relative -mt-8 mb-3">
                                                        <Avatar className="h-16 w-16 border-4 border-white dark:border-neutral-900">
                                                            <AvatarImage src={community.icon} />
                                                            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xl font-bold">
                                                                {community.name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>

                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                                                            {community.name}
                                                        </h3>
                                                        <Badge
                                                            variant="secondary"
                                                            className={cn("text-xs rounded-full shrink-0", roleConfig.color)}
                                                        >
                                                            <RoleIcon className="h-3 w-3 mr-1" />
                                                            {roleConfig.label}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
                                                        {community.description}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                        <span className="flex items-center gap-1">
                                                            <Users2 className="h-3.5 w-3.5" />
                                                            {community.memberCount} members
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="h-3.5 w-3.5" />
                                                            {community.postCount} posts
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-xs text-neutral-400">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>
                                                            Joined {new Date(community.joinedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
