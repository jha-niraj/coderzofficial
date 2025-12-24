"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Send, X, Sparkles, Wand2, Terminal, Cpu, Zap
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { chatWithAI } from "@/actions/tools/ai.action"
import { cn } from "@repo/ui/lib/utils"
import { useSidebar } from "@/components/common/mainsidebar"

export function AIChat() {
    const { isAISidebarOpen, setIsAISidebarOpen, setIsCollapsed } = useSidebar()
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
        { role: "assistant", content: "👋 Hey there! I'm CoderzHQ AI - your learning companion. Ask me anything about the platform, projects, challenges, or how to get started!" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showSlashMenu, setShowSlashMenu] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const tools = [
        { name: "Projects Guide", icon: <Terminal className="h-4 w-4" />, command: "Tell me about the Projects Hub" },
        { name: "Challenges Info", icon: <Wand2 className="h-4 w-4" />, command: "How do Forge and Crucible challenges work?" },
        { name: "Getting Started", icon: <Sparkles className="h-4 w-4" />, command: "I'm new, where should I start?" },
    ]

    const sampleQuestions = [
        "How do I enroll in a project?",
        "What are credits used for?",
        "How does the XP system work?",
        "Tell me about mock interviews",
    ]

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput("")
        setShowSlashMenu(false)
        setMessages(prev => [...prev, { role: "user", content: userMessage }])
        setIsLoading(true)

        try {
            const result = await chatWithAI([...messages, { role: "user", content: userMessage }])
            if (result.success && result.message?.content) {
                setMessages(prev => [...prev, { role: "assistant", content: result.message!.content! }])
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: "ERROR_CODE_0x1: Failed to process request." }])
            }
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Oops! Something went wrong. Please try again." }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setInput(val)
        if (val === "/") {
            setShowSlashMenu(true)
        } else {
            setShowSlashMenu(false)
        }
    }

    const applyCommand = (command: string) => {
        setInput(command + " ")
        setShowSlashMenu(false)
    }

    const toggleAI = () => {
        const newState = !isAISidebarOpen
        setIsAISidebarOpen(newState)
        if (newState) {
            // When opening AI chat, collapse main sidebar
            setIsCollapsed(true)
        } else {
            // When closing AI chat, expand main sidebar
            setIsCollapsed(false)
        }
    }

    return (
        <>
            <div className="fixed bottom-6 right-6 z-[60]">
                <Button
                    onClick={toggleAI}
                    className={cn(
                        "h-14 w-14 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all duration-500 group overflow-hidden",
                        isAISidebarOpen
                            ? "bg-black text-white hover:bg-neutral-900 border border-neutral-800"
                            : "bg-white text-black hover:bg-neutral-50 border border-neutral-200"
                    )}
                >
                    <div className="relative flex items-center justify-center w-full h-full">
                        <AnimatePresence mode="wait">
                            {
                                isAISidebarOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ opacity: 0, rotate: -90 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 90 }}
                                    >
                                        <X className="h-6 w-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="bot"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.5 }}
                                        className="flex flex-col items-center"
                                    >
                                        <Cpu className="h-6 w-6" />
                                        <span className="text-[8px] mt-0.5 font-mono font-bold tracking-tighter">ASK AI</span>
                                    </motion.div>
                                )
                            }
                        </AnimatePresence>
                        {
                            !isAISidebarOpen && (
                                <div className="absolute inset-0 rounded-full border border-black/20 animate-ping opacity-20" />
                            )
                        }
                    </div>
                </Button>
            </div>
            <aside
                className={cn(
                    "fixed top-0 right-0 h-screen w-[400px] bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 z-[55] transition-transform duration-500 ease-in-out flex flex-col shadow-2xl",
                    isAISidebarOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">AI Assistant: Online</span>
                        </div>
                        <Sparkles className="h-4 w-4 text-neutral-400" />
                    </div>
                    <h2 className="text-xl font-black tracking-tighter flex items-center gap-2">
                        CoderzHQ AI
                        <Zap className="h-4 w-4 fill-black dark:fill-white" />
                    </h2>
                </div>
                <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
                    <div className="space-y-6">
                        {
                            messages.length === 1 && (
                                <div className="mb-6 space-y-3">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Popular questions:</p>
                                    <div className="grid gap-2">
                                        {
                                            sampleQuestions.map((question, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setInput(question)
                                                        setTimeout(() => handleSend(), 100)
                                                    }}
                                                    className="text-left text-xs p-3 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
                                                >
                                                    {question}
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            )
                        }
                        {
                            messages.map((m, i) => (
                                <div key={i} className={cn(
                                    "flex flex-col gap-2",
                                    m.role === "user" ? "items-end" : "items-start"
                                )}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                                            {m.role === "user" ? "You" : "CoderzHQ AI"}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-3 text-sm max-w-[90%] leading-relaxed",
                                        m.role === "user"
                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl rounded-tr-none font-medium"
                                            : "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-2xl rounded-tl-none border border-neutral-200 dark:border-neutral-800"
                                    )}>
                                        {m.content}
                                    </div>
                                </div>
                            ))
                        }
                        {
                            isLoading && (
                                <div className="flex items-center gap-3 text-neutral-400">
                                    <Cpu className="h-4 w-4 animate-spin" />
                                    <span className="text-[10px] font-mono tracking-widest animate-pulse uppercase">Thinking...</span>
                                </div>
                            )
                        }
                    </div>
                </ScrollArea>
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-sm relative">
                    <AnimatePresence>
                        {
                            showSlashMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-full left-6 right-6 mb-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-20"
                                >
                                    <div className="p-2 border-b border-neutral-100 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900">
                                        <span className="text-[9px] font-mono font-bold text-neutral-400 tracking-widest uppercase px-2">Quick Commands</span>
                                    </div>
                                    <div className="p-1">
                                        {
                                            tools.map((tool) => (
                                                <button
                                                    key={tool.command}
                                                    onClick={() => applyCommand(tool.command)}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-sm transition-all group text-left"
                                                >
                                                    <div className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md group-hover:bg-black group-hover:text-white transition-colors">
                                                        {tool.icon}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-xs tracking-tight">{tool.name}</span>
                                                        <span className="text-[10px] text-neutral-400 font-mono italic">{tool.command}</span>
                                                    </div>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </motion.div>
                            )
                        }
                    </AnimatePresence>
                    <div className="flex gap-2 relative">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Ask me anything about the platform..."
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSend()
                                    if (e.key === "Escape") setShowSlashMenu(false)
                                }}
                                className="h-12 bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 focus-visible:ring-black dark:focus-visible:ring-white rounded-xl pl-4 pr-10 text-sm"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-30">
                                <span className="text-[8px] font-mono border border-neutral-400 rounded px-1">ENTER</span>
                            </div>
                        </div>
                        <Button
                            size="icon"
                            className="h-12 w-12 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    )
}