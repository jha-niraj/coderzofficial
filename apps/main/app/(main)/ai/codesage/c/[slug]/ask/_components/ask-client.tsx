"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Send, Plus, MessageSquare, Sparkles, User, Bot,
    ChevronRight, Trash2, FileCode2, PanelRight, PanelRightClose, X
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Badge } from "@repo/ui/components/ui/badge"
import { cn } from "@repo/ui/lib/utils"
import toast from "@repo/ui/components/ui/sonner"
import { MarkdownRenderer } from "@/components/common/markdown-renderer"
import { createAskSession, saveAskSession, deleteAskSession, getAskSession, getCodebaseFileContent } from "@/actions/(main)/ai/codesage/project.action"
import { FileTree } from "./file-tree"
import { DotmSquare11 } from "@repo/ui/components/ui/dotm-square-11"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    citations?: string[]
    createdAt: number
}

interface Session {
    id: string
    title: string | null
    updatedAt: Date
}

interface FileInfo {
    id: string
    filePath: string
    fileName: string
    extension: string
    lineCount: number
    language: string | null
}

// Extract cited file paths from markdown response
function extractCitations(content: string): string[] {
    const matches = content.matchAll(/`([^`]+\.(tsx?|jsx?|py|go|prisma|graphql|sql))[:#]?\d*`/g)
    return [...new Set([...matches].map(m => m[1]!))]
}


const SUGGESTED_QUESTIONS = [
    "How does authentication work in this project?",
    "Walk me through the database schema",
    "What are the main API endpoints?",
    "How is state management handled?",
    "Explain the folder structure",
]

export function AskClient({
    projectSlug,
    projectName,
    files,
    sessions: initialSessions,
    initialSessionId,
    fileTree,
}: {
    projectSlug: string
    projectName: string
    files: FileInfo[]
    sessions: Session[]
    initialSessionId: string | null
    fileTree: Record<string, unknown> | null
}) {
    const _router = useRouter()
    const [sessions, setSessions] = useState<Session[]>(initialSessions)
    const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isStreaming, setIsStreaming] = useState(false)
    const [pinnedFiles, setPinnedFiles] = useState<string[]>([])
    const [citedFiles, setCitedFiles] = useState<string[]>([])
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [fileContent, setFileContent] = useState<string | null>(null)
    const [fileContentLoading, setFileContentLoading] = useState(false)
    const [showTree, setShowTree] = useState(true)
    const [showFilePanel, setShowFilePanel] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Load session messages on mount
    useEffect(() => {
        if (!activeSessionId) return
        getAskSession(activeSessionId).then(res => {
            if (res.success && res.session) {
                setMessages((res.session.messages as unknown as Message[]) ?? [])
            }
        })
    }, [activeSessionId])

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Update cited files from all AI messages
    useEffect(() => {
        const allCited = messages
            .filter(m => m.role === "assistant")
            .flatMap(m => extractCitations(m.content))
        setCitedFiles([...new Set(allCited)])
    }, [messages])

    const handleFileSelect = async (path: string) => {
        if (selectedFile === path) {
            setSelectedFile(null)
            setFileContent(null)
            setShowFilePanel(false)
            return
        }
        setSelectedFile(path)
        setShowFilePanel(true)
        setFileContentLoading(true)
        const res = await getCodebaseFileContent(projectSlug, path)
        setFileContentLoading(false)
        if (res.success) setFileContent(res.content ?? null)
        else toast.error("Could not load file content")
    }

    const handlePinToggle = useCallback((path: string) => {
        setPinnedFiles(prev =>
            prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
        )
    }, [])

    const handleSend = async (text?: string) => {
        const message = (text ?? input).trim()
        if (!message || isStreaming || !activeSessionId) return

        setInput("")

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            role: "user",
            content: message,
            createdAt: Date.now(),
        }
        const assistantMsg: Message = {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: "",
            createdAt: Date.now(),
        }

        const updatedMessages = [...messages, userMsg, assistantMsg]
        setMessages(updatedMessages)
        setIsStreaming(true)

        try {
            const response = await fetch("/api/codesage/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectSlug,
                    sessionId: activeSessionId,
                    message,
                    pinnedFiles,
                }),
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            if (!response.body) throw new Error("No response body")

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let fullContent = ""

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                fullContent += decoder.decode(value, { stream: true })
                setMessages(prev =>
                    prev.map(m => m.id === assistantMsg.id ? { ...m, content: fullContent } : m)
                )
            }

            const finalMessages = updatedMessages.map(m =>
                m.id === assistantMsg.id ? { ...m, content: fullContent } : m
            )

            // Auto-title session from first message
            const isFirstMessage = messages.length === 0
            const sessionTitle = isFirstMessage ? message.slice(0, 60) : undefined

            await saveAskSession(activeSessionId, finalMessages, sessionTitle)

            if (isFirstMessage) {
                setSessions(prev =>
                    prev.map(s => s.id === activeSessionId ? { ...s, title: sessionTitle ?? s.title } : s)
                )
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Request failed"
            setMessages(prev =>
                prev.map(m => m.id === assistantMsg.id
                    ? { ...m, content: `> **Error:** ${errMsg}` }
                    : m
                )
            )
            toast.error(errMsg)
        } finally {
            setIsStreaming(false)
        }
    }

    const handleNewSession = async () => {
        const res = await createAskSession(projectSlug)
        if (!res.success || !res.sessionId) return toast.error("Failed to create session")
        const newSession: Session = { id: res.sessionId, title: null, updatedAt: new Date() }
        setSessions(prev => [newSession, ...prev])
        setActiveSessionId(res.sessionId)
        setMessages([])
        setCitedFiles([])
    }

    const handleDeleteSession = async (id: string) => {
        await deleteAskSession(id)
        setSessions(prev => prev.filter(s => s.id !== id))
        if (activeSessionId === id) {
            const next = sessions.find(s => s.id !== id)
            if (next) {
                setActiveSessionId(next.id)
                getAskSession(next.id).then(res => {
                    if (res.success) setMessages((res.session?.messages as unknown as Message[]) ?? [])
                })
            } else {
                handleNewSession()
            }
        }
    }

    const handleSessionSwitch = async (id: string) => {
        if (id === activeSessionId) return
        setActiveSessionId(id)
        const res = await getAskSession(id)
        if (res.success) setMessages((res.session?.messages as unknown as Message[]) ?? [])
    }

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden">
            {/* Session sidebar */}
            <div className="hidden lg:flex flex-col w-56 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
                <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start gap-2 h-8 text-xs"
                        onClick={handleNewSession}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Chat
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sessions.map(s => (
                        <div
                            key={s.id}
                            onClick={() => handleSessionSwitch(s.id)}
                            className={cn(
                                "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors",
                                activeSessionId === s.id
                                    ? "bg-neutral-200 dark:bg-neutral-800"
                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                            )}
                        >
                            <MessageSquare className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate flex-1">
                                {s.title ?? "New chat"}
                            </span>
                            <button
                                onClick={e => { e.stopPropagation(); handleDeleteSession(s.id) }}
                                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat header */}
                <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-500" />
                        <span className="text-sm font-semibold text-neutral-800 dark:text-white">Ask</span>
                        <span className="text-xs text-neutral-400">· {projectName}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => setShowTree(t => !t)}
                    >
                        {showTree ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
                        Files
                    </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center py-10"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                                <MessageSquare className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                            </div>
                            <h3 className="text-base font-semibold text-neutral-800 dark:text-white mb-1">
                                Ask anything about {projectName}
                            </h3>
                            <p className="text-sm text-neutral-500 max-w-sm mb-6">
                                Get answers with exact file and line references from your codebase.
                            </p>
                            <div className="flex flex-col gap-2 w-full max-w-md">
                                {SUGGESTED_QUESTIONS.map(q => (
                                    <button
                                        key={q}
                                        onClick={() => handleSend(q)}
                                        className="text-sm text-left px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors text-neutral-700 dark:text-neutral-300 flex items-center gap-2 group"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-violet-500 transition-colors shrink-0" />
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            <AnimatePresence>
                                {messages.map(msg => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                                <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                            </div>
                                        )}

                                        <div className={cn(
                                            "max-w-[85%] rounded-2xl",
                                            msg.role === "user"
                                                ? "bg-neutral-900 dark:bg-white text-white dark:text-black px-4 py-2.5 text-sm"
                                                : "bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 py-3 prose prose-sm dark:prose-invert max-w-none"
                                        )}>
                                            {msg.role === "user" ? (
                                                msg.content
                                            ) : msg.content ? (
                                                <MarkdownRenderer content={msg.content} />
                                            ) : (
                                                <div className="flex items-center gap-2 py-1">
                                                    <DotmSquare11 size={20} dotSize={3} speed={1.4} />
                                                    <span className="text-xs text-neutral-500">Thinking…</span>
                                                </div>
                                            )}
                                        </div>

                                        {msg.role === "user" && (
                                            <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                                                <User className="w-4 h-4 text-neutral-500" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input */}
                <div className="shrink-0 px-4 pb-4 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    {pinnedFiles.length > 0 && (
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs text-neutral-500">Context:</span>
                            {pinnedFiles.map(p => (
                                <Badge
                                    key={p}
                                    variant="secondary"
                                    className="text-[10px] gap-1 pr-1 cursor-pointer"
                                    onClick={() => handlePinToggle(p)}
                                >
                                    {p.split("/").slice(-1)[0]}
                                    <X className="w-2.5 h-2.5" />
                                </Badge>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2 items-end">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            placeholder="Ask about your codebase… (Enter to send, Shift+Enter for new line)"
                            className="flex-1 resize-none min-h-[44px] max-h-32 text-sm"
                            rows={1}
                            disabled={isStreaming}
                        />
                        <Button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isStreaming}
                            className="h-11 w-11 p-0 rounded-xl bg-neutral-900 dark:bg-white dark:text-black hover:opacity-90 shrink-0"
                        >
                            {isStreaming ? <DotmSquare11 size={16} dotSize={2.5} speed={1.4} /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* File tree sidebar */}
            <AnimatePresence>
                {showTree && fileTree && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 260, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shrink-0 hidden lg:flex flex-col"
                    >
                        <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Files</span>
                            <span className="text-[10px] text-neutral-400">{files.length} files</span>
                        </div>
                        <FileTree
                            tree={fileTree as Parameters<typeof FileTree>[0]["tree"]}
                            pinnedFiles={pinnedFiles}
                            citedFiles={citedFiles}
                            onPinToggle={handlePinToggle}
                            onFileSelect={handleFileSelect}
                            selectedFile={selectedFile}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File content panel */}
            <AnimatePresence>
                {showFilePanel && selectedFile && (
                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 flex flex-col"
                    >
                        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileCode2 className="w-4 h-4 text-neutral-500 shrink-0" />
                                <code className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{selectedFile}</code>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowFilePanel(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            {fileContentLoading ? (
                                <div className="flex items-center justify-center h-40 gap-2">
                                    <DotmSquare11 size={28} dotSize={4} speed={1.4} />
                                </div>
                            ) : (
                                <pre className="text-xs font-mono text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                                    {fileContent ?? "File content unavailable"}
                                </pre>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
