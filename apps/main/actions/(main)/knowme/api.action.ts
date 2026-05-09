"use server";

/**
 * KnowMe API Management Server Actions
 *
 * Handles API key generation, management, and usage tracking
 */

import { getSession } from "@repo/auth";
import { headers } from "next/headers";
import {
    db,
    knowMeProfiles,
    knowMeApiRequests,
} from "@repo/db";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { KnowMeActionResponse, KnowMeApiConfig, KnowMeApiUsageStats } from "@/types/knowme";
import { generateApiKey, hashApiKey, shouldResetRateLimit } from "@/utils/knowme";

// ============================================
// API KEY MANAGEMENT
// ============================================

/**
 * Get API configuration
 */
export async function getApiConfig(): Promise<
  KnowMeActionResponse<KnowMeApiConfig>
> {
  try {
    const session = await getSession(headers());
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await db.query.knowMeProfiles.findFirst({
      where: eq(knowMeProfiles.userId, session.user.id),
      columns: {
        apiKey: true,
        apiEnabled: true,
        apiRateLimit: true,
        apiUsageToday: true,
        apiUsageTotal: true,
        apiLastResetAt: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    return {
      success: true,
      data: {
        apiKey: profile.apiKey || "",
        apiEnabled: profile.apiEnabled,
        apiRateLimit: profile.apiRateLimit,
        apiUsageToday: profile.apiUsageToday,
        apiUsageTotal: profile.apiUsageTotal,
        apiLastResetAt: profile.apiLastResetAt,
      },
    };
  } catch (error) {
    console.error("Error getting API config:", error);
    return { success: false, error: "Failed to get API config" };
  }
}

/**
 * Enable/disable API access
 */
export async function toggleApiAccess(
  enabled: boolean
): Promise<KnowMeActionResponse<void>> {
  try {
    const session = await getSession(headers());
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    await db.update(knowMeProfiles)
      .set({ apiEnabled: enabled })
      .where(eq(knowMeProfiles.userId, session.user.id));

    revalidatePath("/knowme/settings");

    return {
      success: true,
      message: enabled ? "API access enabled" : "API access disabled"
    };
  } catch (error) {
    console.error("Error toggling API access:", error);
    return { success: false, error: "Failed to update API access" };
  }
}

/**
 * Regenerate API key
 */
export async function regenerateApiKey(): Promise<
  KnowMeActionResponse<{ apiKey: string }>
> {
  try {
    const session = await getSession(headers());
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const { key, hash } = generateApiKey();

    await db.update(knowMeProfiles)
      .set({ apiKey: key, apiKeyHash: hash })
      .where(eq(knowMeProfiles.userId, session.user.id));

    revalidatePath("/knowme/settings");

    return {
      success: true,
      data: { apiKey: key },
      message: "API key regenerated successfully",
    };
  } catch (error) {
    console.error("Error regenerating API key:", error);
    return { success: false, error: "Failed to regenerate API key" };
  }
}

/**
 * Update API rate limit
 */
export async function updateApiRateLimit(
  rateLimit: number
): Promise<KnowMeActionResponse<void>> {
  try {
    const session = await getSession(headers());
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate rate limit (10-1000)
    if (rateLimit < 10 || rateLimit > 1000) {
      return { success: false, error: "Rate limit must be between 10 and 1000" };
    }

    await db.update(knowMeProfiles)
      .set({ apiRateLimit: rateLimit })
      .where(eq(knowMeProfiles.userId, session.user.id));

    revalidatePath("/knowme/settings");

    return { success: true, message: "Rate limit updated" };
  } catch (error) {
    console.error("Error updating rate limit:", error);
    return { success: false, error: "Failed to update rate limit" };
  }
}

// ============================================
// API USAGE TRACKING
// ============================================

/**
 * Get API usage statistics
 */
export async function getApiUsageStats(): Promise<
  KnowMeActionResponse<KnowMeApiUsageStats>
> {
  try {
    const session = await getSession(headers());
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await db.query.knowMeProfiles.findFirst({
      where: eq(knowMeProfiles.userId, session.user.id),
      columns: {
        id: true,
        apiRateLimit: true,
        apiUsageToday: true,
        apiUsageTotal: true,
        apiLastResetAt: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // Check if rate limit should reset
    let todayUsage = profile.apiUsageToday;
    if (shouldResetRateLimit(profile.apiLastResetAt)) {
      await db.update(knowMeProfiles)
        .set({
          apiUsageToday: 0,
          apiLastResetAt: new Date(),
        })
        .where(eq(knowMeProfiles.id, profile.id));
      todayUsage = 0;
    }

    // Get this month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [monthUsageResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(knowMeApiRequests)
      .where(and(
        eq(knowMeApiRequests.profileId, profile.id),
        gte(knowMeApiRequests.createdAt, startOfMonth)
      ));

    const monthUsage = Number(monthUsageResult?.count ?? 0);

    return {
      success: true,
      data: {
        today: todayUsage,
        thisMonth: monthUsage,
        total: profile.apiUsageTotal,
        rateLimit: profile.apiRateLimit,
        remaining: Math.max(0, profile.apiRateLimit - todayUsage),
      },
    };
  } catch (error) {
    console.error("Error getting API usage stats:", error);
    return { success: false, error: "Failed to get usage stats" };
  }
}

/**
 * Get recent API requests
 */
export async function getRecentApiRequests(
  limit: number = 20
): Promise<
  KnowMeActionResponse<
    Array<{
      id: string;
      endpoint: string;
      responseStatus: number | null;
      responseTimeMs: number | null;
      createdAt: Date;
    }>
  >
> {
  try {
    const session = await getSession(headers());
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await db.query.knowMeProfiles.findFirst({
      where: eq(knowMeProfiles.userId, session.user.id),
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    const requests = await db.query.knowMeApiRequests.findMany({
      where: eq(knowMeApiRequests.profileId, profile.id),
      columns: {
        id: true,
        endpoint: true,
        responseStatus: true,
        responseTimeMs: true,
        createdAt: true,
      },
      orderBy: [desc(knowMeApiRequests.createdAt)],
      limit,
    });

    return {
      success: true,
      data: requests,
    };
  } catch (error) {
    console.error("Error getting API requests:", error);
    return { success: false, error: "Failed to get requests" };
  }
}

// ============================================
// INTERNAL API VALIDATION (For API routes)
// ============================================

/**
 * Validate API key and check rate limits
 * This is called by the API route handler
 */
export async function validateApiRequest(
  apiKey: string
): Promise<{
  valid: boolean;
  profileId?: string;
  userId?: string;
  username?: string;
  error?: string;
  rateLimitRemaining?: number;
}> {
  try {
    if (!apiKey || !apiKey.startsWith("coderz_km_")) {
      return { valid: false, error: "Invalid API key format" };
    }

    // Hash the key for comparison
    const keyHash = hashApiKey(apiKey);

    // Find profile by API key hash
    const profile = await db.query.knowMeProfiles.findFirst({
      where: and(
        eq(knowMeProfiles.apiKeyHash, keyHash),
        eq(knowMeProfiles.apiEnabled, true)
      ),
      with: {
        user: {
          columns: { id: true, username: true },
        },
      },
    });

    if (!profile) {
      return { valid: false, error: "Invalid or disabled API key" };
    }

    // Check if profile is active
    if (profile.status !== "ACTIVE") {
      return { valid: false, error: "KnowMe profile is not active" };
    }

    // Check rate limit
    let todayUsage = profile.apiUsageToday;

    if (shouldResetRateLimit(profile.apiLastResetAt)) {
      await db.update(knowMeProfiles)
        .set({
          apiUsageToday: 0,
          apiLastResetAt: new Date(),
        })
        .where(eq(knowMeProfiles.id, profile.id));
      todayUsage = 0;
    }

    if (todayUsage >= profile.apiRateLimit) {
      return {
        valid: false,
        error: "Rate limit exceeded",
        rateLimitRemaining: 0,
      };
    }

    return {
      valid: true,
      profileId: profile.id,
      userId: profile.userId,
      username: profile.user?.username || undefined,
      rateLimitRemaining: profile.apiRateLimit - todayUsage,
    };
  } catch (error) {
    console.error("Error validating API key:", error);
    return { valid: false, error: "Validation error" };
  }
}

/**
 * Record API request (called after processing)
 */
export async function recordApiRequest(data: {
  profileId: string;
  apiKey: string;
  endpoint: string;
  method: string;
  requestIp?: string;
  responseStatus: number;
  responseTimeMs: number;
  tokensUsed?: number;
}): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // Create request record
      await tx.insert(knowMeApiRequests).values({
        profileId: data.profileId,
        apiKey: data.apiKey,
        endpoint: data.endpoint,
        method: data.method,
        requestIp: data.requestIp,
        responseStatus: data.responseStatus,
        responseTimeMs: data.responseTimeMs,
        tokensUsed: data.tokensUsed,
      });

      // Update usage counters
      await tx.update(knowMeProfiles)
        .set({
          apiUsageToday: sql`${knowMeProfiles.apiUsageToday} + 1`,
          apiUsageTotal: sql`${knowMeProfiles.apiUsageTotal} + 1`,
          totalExternalRequests: sql`${knowMeProfiles.totalExternalRequests} + 1`,
        })
        .where(eq(knowMeProfiles.id, data.profileId));
    });
  } catch (error) {
    console.error("Error recording API request:", error);
    // Don't throw - this is non-critical
  }
}
