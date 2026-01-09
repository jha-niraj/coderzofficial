"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@repo/ui/components/ui/input';
import { Button } from '@repo/ui/components/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select';
import {
    Search, SlidersHorizontal, X
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'latest', label: 'Latest' },
    { value: 'members', label: 'Most Members' },
    { value: 'views', label: 'Most Viewed' },
];

export default function SearchAndFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [showFilters, setShowFilters] = useState(false);

    const currentSort = searchParams.get('sort') || 'popular';

    // Debounce the search value (not a function)
    const debouncedSearchValue = useDebounce(search, 400);

    // Effect to update URL when debounced value changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearchValue) {
            params.set('search', debouncedSearchValue);
        } else {
            params.delete('search');
        }
        
        // Only update if the value actually changed from what's in the URL
        const currentSearch = searchParams.get('search') || '';
        if (debouncedSearchValue !== currentSearch) {
            params.delete('page'); // Reset page on filter change
            router.push(`?${params.toString()}`);
        }
    }, [debouncedSearchValue, router, searchParams]);

    const updateSearchParams = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page'); // Reset page on filter change
        router.push(`?${params.toString()}`);
    }, [router, searchParams]);

    const clearSearch = () => {
        setSearch('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
        >
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <Input
                        placeholder="Search spaces by title, description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 pr-10 h-12 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-base"
                    />
                    {
                        search && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )
                    }
                </div>
                <Select
                    value={currentSort}
                    onValueChange={(value) => updateSearchParams('sort', value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            sortOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-12 rounded-xl ${showFilters ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
                >
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    Filters
                </Button>
            </div>
            {
                showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
                    >
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            More filters coming soon...
                        </p>
                    </motion.div>
                )
            }
        </motion.div>
    );
}