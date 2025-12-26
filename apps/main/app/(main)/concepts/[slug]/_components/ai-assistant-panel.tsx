"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    X, Send, Sparkles, Loader2, Bot, User
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { ConceptStepType } from "@repo/prisma/client";

interface ConceptStep {
    id: string;
    order: number;
    title: string;
    type: ConceptStepType;
    content: string;
}

interface AIAssistantPanelProps {
    conceptTitle: string;
    currentStep: ConceptStep;
    onClose: () => void;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

const suggestionQuestions = [
    "Explain this in simpler terms",
    "Give me a real-world example",
    "What are common mistakes to avoid?",
    "How does this relate to other concepts?",
];

export default function AIAssistantPanel({
    conceptTitle,
    currentStep,
    onClose,
}: AIAssistantPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response (in production, this would call an AI API)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: generateMockResponse(content, conceptTitle, currentStep.title),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="h-full flex flex-col w-96">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">AI Assistant</h3>
                        <p className="text-xs text-muted-foreground">Ask anything about this concept</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {
                    messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mb-4">
                                <Bot className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h4 className="font-medium text-foreground mb-2">
                                How can I help?
                            </h4>
                            <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
                                Ask questions about &quot;{currentStep.title}&quot; or the entire concept.
                            </p>
                            <div className="space-y-2 w-full">
                                {
                                    suggestionQuestions.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendMessage(question)}
                                            className="w-full text-left text-sm px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                        >
                                            {question}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {
                                messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""
                                            }`}
                                    >
                                        <Avatar className="w-8 h-8 flex-shrink-0">
                                            <AvatarFallback
                                                className={
                                                    message.role === "assistant"
                                                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                                                        : "bg-blue-500 text-white"
                                                }
                                            >
                                                {
                                                    message.role === "assistant" ? (
                                                        <Bot className="w-4 h-4" />
                                                    ) : (
                                                        <User className="w-4 h-4" />
                                                    )
                                                }
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "user"
                                                ? "bg-blue-500 text-white"
                                                : "bg-neutral-100 dark:bg-neutral-800"
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </motion.div>
                                ))
                            }
                            {
                                isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-3"
                                    >
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                                <Bot className="w-4 h-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="rounded-lg px-4 py-2 bg-neutral-100 dark:bg-neutral-800">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        </div>
                                    </motion.div>
                                )
                            }
                        </div>
                    )
                }
            </ScrollArea>
            <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-neutral-200 dark:border-neutral-800"
            >
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}

// Mock response generator (replace with actual AI API call)
function generateMockResponse(question: string, conceptTitle: string, stepTitle: string): string {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("simpler") || lowerQuestion.includes("explain")) {
        return `Great question! Let me break down "${stepTitle}" in simpler terms:

Think of it like building blocks. Each piece connects to create something bigger. The key idea is that you start with the basics and gradually add complexity.

For example, imagine you're learning to cook. You don't start with a five-course meal - you start by learning to boil water, then make simple dishes, and gradually work your way up.

Does this help? Feel free to ask for more specific examples!`;
    }

    if (lowerQuestion.includes("example") || lowerQuestion.includes("real")) {
        return `Here's a real-world example for "${stepTitle}":

Imagine you're building a social media app like Instagram. This concept would be used when:

1. **User Authentication**: When someone logs in, this principle ensures their session is secure
2. **Data Flow**: As users scroll through their feed, this helps manage how content loads
3. **Performance**: By applying this, the app stays fast even with millions of users

The key takeaway is that understanding this concept will help you build better, more scalable applications.`;
    }

    if (lowerQuestion.includes("mistakes") || lowerQuestion.includes("avoid")) {
        return `Common mistakes to avoid with "${stepTitle}":

1. **Overcomplicating things**: Keep it simple at first
2. **Skipping fundamentals**: Make sure you understand the basics before moving on
3. **Not practicing**: Theory is important, but hands-on coding is essential
4. **Ignoring edge cases**: Always think about what could go wrong

Pro tip: When learning this, try to implement it in a small project. That's where real learning happens!`;
    }

    if (lowerQuestion.includes("relate") || lowerQuestion.includes("connection")) {
        return `Great question about connections! "${stepTitle}" relates to several other concepts:

**Prerequisites:**
- Understanding of basic programming
- Familiarity with data types and variables

**What it leads to:**
- Advanced design patterns
- System architecture decisions
- Performance optimization

**Related concepts in ${conceptTitle}:**
This builds on what you learned in previous steps and prepares you for more complex topics ahead.`;
    }

    return `That's a great question about "${stepTitle}"!

Here's what you need to know:

This concept is fundamental to understanding ${conceptTitle}. It helps you build a mental model for how things work under the hood.

Key points to remember:
• Focus on understanding the "why" not just the "how"
• Practice with small examples before tackling big projects
• Don't be afraid to experiment and make mistakes

Would you like me to elaborate on any specific aspect?`;
}