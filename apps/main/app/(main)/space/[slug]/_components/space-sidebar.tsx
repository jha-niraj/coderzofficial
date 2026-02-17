"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { ScrollArea } from '@repo/ui/components/ui/scroll-area';
import {
    Tabs, TabsContent, TabsList, TabsTrigger,
} from '@repo/ui/components/ui/tabs';
import {
    Send, Bot, Brain, Layers, Loader2, Sparkles, ChevronLeft
} from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { useSpaceStore } from '@/app/store/spaceStore';
import Quiz, { type QuizQuestion, type QuizResult } from '@/components/main/quiz';
import StudioFlashcardBlock from '@/components/studio/blocks/flashcard-block';
import { chatWithAI } from '@/actions/tools/ai.action';

interface SpaceSidebarProps {
    spaceTitle: string;
}

export default function SpaceSidebar({ spaceTitle }: SpaceSidebarProps) {
    const { sidebarMode, sidebarContent, openSidebar } = useSpaceStore();
    const [activeTab, setActiveTab] = useState<string>('ai');

    // Sync activeTab with sidebarMode from store
    useEffect(() => {
        if (sidebarMode === 'quiz') {
            setActiveTab('quiz');
        } else if (sidebarMode === 'flashcard') {
            setActiveTab('flashcard');
        } else {
            setActiveTab('ai');
        }
    }, [sidebarMode]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === 'ai') {
            openSidebar('ai');
        } else if (value === 'quiz') {
            openSidebar('quiz', sidebarContent || undefined);
        } else if (value === 'flashcard') {
            openSidebar('flashcard', sidebarContent || undefined);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-neutral-950 overflow-hidden">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full">
                {/* Tabs Header */}
                <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                    <TabsList className="w-full grid grid-cols-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg h-auto p-1">
                        <TabsTrigger
                            value="ai"
                            className="flex items-center gap-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 rounded-md transition-all"
                        >
                            <Bot className="w-4 h-4" />
                            <span className="text-xs font-medium">AI Chat</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="quiz"
                            className="flex items-center gap-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 rounded-md transition-all"
                        >
                            <Brain className="w-4 h-4" />
                            <span className="text-xs font-medium">Quiz</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="flashcard"
                            className="flex items-center gap-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 rounded-md transition-all"
                        >
                            <Layers className="w-4 h-4" />
                            <span className="text-xs font-medium">Cards</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Tab Contents */}
                <TabsContent value="ai" className="flex-1 flex flex-col m-0 overflow-hidden">
                    <AIChat spaceTitle={spaceTitle} />
                </TabsContent>

                <TabsContent value="quiz" className="flex-1 flex flex-col m-0 overflow-hidden">
                    {sidebarContent?.contentData && activeTab === 'quiz' ? (
                        <QuizView
                            stepTitle={(sidebarContent.title as string) || 'Quiz'}
                            contentData={sidebarContent.contentData}
                            onBackToAI={() => handleTabChange('ai')}
                        />
                    ) : (
                        <EmptyQuizState />
                    )}
                </TabsContent>

                <TabsContent value="flashcard" className="flex-1 flex flex-col m-0 overflow-hidden">
                    {sidebarContent?.contentData && activeTab === 'flashcard' ? (
                        <FlashcardView
                            stepTitle={(sidebarContent.title as string) || 'Flashcards'}
                            contentData={sidebarContent.contentData}
                            onBackToAI={() => handleTabChange('ai')}
                        />
                    ) : (
                        <EmptyFlashcardState />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Empty Quiz State
function EmptyQuizState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">
                No Quiz Selected
            </h3>
            <p className="text-neutral-500 text-sm max-w-xs">
                Click on a quiz step from the timeline to start answering questions here.
            </p>
        </div>
    );
}

// Empty Flashcard State
function EmptyFlashcardState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                <Layers className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">
                No Flashcards Selected
            </h3>
            <p className="text-neutral-500 text-sm max-w-xs">
                Click on a flashcard step from the timeline to start reviewing cards here.
            </p>
        </div>
    );
}

// AI Chat Component
function AIChat({
    spaceTitle,
}: {
    spaceTitle: string;
}) {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
        {
            role: 'assistant',
            content: `👋 Hey! I'm your AI assistant for "${spaceTitle}". Ask me anything about this learning space, the content, or any Learns you're learning!`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const contextMessage = `The user is in a learning space called "${spaceTitle}". Help them with their question about this space or related topics.`;

            const result = await chatWithAI([
                { role: 'assistant', content: contextMessage },
                ...messages,
                { role: 'user', content: userMessage }
            ]);

            if (result.success && result.message?.content) {
                setMessages(prev => [...prev, { role: 'assistant', content: result.message!.content! }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (error) {
            console.error('AI Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Something went wrong. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const sampleQuestions = [
        "What should I learn first?",
        "Explain the key Learns",
        "How long will this take?",
        "What are the prerequisites?",
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1">
                <div ref={scrollRef} className="p-4 space-y-4">
                    {messages.length === 1 && (
                        <div className="space-y-2 mb-4">
                            <p className="text-xs text-neutral-500 font-medium">Quick questions:</p>
                            <div className="grid gap-2">
                                {sampleQuestions.map((question, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setInput(question);
                                            setTimeout(() => handleSend(), 100);
                                        }}
                                        className="text-left text-xs p-3 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex flex-col gap-1",
                                m.role === 'user' ? "items-end" : "items-start"
                            )}
                        >
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                                {m.role === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                            <div className={cn(
                                "px-4 py-3 text-sm max-w-[90%] leading-relaxed rounded-2xl",
                                m.role === 'user'
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-tl-none border border-neutral-200 dark:border-neutral-800"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center gap-2 text-neutral-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs">Thinking...</span>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
                <div className="flex gap-2">
                    <Input
                        placeholder="Ask about this space..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="flex-1"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Quiz content data type
interface QuizContentData {
    questions?: Array<{
        id?: string;
        question: string;
        options: string[];
        correctAnswer: number;
        explanation?: string;
    }>;
    difficulty?: string;
}

// Quiz View Component
function QuizView({
    stepTitle,
    contentData,
    onBackToAI
}: {
    stepTitle: string;
    contentData: QuizContentData;
    onBackToAI: () => void;
}) {
    const [completed, setCompleted] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);

    // Parse quiz questions from contentData
    const getDifficulty = (difficulty?: string): "EASY" | "MEDIUM" | "INTERMEDIATE" | "HARD" | undefined => {
        if (!difficulty) return 'MEDIUM';
        const upper = difficulty.toUpperCase();
        if (upper === 'EASY' || upper === 'MEDIUM' || upper === 'INTERMEDIATE' || upper === 'HARD') {
            return upper;
        }
        return 'MEDIUM';
    };

    const questions: QuizQuestion[] = contentData?.questions?.map((q, idx: number) => ({
        id: q.id || `q-${idx}`,
        text: q.question,
        type: 'single' as const,
        options: q.options.map((opt: string, optIdx: number) => ({
            id: `opt-${idx}-${optIdx}`,
            text: opt,
            isCorrect: optIdx === q.correctAnswer
        })),
        explanation: q.explanation,
        difficulty: getDifficulty(contentData.difficulty),
    })) || [];

    const handleComplete = (quizResult: QuizResult) => {
        setResult(quizResult);
        setCompleted(true);
    };

    if (questions.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Brain className="w-16 h-16 text-neutral-300 mb-4" />
                <h3 className="font-bold text-lg mb-2">No Quiz Data</h3>
                <p className="text-neutral-500 text-sm mb-4">
                    Quiz questions could not be loaded.
                </p>
                <Button variant="outline" onClick={onBackToAI}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to AI Chat
                </Button>
            </div>
        );
    }

    if (completed && result) {
        return (
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                    <h3 className="font-bold text-neutral-900 dark:text-white truncate">
                        {stepTitle}
                    </h3>
                    <span className="text-xs text-neutral-500">Quiz Complete</span>
                </div>

                {/* Results */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6"
                    >
                        <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-xl font-bold mb-2">Quiz Complete!</h2>
                    <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-xs">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-green-500">{result.correctCount}</p>
                            <p className="text-[10px] text-neutral-500">Correct</p>
                        </div>
                        <div className="text-center p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                            <p className="text-2xl font-bold">{result.totalQuestions}</p>
                            <p className="text-[10px] text-neutral-500">Total</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-2xl font-bold text-blue-500">{result.scorePercentage}%</p>
                            <p className="text-[10px] text-neutral-500">Score</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setCompleted(false); setResult(null); }}>
                            Try Again
                        </Button>
                        <Button size="sm" onClick={onBackToAI}>
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                        <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                            {stepTitle}
                        </h3>
                        <span className="text-[10px] text-neutral-500">
                            {questions.length} questions
                        </span>
                    </div>
                </div>
            </div>

            {/* Quiz Content */}
            <ScrollArea className="flex-1">
                <div className="p-4">
                    <Quiz
                        quizId={`space-quiz-${Date.now()}`}
                        questions={questions}
                        title={stepTitle}
                        mode="practice"
                        immediateResults={true}
                        allowHints={true}
                        showProgress={true}
                        onComplete={handleComplete}
                    />
                </div>
            </ScrollArea>
        </div>
    );
}

// Flashcard content data type
interface FlashcardContentData {
    cards?: Array<{
        id?: string;
        front: string;
        back: string;
        hint?: string;
    }>;
}

// Flashcard View Component
function FlashcardView({
    stepTitle,
    contentData,
    onBackToAI
}: {
    stepTitle: string;
    contentData: FlashcardContentData;
    onBackToAI: () => void;
}) {
    // Parse flashcard data
    const deck = {
        id: `flashcard-${Date.now()}`,
        title: stepTitle,
        cards: contentData?.cards?.map((card, idx: number) => ({
            id: card.id || `card-${idx}`,
            front: card.front,
            back: card.back,
            hint: card.hint,
        })) || [],
    };

    if (deck.cards.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Layers className="w-16 h-16 text-neutral-300 mb-4" />
                <h3 className="font-bold text-lg mb-2">No Flashcard Data</h3>
                <p className="text-neutral-500 text-sm mb-4">
                    Flashcards could not be loaded.
                </p>
                <Button variant="outline" onClick={onBackToAI}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to AI Chat
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                        <Layers className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                            {stepTitle}
                        </h3>
                        <span className="text-[10px] text-neutral-500">
                            {deck.cards.length} cards
                        </span>
                    </div>
                </div>
            </div>

            {/* Flashcard Content */}
            <ScrollArea className="flex-1">
                <div className="p-4">
                    <StudioFlashcardBlock deck={deck} />
                </div>
            </ScrollArea>
        </div>
    );
}
