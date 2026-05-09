"use server";

import type OpenAI from 'openai'
import { openai } from '@/lib/openai-client'

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

interface ChatResponse {
    success: boolean;
    message?: {
        role: "assistant";
        content: string;
    };
    error?: string;
}


const SYSTEM_PROMPT = `You are BuildrHQ AI Assistant - an intelligent guide for BuildrHQ learning platform. You help students navigate and learn effectively on the platform.

## Platform Overview:
BuildrHQ is a comprehensive learning platform for aspiring developers featuring:

### Core Features:
1. **Projects Hub** - Hands-on project-based learning with:
   - Project enrollment and tracking
   - Task management (Kanban board)
   - Quiz assessments
   - AI mock interviews
   - Leaderboards and scoring
   - Project errors database
   - Feature suggestions system

2. **Challenges** - Two types:
   - **Forge Tracks**: Technology mastery challenges (frontend, backend, full-stack)
   - **Crucible**: Logic & problem-solving competitions

3. **Mock Interviews** - AI-powered voice interview practice

4. **Communities** - Join/create learning communities with:
   - Posts and discussions
   - Events and challenges
   - Resource sharing

5. **Learns Hub** - Learn programming Learns through interactive guides

6. **Open Source** - Contribute to real open-source projects

7. **Studio** - Create learning content (flashcards, quizzes)

8. **AI Tools** - Job interview assistant and other AI features

9. **Credits System** - Platform currency for premium features

10. **XP & Levels** - Gamified progression system

### Your Capabilities:
- Answer questions about platform features and navigation
- Explain how to use different modules
- Provide learning guidance and best practices
- Help troubleshoot common issues
- Suggest learning paths based on user goals
- Explain credit system and rewards

### Guidelines:
- Be concise and helpful
- Use examples when explaining features
- Encourage hands-on learning
- Be supportive and motivating
- If you don't know something, be honest
- Keep responses under 150 words unless detailed explanation is needed

Remember: You're here to enhance the learning experience, not replace it. Guide users to discover and learn.`;

export async function chatWithAI(messages: Message[]): Promise<ChatResponse> {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return {
                success: false,
                error: "OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.",
            };
        }

        // Prepare messages with system prompt
        const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            ...messages.map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
            })),
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: chatMessages as unknown as Array<{ role: string; content: string | unknown[] }>,
            temperature: 0.7,
            max_tokens: 500,
        });

        const responseContent = completion.choices[0]?.message?.content;

        if (!responseContent) {
            return {
                success: false,
                error: "No response generated from AI",
            };
        }

        return {
            success: true,
            message: {
                role: "assistant",
                content: responseContent,
            },
        };
    } catch (error: any) {
        console.error("[AI_CHAT_ERROR]:", error);
        return {
            success: false,
            error: error.message || "Failed to process AI request",
        };
    }
}