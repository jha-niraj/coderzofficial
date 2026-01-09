"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SortAsc } from 'lucide-react';
import { Input } from '@repo/ui/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select';

export default function SearchFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleSearch = (value: string) => {
        setSearchValue(value);
        // Debounce the search
        const timeoutId = setTimeout(() => {
            router.push(pathname + '?' + createQueryString('search', value));
        }, 300);
        return () => clearTimeout(timeoutId);
    };

    const handleSortChange = (value: string) => {
        router.push(pathname + '?' + createQueryString('sortBy', value));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
        >
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                    placeholder="Search public studios..."
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Select
                value={searchParams.get('sortBy') || 'popular'}
                onValueChange={handleSortChange}
            >
                <SelectTrigger className="w-[150px]">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                    <SelectItem value="likes">Most Liked</SelectItem>
                </SelectContent>
            </Select>
        </motion.div>
    );
}


