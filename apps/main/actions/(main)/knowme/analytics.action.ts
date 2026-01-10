"use server";

/**
 * KnowMe Analytics Server Actions
 * 
 * Handles analytics, insights, and statistics
 */

import { auth } from "@repo/auth";
import { prisma } from "@repo/prisma";
import type { KnowMeQuestionCategory } from "@repo/prisma/client";
import type { 
  KnowMeActionResponse,
  KnowMeAnalyticsFull,
  KnowMeAnalyticsOverview,
  QuestionCategoryStats,
  TopQuestion,
  VisitorData,
  AnalyticsInsight,
  DailyActivityData,
  TimeRange,
} from "@/types/knowme";
import { calculateTrend, generateInsight } from "@/utils/knowme";

// ============================================
// MAIN ANALYTICS
// ============================================

/**
 * Get full analytics data
 */
export async function getKnowMeAnalytics(
  timeRange: TimeRange = "30d"
): Promise<KnowMeActionResponse<KnowMeAnalyticsFull>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await prisma.knowMeProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // Calculate date range
    const { startDate, previousStartDate } = getDateRange(timeRange);

    // Get overview stats
    const overview = await getOverviewStats(profile.id, startDate, previousStartDate);

    // Get questions by category
    const questionsByCategory = await getQuestionsByCategory(profile.id, startDate);

    // Get top questions
    const topQuestions = await getTopQuestions(profile.id, startDate);

    // Get recent visitors
    const recentVisitors = await getRecentVisitors(profile.id, startDate);

    // Get daily activity
    const dailyActivity = await getDailyActivity(profile.id, startDate);

    // Generate insights
    const insights = generateInsights(
      overview,
      questionsByCategory,
      recentVisitors
    );

    return {
      success: true,
      data: {
        overview,
        questionsByCategory,
        topQuestions,
        recentVisitors,
        insights,
        dailyActivity,
      },
    };
  } catch (error) {
    console.error("Error getting analytics:", error);
    return { success: false, error: "Failed to get analytics" };
  }
}

/**
 * Get overview statistics
 */
async function getOverviewStats(
  profileId: string,
  startDate: Date,
  previousStartDate: Date
): Promise<KnowMeAnalyticsOverview> {
  // Current period stats
  const [currentQuestions, currentSessions, currentViews] = await Promise.all([
    prisma.knowMeQuestionAnalytics.count({
      where: {
        profileId,
        askedAt: { gte: startDate },
      },
    }),
    prisma.knowMeChatSession.count({
      where: {
        profileId,
        startedAt: { gte: startDate },
      },
    }),
    prisma.knowMeProfileView.count({
      where: {
        profileId,
        viewedAt: { gte: startDate },
      },
    }),
  ]);

  // Previous period stats
  const [prevQuestions, prevSessions, prevViews] = await Promise.all([
    prisma.knowMeQuestionAnalytics.count({
      where: {
        profileId,
        askedAt: { gte: previousStartDate, lt: startDate },
      },
    }),
    prisma.knowMeChatSession.count({
      where: {
        profileId,
        startedAt: { gte: previousStartDate, lt: startDate },
      },
    }),
    prisma.knowMeProfileView.count({
      where: {
        profileId,
        viewedAt: { gte: previousStartDate, lt: startDate },
      },
    }),
  ]);

  const avgPerSession = currentSessions > 0 
    ? Math.round((currentQuestions / currentSessions) * 10) / 10 
    : 0;
  const prevAvgPerSession = prevSessions > 0 
    ? Math.round((prevQuestions / prevSessions) * 10) / 10 
    : 0;

  return {
    totalQuestions: currentQuestions,
    totalVisitors: currentViews,
    totalSessions: currentSessions,
    avgQuestionsPerSession: avgPerSession,
    trends: {
      questions: calculateTrend(currentQuestions, prevQuestions),
      visitors: calculateTrend(currentViews, prevViews),
      sessions: calculateTrend(currentSessions, prevSessions),
    },
  };
}

/**
 * Get questions by category
 */
async function getQuestionsByCategory(
  profileId: string,
  startDate: Date
): Promise<QuestionCategoryStats[]> {
  const categories = await prisma.knowMeQuestionAnalytics.groupBy({
    by: ["questionCategory"],
    where: {
      profileId,
      askedAt: { gte: startDate },
    },
    _count: true,
  });

  const total = categories.reduce((sum, c) => sum + c._count, 0);

  return categories
    .map((c) => ({
      category: c.questionCategory,
      count: c._count,
      percentage: total > 0 ? Math.round((c._count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get top questions
 */
async function getTopQuestions(
  profileId: string,
  startDate: Date
): Promise<TopQuestion[]> {
  // Get raw questions
  const questions = await prisma.knowMeQuestionAnalytics.findMany({
    where: {
      profileId,
      askedAt: { gte: startDate },
    },
    select: {
      question: true,
      questionCategory: true,
    },
  });

  // Count similar questions (basic similarity - exact match for now)
  // In production, you'd want more sophisticated grouping
  const questionCounts = new Map<string, { count: number; category: KnowMeQuestionCategory }>();

  for (const q of questions) {
    const normalized = q.question.toLowerCase().trim();
    const existing = questionCounts.get(normalized);
    if (existing) {
      existing.count++;
    } else {
      questionCounts.set(normalized, { count: 1, category: q.questionCategory });
    }
  }

  return Array.from(questionCounts.entries())
    .map(([question, data]) => ({
      question: question.charAt(0).toUpperCase() + question.slice(1),
      count: data.count,
      category: data.category,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Get recent visitors
 */
async function getRecentVisitors(
  profileId: string,
  startDate: Date
): Promise<VisitorData[]> {
  const sessions = await prisma.knowMeChatSession.findMany({
    where: {
      profileId,
      startedAt: { gte: startDate },
    },
    include: {
      visitorUser: {
        select: {
          id: true,
          name: true,
          image: true,
          occupation: true,
          company: true,
        },
      },
      messages: {
        where: { role: "user" },
        select: { content: true },
      },
    },
    orderBy: { lastActivityAt: "desc" },
    take: 20,
  });

  // Group by user/session
  const visitorMap = new Map<string, VisitorData>();

  for (const session of sessions) {
    const key = session.visitorUserId || session.id;
    const existing = visitorMap.get(key);

    // Extract topics from questions
    const topics = session.messages
      .flatMap((m) => extractTopicsFromQuestion(m.content))
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .slice(0, 5);

    if (existing) {
      existing.questionsAsked += session.questionsAsked;
      if (session.lastActivityAt > existing.lastActive) {
        existing.lastActive = session.lastActivityAt;
      }
      existing.interestedTopics = [
        ...new Set([...existing.interestedTopics, ...topics]),
      ].slice(0, 5);
    } else {
      visitorMap.set(key, {
        userId: session.visitorUserId,
        userName: session.visitorUser?.name || null,
        userImage: session.visitorUser?.image || null,
        viewerType: session.viewerType,
        questionsAsked: session.questionsAsked,
        lastActive: session.lastActivityAt,
        interestedTopics: topics,
        companyName: session.visitorUser?.company || undefined,
      });
    }
  }

  return Array.from(visitorMap.values())
    .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
    .slice(0, 10);
}

/**
 * Get daily activity data
 */
async function getDailyActivity(
  profileId: string,
  startDate: Date
): Promise<DailyActivityData[]> {
  const days = Math.ceil(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const dailyData: DailyActivityData[] = [];

  for (let i = 0; i < days; i++) {
    const dayStart = new Date(startDate);
    dayStart.setDate(dayStart.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const [questions, visitors, sessions] = await Promise.all([
      prisma.knowMeQuestionAnalytics.count({
        where: {
          profileId,
          askedAt: { gte: dayStart, lt: dayEnd },
        },
      }),
      prisma.knowMeProfileView.count({
        where: {
          profileId,
          viewedAt: { gte: dayStart, lt: dayEnd },
        },
      }),
      prisma.knowMeChatSession.count({
        where: {
          profileId,
          startedAt: { gte: dayStart, lt: dayEnd },
        },
      }),
    ]);

    dailyData.push({
      date: dayStart.toISOString().split("T")[0] as string,
      questions,
      visitors,
      sessions,
    });
  }

  return dailyData;
}

// ============================================
// INSIGHTS GENERATION
// ============================================

/**
 * Generate insights from analytics data
 */
function generateInsights(
  overview: KnowMeAnalyticsOverview,
  categories: QuestionCategoryStats[],
  visitors: VisitorData[]
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  // Top category insight
  const firstCategory = categories[0];
  if (firstCategory && firstCategory.count >= 5) {
    const topCategory = firstCategory;
    const insight = generateInsight("strength", {
      topCategory: topCategory.category,
      questionCount: topCategory.count,
    });
    if (insight) {
      insights.push({
        type: "strength",
        message: insight,
      });
    }
  }

  // Recruiter interest insight
  const recruiterCount = visitors.filter(
    (v) => v.viewerType === "RECRUITER"
  ).length;
  if (recruiterCount > 0) {
    const insight = generateInsight("suggestion", { recruiterCount });
    if (insight) {
      insights.push({
        type: "suggestion",
        message: insight,
      });
    }
  }

  // Response rate insight
  if (overview.totalQuestions > 10) {
    // Assume 95% response rate for now (would need actual data)
    const responseRate = 95;
    const insight = generateInsight("info", { responseRate });
    if (insight) {
      insights.push({
        type: "info",
        message: insight,
      });
    }
  }

  // Growth insight
  if (overview.trends.questions.direction === "up" && 
      overview.trends.questions.changePercent > 20) {
    insights.push({
      type: "info",
      message: `Your profile engagement is up ${overview.trends.questions.changePercent}% this period! Keep up the great work.`,
    });
  }

  // Low engagement warning
  if (overview.totalQuestions < 5 && overview.totalSessions >= 3) {
    insights.push({
      type: "warning",
      message: "Visitors aren't asking many questions. Consider adding more content to your profile to improve engagement.",
      actionUrl: "/knowme/settings",
      actionText: "Update Profile",
    });
  }

  return insights.slice(0, 5);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDateRange(timeRange: TimeRange): {
  startDate: Date;
  previousStartDate: Date;
} {
  const now = new Date();
  let days: number;

  switch (timeRange) {
    case "7d":
      days = 7;
      break;
    case "30d":
      days = 30;
      break;
    case "90d":
      days = 90;
      break;
    case "all":
      days = 365;
      break;
    default:
      days = 30;
  }

  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - days);

  return { startDate, previousStartDate };
}

function extractTopicsFromQuestion(question: string): string[] {
  const topics: string[] = [];
  const lowerQ = question.toLowerCase();

  const techKeywords = [
    "react", "vue", "angular", "node", "python", "java", "javascript",
    "typescript", "aws", "docker", "kubernetes", "database", "api",
    "frontend", "backend", "fullstack", "mobile", "devops"
  ];

  for (const keyword of techKeywords) {
    if (lowerQ.includes(keyword)) {
      topics.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }

  return topics;
}

// ============================================
// EXPORT DATA
// ============================================

/**
 * Export analytics data
 */
export async function exportAnalyticsData(
  timeRange: TimeRange = "30d"
): Promise<KnowMeActionResponse<{
  questions: Array<{ question: string; category: string; askedAt: Date }>;
  visitors: Array<{ type: string; questionsAsked: number; date: Date }>;
}>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await prisma.knowMeProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    const { startDate } = getDateRange(timeRange);

    const [questions, sessions] = await Promise.all([
      prisma.knowMeQuestionAnalytics.findMany({
        where: {
          profileId: profile.id,
          askedAt: { gte: startDate },
        },
        select: {
          question: true,
          questionCategory: true,
          askedAt: true,
        },
        orderBy: { askedAt: "desc" },
      }),
      prisma.knowMeChatSession.findMany({
        where: {
          profileId: profile.id,
          startedAt: { gte: startDate },
        },
        select: {
          viewerType: true,
          questionsAsked: true,
          startedAt: true,
        },
        orderBy: { startedAt: "desc" },
      }),
    ]);

    return {
      success: true,
      data: {
        questions: questions.map((q) => ({
          question: q.question,
          category: q.questionCategory,
          askedAt: q.askedAt,
        })),
        visitors: sessions.map((s) => ({
          type: s.viewerType,
          questionsAsked: s.questionsAsked,
          date: s.startedAt,
        })),
      },
    };
  } catch (error) {
    console.error("Error exporting analytics:", error);
    return { success: false, error: "Failed to export data" };
  }
}

