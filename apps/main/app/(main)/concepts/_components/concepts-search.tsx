"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Search, Sparkles
} from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const popularSearches = [
    "React hooks",
    "TypeScript basics",
    "REST API",
    "SQL joins",
    "Git workflow",
    "Docker containers",
    "System design",
    "Data structures",
];

export default function ConceptsSearch() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/concepts/browse?search=${encodeURIComponent(query.trim())}`);
        }
    };

    const handlePopularSearch = (term: string) => {
        router.push(`/concepts/browse?search=${encodeURIComponent(term)}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <Card className="p-4 shadow-xl bg-white dark:bg-neutral-900 border-0">
                <form onSubmit={handleSearch} className="relative">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search concepts... (e.g., React hooks, SQL joins, System design)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                className="pl-12 h-14 text-lg border-neutral-200 dark:border-neutral-800 rounded-xl"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            className="h-14 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            <Search className="w-5 h-5 mr-2" />
                            Search
                        </Button>
                    </div>
                </form>
                <AnimatePresence>
                    {
                        isFocused && !query && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800"
                            >
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Popular searches</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {
                                        popularSearches.map((term) => (
                                            <button
                                                key={term}
                                                type="button"
                                                onClick={() => handlePopularSearch(term)}
                                                className="px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
                                            >
                                                {term}
                                            </button>
                                        ))
                                    }
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}