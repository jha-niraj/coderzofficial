'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PenLine, Sparkles, Send, X, Plus, Loader2, FileText, 
    MessageSquare, Lightbulb, HelpCircle, BookOpen
} from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { ScrollArea } from '@repo/ui/components/ui/scroll-area';
import { Badge } from '@repo/ui/components/ui/badge';
import { 
    Tabs, TabsContent, TabsList, TabsTrigger 
} from '@repo/ui/components/ui/tabs';
import { cn } from '@repo/ui/lib/utils';
import { askLearnAssistant } from '@/actions/(main)/learn/learn-ai.action';
import ReactMarkdown from 'react-markdown';

interface StudioPanelProps {
    learnTitle: string;
    learnDescription: string;
    currentStep: {
        id: string;
        title: string;
        content: string;
        type: string;
    };
    studioId: string | null;
    onCreateStudio: () => void;
    onClose: () => void;
    externalMessage?: string | null;
    onExternalMessageConsumed?: () => void;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function StudioPanel({
    learnTitle,
    learnDescription,
    currentStep,
    studioId,
    onCreateStudio,
    onClose,
    externalMessage,
    onExternalMessageConsumed,
}: StudioPanelProps) {
    const [activeTab, setActiveTab] = useState<string>('notes');
    const [notes, setNotes] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const notesRef = useRef<HTMLTextAreaElement>(null);

    // Handle external message from text selection
    useEffect(() => {
        if (externalMessage) {
            setActiveTab('chat');
            setChatInput(externalMessage);
            onExternalMessageConsumed?.();
            // Auto-send the message
            handleSendMessage(externalMessage);
        }
    }, [externalMessage]);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendMessage = async (messageOverride?: string) => {
        const message = messageOverride || chatInput.trim();
        if (!message || isSending) return;

        const userMsg: ChatMessage = { role: 'user', content: message, timestamp: new Date() };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsSending(true);

        try {
            const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
            const result = await askLearnAssistant(
                learnTitle,
                learnDescription,
                currentStep.title,
                currentStep.content,
                message,
                history,
            );

            if (result.answer) {
                setChatMessages(prev => [...prev, {
                    role: 'assistant',
                    content: result.answer!,
                    timestamp: new Date(),
                }]);
            } else {
                setChatMessages(prev => [...prev, {
                    role: 'assistant',
                    content: result.error || 'Sorry, I could not process that request.',
                    timestamp: new Date(),
                }]);
            }
        } catch {
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, there was an error. Please try again.',
                timestamp: new Date(),
            }]);
        } finally {
            setIsSending(false);
        }
    };

    const quickPrompts = [
        { label: 'Explain this step', icon: BookOpen, prompt: `Explain the concept of "${currentStep.title}" in simpler terms.` },
        { label: 'Generate quiz', icon: HelpCircle, prompt: `Generate 3 practice quiz questions about "${currentStep.title}" with answers.` },
        { label: 'Give examples', icon: Lightbulb, prompt: `Give me 3 practical code examples for "${currentStep.title}".` },
    ];

    // If no studio exists, show creation prompt
    if (!studioId) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                    <PenLine className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Study Notes</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
                    Create your personal study notes for this topic. Ask AI questions, generate quizzes, and more.
                </p>
                <Button
                    onClick={onCreateStudio}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Study Notes
                </Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                    <PenLine className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold">Studio</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="mx-4 mt-2 h-9 bg-neutral-100 dark:bg-neutral-800/50">
                    <TabsTrigger value="notes" className="text-xs gap-1.5 flex-1">
                        <FileText className="w-3.5 h-3.5" />
                        Notes
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="text-xs gap-1.5 flex-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        AI Chat
                    </TabsTrigger>
                </TabsList>

                {/* Notes Tab */}
                <TabsContent value="notes" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
                    <div className="flex-1 p-4 overflow-auto">
                        <Textarea
                            ref={notesRef}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Write your notes here... &#10;&#10;• Key concepts&#10;• Questions to revisit&#10;• Code snippets to remember"
                            className="min-h-[300px] text-sm border-none shadow-none resize-none focus-visible:ring-0 p-0 bg-transparent"
                        />
                    </div>
                    <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
                        <p className="text-[10px] text-muted-foreground text-center">
                            Notes are saved locally • Your personal study space
                        </p>
                    </div>
                </TabsContent>

                {/* AI Chat Tab */}
                <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {chatMessages.length === 0 && (
                                <div className="text-center py-8">
                                    <Sparkles className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                                    <p className="text-sm font-medium mb-1">AI Study Assistant</p>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Ask me anything about &quot;{currentStep.title}&quot;
                                    </p>
                                    <div className="space-y-2">
                                        {quickPrompts.map((qp) => (
                                            <button
                                                key={qp.label}
                                                onClick={() => {
                                                    setChatInput(qp.prompt);
                                                    handleSendMessage(qp.prompt);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                                            >
                                                <qp.icon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                                {qp.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={cn("flex gap-2", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                        "max-w-[90%] rounded-xl px-3 py-2 text-sm",
                                        msg.role === 'user'
                                            ? "bg-blue-600 text-white rounded-br-sm"
                                            : "bg-neutral-100 dark:bg-neutral-800 rounded-bl-sm"
                                    )}>
                                        {msg.role === 'assistant' ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-pre:my-2">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p>{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isSending && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Thinking...</span>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Chat Input */}
                    <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-end gap-2">
                            <Textarea
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask about this topic..."
                                className="min-h-[36px] max-h-[100px] text-sm resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <Button
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                onClick={() => handleSendMessage()}
                                disabled={!chatInput.trim() || isSending}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
