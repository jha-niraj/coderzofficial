"use server";

/**
 * KnowMe Data Management Server Actions
 * 
 * Handles personal data and platform connections
 */

import { auth } from "@repo/auth";
import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import type { KnowMePlatform, KnowMeDataType } from "@repo/prisma/client";
import type { 
  KnowMeActionResponse,
  KnowMePersonalDataItem,
  KnowMePlatformConnectionItem,
} from "@/types/knowme";
import { 
  createContentHash,
  isValidProfileUrl,
  extractUsernameFromUrl,
  calculateNextUpdate,
} from "@/utils/knowme";
import { fetchGithubData } from "@/utils/truefolio/github";

// ============================================
// PERSONAL DATA MANAGEMENT
// ============================================

/**
 * Get all personal data items
 */
export async function getPersonalData(): Promise<
  KnowMeActionResponse<KnowMePersonalDataItem[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await prisma.knowMeProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        personalData: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    return {
      success: true,
      data: profile.personalData.map((pd) => ({
        id: pd.id,
        dataType: pd.dataType,
        title: pd.title,
        fileName: pd.fileName,
        fileUrl: pd.fileUrl,
        fileSize: pd.fileSize,
        isActive: pd.isActive,
        isIndexed: pd.isIndexed,
        createdAt: pd.createdAt,
        updatedAt: pd.updatedAt,
      })),
    };
  } catch (error) {
    console.error("Error getting personal data:", error);
    return { success: false, error: "Failed to get personal data" };
  }
}

/**
 * Add personal data (resume, cover letter, etc.)
 */
export async function addPersonalData(data: {
  dataType: KnowMeDataType;
  title?: string;
  contentText: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
}): Promise<KnowMeActionResponse<KnowMePersonalDataItem>> {
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

    // Check for duplicates by content hash
    const contentHash = createContentHash(data.contentText);
    const existing = await prisma.knowMePersonalData.findFirst({
      where: {
        profileId: profile.id,
        contentHash,
        isActive: true,
      },
    });

    if (existing) {
      return { success: false, error: "This content already exists" };
    }

    const personalData = await prisma.knowMePersonalData.create({
      data: {
        profileId: profile.id,
        dataType: data.dataType,
        title: data.title,
        contentText: data.contentText,
        contentHash,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        isActive: true,
        isIndexed: false,
      },
    });

    revalidatePath("/knowme");

    return {
      success: true,
      data: {
        id: personalData.id,
        dataType: personalData.dataType,
        title: personalData.title,
        fileName: personalData.fileName,
        fileUrl: personalData.fileUrl,
        fileSize: personalData.fileSize,
        isActive: personalData.isActive,
        isIndexed: personalData.isIndexed,
        createdAt: personalData.createdAt,
        updatedAt: personalData.updatedAt,
      },
      message: "Data added successfully",
    };
  } catch (error) {
    console.error("Error adding personal data:", error);
    return { success: false, error: "Failed to add data" };
  }
}

/**
 * Update personal data
 */
export async function updatePersonalData(
  dataId: string,
  updates: {
    title?: string;
    contentText?: string;
  }
): Promise<KnowMeActionResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const personalData = await prisma.knowMePersonalData.findUnique({
      where: { id: dataId },
      include: { profile: true },
    });

    if (!personalData || personalData.profile.userId !== session.user.id) {
      return { success: false, error: "Data not found" };
    }

    await prisma.knowMePersonalData.update({
      where: { id: dataId },
      data: {
        ...updates,
        contentHash: updates.contentText 
          ? createContentHash(updates.contentText) 
          : undefined,
        isIndexed: false, // Needs re-indexing
      },
    });

    revalidatePath("/knowme");

    return { success: true, message: "Data updated successfully" };
  } catch (error) {
    console.error("Error updating personal data:", error);
    return { success: false, error: "Failed to update data" };
  }
}

/**
 * Delete personal data
 */
export async function deletePersonalData(
  dataId: string
): Promise<KnowMeActionResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const personalData = await prisma.knowMePersonalData.findUnique({
      where: { id: dataId },
      include: { profile: true },
    });

    if (!personalData || personalData.profile.userId !== session.user.id) {
      return { success: false, error: "Data not found" };
    }

    // Soft delete
    await prisma.knowMePersonalData.update({
      where: { id: dataId },
      data: { isActive: false },
    });

    revalidatePath("/knowme");

    return { success: true, message: "Data deleted successfully" };
  } catch (error) {
    console.error("Error deleting personal data:", error);
    return { success: false, error: "Failed to delete data" };
  }
}

// ============================================
// PLATFORM CONNECTIONS
// ============================================

/**
 * Get all platform connections
 */
export async function getPlatformConnections(): Promise<
  KnowMeActionResponse<KnowMePlatformConnectionItem[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await prisma.knowMeProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        platformConnections: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    return {
      success: true,
      data: profile.platformConnections.map((pc) => ({
        id: pc.id,
        platform: pc.platform,
        platformUsername: pc.platformUsername,
        profileUrl: pc.profileUrl,
        connectionStatus: pc.connectionStatus,
        isConnected: pc.isConnected,
        lastSyncedAt: pc.lastSyncedAt,
        nextSyncAt: pc.nextSyncAt,
        metadata: pc.metadata as Record<string, unknown> | null,
        createdAt: pc.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error getting platform connections:", error);
    return { success: false, error: "Failed to get connections" };
  }
}

/**
 * Connect a platform
 */
export async function connectPlatform(data: {
  platform: KnowMePlatform;
  profileUrl: string;
}): Promise<KnowMeActionResponse<KnowMePlatformConnectionItem>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate URL
    if (!isValidProfileUrl(data.platform, data.profileUrl)) {
      return { success: false, error: "Invalid profile URL" };
    }

    const profile = await prisma.knowMeProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // Check if already connected
    const existing = await prisma.knowMePlatformConnection.findUnique({
      where: {
        profileId_platform: {
          profileId: profile.id,
          platform: data.platform,
        },
      },
    });

    if (existing) {
      return { success: false, error: "Platform already connected" };
    }

    // Extract username
    const username = extractUsernameFromUrl(data.platform, data.profileUrl);

    // Create connection
    const connection = await prisma.knowMePlatformConnection.create({
      data: {
        profileId: profile.id,
        platform: data.platform,
        platformUsername: username,
        profileUrl: data.profileUrl,
        connectionStatus: "PENDING",
        isConnected: false,
        syncFrequencyDays: 10,
      },
    });

    // Trigger initial sync
    await syncPlatformData(connection.id);

    // Fetch updated connection
    const updatedConnection = await prisma.knowMePlatformConnection.findUnique({
      where: { id: connection.id },
    });

    if (!updatedConnection) {
      return { success: false, error: "Connection not found after sync" };
    }

    revalidatePath("/knowme");

    return {
      success: true,
      data: {
        id: updatedConnection.id,
        platform: updatedConnection.platform,
        platformUsername: updatedConnection.platformUsername,
        profileUrl: updatedConnection.profileUrl,
        connectionStatus: updatedConnection.connectionStatus,
        isConnected: updatedConnection.isConnected,
        lastSyncedAt: updatedConnection.lastSyncedAt,
        nextSyncAt: updatedConnection.nextSyncAt,
        metadata: updatedConnection.metadata as Record<string, unknown> | null,
        createdAt: updatedConnection.createdAt,
      },
      message: "Platform connected successfully",
    };
  } catch (error) {
    console.error("Error connecting platform:", error);
    return { success: false, error: "Failed to connect platform" };
  }
}

/**
 * Disconnect a platform
 */
export async function disconnectPlatform(
  connectionId: string
): Promise<KnowMeActionResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const connection = await prisma.knowMePlatformConnection.findUnique({
      where: { id: connectionId },
      include: { profile: true },
    });

    if (!connection || connection.profile.userId !== session.user.id) {
      return { success: false, error: "Connection not found" };
    }

    // Delete external data for this connection
    await prisma.knowMeExternalData.deleteMany({
      where: { connectionId },
    });

    // Delete connection
    await prisma.knowMePlatformConnection.delete({
      where: { id: connectionId },
    });

    revalidatePath("/knowme");

    return { success: true, message: "Platform disconnected" };
  } catch (error) {
    console.error("Error disconnecting platform:", error);
    return { success: false, error: "Failed to disconnect platform" };
  }
}

/**
 * Sync platform data
 */
export async function syncPlatformData(
  connectionId: string
): Promise<KnowMeActionResponse<void>> {
  try {
    const connection = await prisma.knowMePlatformConnection.findUnique({
      where: { id: connectionId },
      include: { profile: true },
    });

    if (!connection) {
      return { success: false, error: "Connection not found" };
    }

    // Update status
    await prisma.knowMePlatformConnection.update({
      where: { id: connectionId },
      data: { connectionStatus: "SYNCING" },
    });

    try {
      let externalDataItems: Array<{
        dataType: KnowMeDataType;
        externalId: string;
        title: string;
        description: string | null;
        url: string;
        techStack: string[];
        dateCreated: Date | null;
        metrics: Record<string, unknown>;
      }> = [];

      switch (connection.platform) {
        case "GITHUB":
          if (connection.platformUsername) {
            const githubData = await fetchGithubData(connection.platformUsername);
            
            // Convert repos to external data
            externalDataItems = githubData.repositories.map((repo) => ({
              dataType: "GITHUB_REPO" as KnowMeDataType,
              externalId: repo.name,
              title: repo.name,
              description: repo.description,
              url: repo.url,
              techStack: repo.techStack,
              dateCreated: repo.lastCommit ? new Date(repo.lastCommit) : null,
              metrics: {
                commits: repo.commitsCount,
              },
            }));

            // Update connection metadata
            await prisma.knowMePlatformConnection.update({
              where: { id: connectionId },
              data: {
                metadata: {
                  github: {
                    repos: githubData.profile.public_repos,
                    followers: githubData.profile.followers,
                    following: githubData.profile.following,
                    bio: githubData.profile.bio,
                    languages: Object.keys(githubData.summary.primaryLanguages),
                  },
                },
              },
            });
          }
          break;

        // TODO: Add other platform handlers
        case "LEETCODE":
        case "STACKOVERFLOW":
        case "LINKEDIN":
          // These would use their respective scraping utilities
          break;
      }

      // Save external data
      for (const item of externalDataItems) {
        await prisma.knowMeExternalData.upsert({
          where: {
            profileId_connectionId_externalId: {
              profileId: connection.profileId,
              connectionId: connection.id,
              externalId: item.externalId,
            },
          },
          update: {
            title: item.title,
            description: item.description,
            url: item.url,
            techStack: item.techStack,
            dateUpdated: new Date(),
            metrics: item.metrics,
            isActive: true,
          },
          create: {
            profileId: connection.profileId,
            connectionId: connection.id,
            dataType: item.dataType,
            externalId: item.externalId,
            title: item.title,
            description: item.description,
            url: item.url,
            techStack: item.techStack,
            dateCreated: item.dateCreated,
            metrics: item.metrics,
            isActive: true,
          },
        });
      }

      // Update connection status
      await prisma.knowMePlatformConnection.update({
        where: { id: connectionId },
        data: {
          connectionStatus: "COMPLETED",
          isConnected: true,
          lastSyncedAt: new Date(),
          nextSyncAt: calculateNextUpdate(connection.syncFrequencyDays),
          lastSyncError: null,
        },
      });

      return { success: true, message: "Sync completed" };
    } catch (syncError) {
      // Update connection with error
      await prisma.knowMePlatformConnection.update({
        where: { id: connectionId },
        data: {
          connectionStatus: "FAILED",
          lastSyncError: (syncError as Error).message,
        },
      });

      throw syncError;
    }
  } catch (error) {
    console.error("Error syncing platform:", error);
    return { success: false, error: "Failed to sync platform" };
  }
}

/**
 * Trigger sync for all connected platforms
 */
export async function syncAllPlatforms(): Promise<KnowMeActionResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const profile = await prisma.knowMeProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        platformConnections: {
          where: { isConnected: true },
        },
      },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // Sync each connection
    for (const connection of profile.platformConnections) {
      await syncPlatformData(connection.id);
    }

    revalidatePath("/knowme");

    return { success: true, message: "All platforms synced" };
  } catch (error) {
    console.error("Error syncing all platforms:", error);
    return { success: false, error: "Failed to sync platforms" };
  }
}

