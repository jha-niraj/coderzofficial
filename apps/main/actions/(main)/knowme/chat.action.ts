"use server";

/**
 * KnowMe Chat Server Actions
 * 
 * Handles AI chat functionality with RAG (Retrieval-Augmented Generation)
 */

import { auth } from "@repo/auth";
import { prisma } from "@repo/prisma";
import type { KnowMeViewerType } from "@repo/prisma/client";
import type { 
  KnowMeActionResponse, 
  KnowMeChatSessionData,
  ChatResponse,
  ChatMessageSource
} from "@/types/knowme";
import {
  generateEmbedding,
  queryVectors,
  generateResponse,
  generateNoContextResponse,
  categorizeQuestion,
  generateSessionToken,
  extractKeywords,
  enhanceResponseWithCTAs,
} from "@/utils/knowme";

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Create or get chat session
 */
export async function getOrCreateChatSession(
  profileId: string,
  sessionToken?: string
): Promise<KnowMeActionResponse<KnowMeChatSessionData>> {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    // Try to find existing session
    if (sessionToken) {
      const existingSession = await prisma.knowMeChatSession.findUnique({
        where: { sessionToken },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 50, // Limit messages
          },
        },
      });

      if (existingSession && existingSession.profileId === profileId) {
        return {
          success: true,
          data: formatChatSession(existingSession),
        };
      }
    }

    // Get profile to determine viewer type
    const profile = await prisma.knowMeProfile.findUnique({
      where: { id: profileId },
      include: { privacySettings: true },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // Determine viewer type
    let viewerType: KnowMeViewerType = "ANONYMOUS";
    if (currentUserId) {
      if (currentUserId === profile.userId) {
        viewerType = "OWNER";
      } else {
        // TODO: Check if user is a verified recruiter
        viewerType = "REGISTERED_USER";
      }
    }

    // Check privacy settings
    const privacySettings = profile.privacySettings;
    if (privacySettings) {
      if (viewerType === "ANONYMOUS" && !privacySettings.allowAnonymous) {
        return { success: false, error: "Anonymous access is not allowed" };
      }
      if (viewerType === "REGISTERED_USER" && !privacySettings.allowRegisteredUsers) {
        return { success: false, error: "Access is restricted" };
      }
    }

    // Create new session
    const newSession = await prisma.knowMeChatSession.create({
      data: {
        profileId,
        visitorUserId: currentUserId,
        viewerType,
        sessionToken: generateSessionToken(),
        rateLimitRemaining: privacySettings?.maxQuestionsPerSession || 20,
        rateLimitResetAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        source: "direct",
      },
      include: {
        messages: true,
      },
    });

    // Update profile stats
    await prisma.knowMeProfile.update({
      where: { id: profileId },
      data: {
        totalSessions: { increment: 1 },
        totalVisitors: { increment: viewerType !== "OWNER" ? 1 : 0 },
      },
    });

    return {
      success: true,
      data: formatChatSession(newSession),
    };
  } catch (error) {
    console.error("Error getting/creating chat session:", error);
    return { success: false, error: "Failed to create session" };
  }
}

/**
 * Send a message and get AI response
 */
export async function sendChatMessage(
  sessionId: string,
  question: string
): Promise<ChatResponse> {
  const startTime = Date.now();

  try {
    // Get session and profile
    const chatSession = await prisma.knowMeChatSession.findUnique({
      where: { id: sessionId },
      include: {
        profile: {
          include: {
            user: {
              select: {
                name: true,
                username: true,
                occupation: true,
                bio: true,
              },
            },
          },
        },
      },
    });

    if (!chatSession) {
      return { success: false, error: "Session not found" };
    }

    // Check rate limit
    if (chatSession.rateLimitRemaining <= 0) {
      const resetTime = chatSession.rateLimitResetAt;
      if (new Date() < resetTime) {
        return {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          rateLimit: {
            remaining: 0,
            resetAt: resetTime,
          },
        };
      }
      // Reset rate limit
      await prisma.knowMeChatSession.update({
        where: { id: sessionId },
        data: {
          rateLimitRemaining: 20,
          rateLimitResetAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
    }

    const profile = chatSession.profile;
    const user = profile.user;

    // Save user message
    await prisma.knowMeChatMessage.create({
      data: {
        sessionId,
        role: "user",
        content: question,
      },
    });

    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);

    // Search for relevant context in vector DB
    const relevantChunks = await queryVectors(
      questionEmbedding,
      profile.id,
      {
        topK: 5,
        minScore: 0.5,
        includeMetadata: true,
      }
    );

    let answer: string;
    let sources: ChatMessageSource[] = [];
    let tokensUsed = 0;
    let responseTimeMs = Date.now() - startTime;

    if (relevantChunks.length > 0) {
      // Generate response with context (RAG)
      const result = await generateResponse(
        question,
        relevantChunks,
        {
          name: user.name || user.username || "User",
          occupation: user.occupation,
        },
        chatSession.viewerType
      );

      answer = result.answer;
      sources = result.sources;
      tokensUsed = result.tokensUsed;
      responseTimeMs = result.responseTimeMs;

      // Enhance with CTAs
      const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/knowme/${user.username}`;
      answer = enhanceResponseWithCTAs(answer, chatSession.viewerType, profileUrl);
    } else {
      // No context found
      answer = await generateNoContextResponse(
        question,
        user.name || user.username || "User"
      );
    }

    // Save AI response
    const aiMessage = await prisma.knowMeChatMessage.create({
      data: {
        sessionId,
        role: "assistant",
        content: answer,
        sources: sources as unknown as undefined,
        tokensUsed,
        responseTimeMs,
        retrievedChunks: relevantChunks.map((c) => ({
          id: c.id,
          score: c.score,
        })) as unknown as undefined,
      },
    });

    // Update session stats
    await prisma.knowMeChatSession.update({
      where: { id: sessionId },
      data: {
        questionsAsked: { increment: 1 },
        messagesCount: { increment: 2 },
        rateLimitRemaining: { decrement: 1 },
        lastActivityAt: new Date(),
      },
    });

    // Update profile stats
    await prisma.knowMeProfile.update({
      where: { id: profile.id },
      data: {
        totalQuestionsAnswered: { increment: 1 },
      },
    });

    // Log analytics
    const questionCategory = categorizeQuestion(question);
    const keywords = extractKeywords(question);

    await prisma.knowMeQuestionAnalytics.create({
      data: {
        profileId: profile.id,
        question,
        questionCategory,
        questionKeywords: keywords,
        askedByUserId: chatSession.visitorUserId,
        askedByType: chatSession.viewerType,
        responseGenerated: true,
        responseTimeMs,
        responseTokens: tokensUsed,
      },
    });

    return {
      success: true,
      answer,
      sources,
      sessionId: chatSession.sessionToken,
      rateLimit: {
        remaining: chatSession.rateLimitRemaining - 1,
        resetAt: chatSession.rateLimitResetAt,
      },
    };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return { success: false, error: "Failed to generate response" };
  }
}

/**
 * Get chat history for a session
 */
export async function getChatHistory(
  sessionToken: string
): Promise<KnowMeActionResponse<KnowMeChatSessionData>> {
  try {
    const chatSession = await prisma.knowMeChatSession.findUnique({
      where: { sessionToken },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chatSession) {
      return { success: false, error: "Session not found" };
    }

    return {
      success: true,
      data: formatChatSession(chatSession),
    };
  } catch (error) {
    console.error("Error getting chat history:", error);
    return { success: false, error: "Failed to get chat history" };
  }
}

/**
 * Submit feedback for a message
 */
export async function submitMessageFeedback(
  messageId: string,
  wasHelpful: boolean,
  feedback?: string
): Promise<KnowMeActionResponse<void>> {
  try {
    await prisma.knowMeChatMessage.update({
      where: { id: messageId },
      data: {
        wasHelpful,
        feedback,
      },
    });

    return { success: true, message: "Feedback submitted" };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}

/**
 * End chat session
 */
export async function endChatSession(
  sessionToken: string
): Promise<KnowMeActionResponse<void>> {
  try {
    await prisma.knowMeChatSession.update({
      where: { sessionToken },
      data: {
        endedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error ending session:", error);
    return { success: false, error: "Failed to end session" };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatChatSession(session: {
  id: string;
  profileId: string;
  visitorUserId: string | null;
  viewerType: KnowMeViewerType;
  questionsAsked: number;
  rateLimitRemaining: number;
  startedAt: Date;
  lastActivityAt: Date;
  sessionToken: string;
  messages: {
    id: string;
    role: string;
    content: string;
    sources: unknown;
    responseTimeMs: number | null;
    wasHelpful: boolean | null;
    createdAt: Date;
  }[];
}): KnowMeChatSessionData {
  return {
    id: session.id,
    profileId: session.profileId,
    visitorUserId: session.visitorUserId,
    viewerType: session.viewerType,
    questionsAsked: session.questionsAsked,
    rateLimitRemaining: session.rateLimitRemaining,
    startedAt: session.startedAt,
    lastActivityAt: session.lastActivityAt,
    messages: session.messages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
      sources: m.sources as ChatMessageSource[] | null,
      responseTimeMs: m.responseTimeMs,
      wasHelpful: m.wasHelpful,
      createdAt: m.createdAt,
    })),
  };
}

