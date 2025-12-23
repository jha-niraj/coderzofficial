'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
}
interface CommandItem {
    id: string
    label: string
    section: string
    icon?: React.ReactNode
    href?: string
}

const items: CommandItem[] = [
    { id: 'react', label: 'React.js', section: 'Frameworks' },
    { id: 'vue', label: 'Vue.js', section: 'Frameworks' },
    { id: 'angular', label: 'Angular', section: 'Frameworks' },
    { id: 'typescript', label: 'TypeScript', section: 'Languages' },
    { id: 'javascript', label: 'JavaScript', section: 'Languages' },
    { id: 'python', label: 'Python', section: 'Languages' },
];
export function SearchPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const paletteRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowDown')
                setSelectedIndex(i => (i + 1) % items.length)
            if (e.key === 'ArrowUp')
                setSelectedIndex(i => (i - 1 + items.length) % items.length)
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus()
        }
    }, [isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    const handleSearchQuery = (e: React.FormEvent) => {
        e.preventDefault();
        if (query === "") {
            return;
        }
        if (query.trim()) {
            router.push(`/search?tab=all&query=${encodeURIComponent(query)}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    const filteredItems = query
        ? items.filter(item =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.section.toLowerCase().includes(query.toLowerCase())
        )
        : items

    let currentSection = '';

    return (
        <AnimatePresence>
            {
                isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
                    >
                        <motion.div
                            ref={paletteRef}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="w-full max-w-[640px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                                <form onSubmit={handleSearchQuery} className="flex items-center w-full">
                                    <Search className="w-5 h-5 text-gray-400" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="flex-1 bg-transparent border-0 h-14 px-4 text-lg text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none font-medium"
                                        placeholder="Type to search..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </form>
                                <button
                                    onClick={() => onClose()}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="max-h-[calc(85vh-4rem)] overflow-auto">
                                {
                                    filteredItems.map((item, index) => {
                                        const isNewSection = currentSection !== item.section
                                        if (isNewSection) {
                                            currentSection = item.section
                                            return (
                                                <div key={item.id}>
                                                    <div className="px-4 py-2 text-sm text-gray-500 font-medium">
                                                        {item.section}
                                                    </div>
                                                    <CommandItem item={item} isSelected={selectedIndex === index} />
                                                </div>
                                            )
                                        }
                                        return (
                                            <CommandItem key={item.id} item={item} isSelected={selectedIndex === index} />
                                        )
                                    })
                                }
                            </div>
                        </motion.div>
                    </motion.div>
                )
            }
        </AnimatePresence>
    )
}

function CommandItem({ item, isSelected }: { item: CommandItem; isSelected: boolean }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center px-4 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        >
            <div className="flex items-center w-full">
                <span className="mr-4 p-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300">
                    {item.icon}
                </span>
                {item.label}
            </div>
        </motion.button>
    )
}