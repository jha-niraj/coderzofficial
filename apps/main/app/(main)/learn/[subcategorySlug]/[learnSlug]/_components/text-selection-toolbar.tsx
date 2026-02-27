'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Copy, BookOpen, Code2, AlertTriangle
} from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { cn } from '@repo/ui/lib/utils';

interface TextSelectionToolbarProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    onAskAI: (text: string, prompt?: string) => void;
    onCopy: (text: string) => void;
}

export function TextSelectionToolbar({ containerRef, onAskAI, onCopy }: TextSelectionToolbarProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [selectedText, setSelectedText] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const handleSelection = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !containerRef.current) {
            setIsVisible(false);
            setShowOptions(false);
            return;
        }

        const text = selection.toString().trim();
        if (text.length < 3) {
            setIsVisible(false);
            setShowOptions(false);
            return;
        }

        // Check if selection is within our container
        const range = selection.getRangeAt(0);
        if (!containerRef.current.contains(range.commonAncestorContainer)) {
            setIsVisible(false);
            setShowOptions(false);
            return;
        }

        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        setSelectedText(text);
        setPosition({
            top: rect.top - containerRect.top - 50,
            left: rect.left - containerRect.left + rect.width / 2,
        });
        setIsVisible(true);
    }, [containerRef]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseUp = () => {
            setTimeout(handleSelection, 10);
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) return;
            setShowOptions(false);
        };

        container.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            container.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [containerRef, handleSelection]);

    const handleCopy = () => {
        navigator.clipboard.writeText(selectedText);
        onCopy(selectedText);
        setIsVisible(false);
        window.getSelection()?.removeAllRanges();
    };

    const handleAskAI = (prompt?: string) => {
        onAskAI(selectedText, prompt);
        setIsVisible(false);
        setShowOptions(false);
        window.getSelection()?.removeAllRanges();
    };

    const aiOptions = [
        { label: 'Explain this', icon: BookOpen, prompt: `Explain this in detail: "${selectedText}"` },
        { label: 'Give me an example', icon: Code2, prompt: `Give me a practical code example for: "${selectedText}"` },
        { label: 'Common mistakes', icon: AlertTriangle, prompt: `What are common mistakes related to: "${selectedText}"` },
    ];

    return (
        <AnimatePresence>
            {
                isVisible && (
                    <motion.div
                        ref={toolbarRef}
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50"
                        style={{
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg shadow-xl border border-neutral-700 dark:border-neutral-300 overflow-hidden">
                            <div className="flex items-center gap-0.5 p-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-3 text-xs text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 gap-1.5"
                                    onClick={() => setShowOptions(!showOptions)}
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                    Ask AI
                                </Button>
                                <div className="w-px h-5 bg-neutral-700 dark:bg-neutral-300" />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-3 text-xs text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 gap-1.5"
                                    onClick={handleCopy}
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy
                                </Button>
                            </div>
                            <AnimatePresence>
                                {
                                    showOptions && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="overflow-hidden border-t border-neutral-700 dark:border-neutral-300"
                                        >
                                            <div className="p-1 space-y-0.5">
                                                {
                                                    aiOptions.map((option) => (
                                                        <button
                                                            key={option.label}
                                                            onClick={() => handleAskAI(option.prompt)}
                                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-left"
                                                        >
                                                            <option.icon className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                                                            {option.label}
                                                        </button>
                                                    ))
                                                }
                                                <button
                                                    onClick={() => handleAskAI()}
                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-left text-yellow-400 dark:text-yellow-600"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                                    Ask anything about this...
                                                </button>
                                            </div>
                                        </motion.div>
                                    )
                                }
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )
            }
        </AnimatePresence>
    );
}