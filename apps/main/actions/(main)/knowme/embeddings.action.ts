"use server";

/**
 * KnowMe Embeddings Server Actions
 * 
 * Handles embedding generation, storage, and management
 */

import { auth } from "@repo/auth";
import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import type { KnowMeDataType } from "@repo/prisma/client";
import type { 
  KnowMeActionResponse,
  KnowMeEmbeddingJobData,
} from "@/types/knowme";
import {
  generateEmbedding,
  generateEmbeddingsBatch,
  upsertVectorsBatch,
  deleteVectorsBatch,
  deleteNamespace,
  createProfileChunks,
  createProjectChunks,
  createAssessmentChunks,
  createGitHubRepoChunks,
  createResumeChunks,
  createBioChunks,
  generateVectorId,
  calculateNextUpdate,
  createContentHash,
} from "@/utils/knowme";

// ============================================
// MAIN EMBEDDING GENERATION
// ============================================

/**
 * Generate embeddings for user's profile data
 * This is the main function that processes all user data and creates embeddings
 */
export async function generateProfileEmbeddings(): Promise<
  KnowMeActionResponse<KnowMeEmbeddingJobData>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Get profile with all related data
    const profile = await prisma.knowMeProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          include: {
            skills: true,
          },
        },
        personalData: {
          where: { isActive: true },
        },
        platformConnections: {
          where: { isConnected: true },
        },
        externalData: {
          where: { isActive: true },
        },
      },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // Create embedding job
    const job = await prisma.knowMeEmbeddingJob.create({
      data: {
        profileId: profile.id,
        jobType: "FULL_SYNC",
        status: "PROCESSING",
        priority: 1,
        scope: {
          includePersonalData: profile.includePersonalData,
          includePlatformData: profile.includePlatformData,
          includeProjects: profile.includeProjects,
          includeAssessments: profile.includeAssessments,
        },
      },
    });

    // Update profile status
    await prisma.knowMeProfile.update({
      where: { id: profile.id },
      data: { status: "PROCESSING" },
    });

    try {
      // Process embeddings (this could be moved to a background job for large datasets)
      const result = await processEmbeddings(profile);

      // Update job with results
      await prisma.knowMeEmbeddingJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          progress: 100,
          totalItems: result.totalItems,
          processedItems: result.processedItems,
          failedItems: result.failedItems,
          completedAt: new Date(),
          result: {
            success: true,
            chunksCreated: result.processedItems,
          },
        },
      });

      // Update profile
      await prisma.knowMeProfile.update({
        where: { id: profile.id },
        data: {
          status: "ACTIVE",
          lastUpdatedAt: new Date(),
          nextScheduledUpdate: calculateNextUpdate(profile.updateCycleDays),
          totalEmbeddingsCount: result.processedItems,
          lastEmbeddingVersion: "v1",
        },
      });

      revalidatePath("/knowme");

      return {
        success: true,
        data: {
          id: job.id,
          jobType: job.jobType,
          status: "COMPLETED",
          progress: 100,
          totalItems: result.totalItems,
          processedItems: result.processedItems,
          failedItems: result.failedItems,
          startedAt: job.createdAt,
          completedAt: new Date(),
          errorLogs: [],
        },
        message: `Successfully created ${result.processedItems} embeddings`,
      };
    } catch (processError) {
      // Update job with error
      await prisma.knowMeEmbeddingJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          result: {
            error: (processError as Error).message,
          },
          errorLogs: [(processError as Error).message],
        },
      });

      // Reset profile status
      await prisma.knowMeProfile.update({
        where: { id: profile.id },
        data: { status: "ERROR" },
      });

      throw processError;
    }
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return { success: false, error: "Failed to generate embeddings" };
  }
}

/**
 * Process all embeddings for a profile
 */
async function processEmbeddings(profile: {
  id: string;
  userId: string;
  includePersonalData: boolean;
  includePlatformData: boolean;
  includeProjects: boolean;
  includeAssessments: boolean;
  includeResume: boolean;
  user: {
    name: string | null;
    bio: string | null;
    occupation: string | null;
    location: string | null;
    skills: { name: string }[];
  };
  personalData: {
    id: string;
    dataType: KnowMeDataType;
    contentText: string | null;
    title: string | null;
  }[];
  externalData: {
    id: string;
    dataType: KnowMeDataType;
    title: string | null;
    description: string | null;
    url: string | null;
    techStack: string[];
  }[];
}): Promise<{
  totalItems: number;
  processedItems: number;
  failedItems: number;
}> {
  const allChunks: {
    id: string;
    text: string;
    metadata: Record<string, unknown>;
  }[] = [];

  let totalItems = 0;
  let failedItems = 0;

  // 1. Process user profile/bio
  const bioChunks = createBioChunks(profile.id, {
    name: profile.user.name,
    bio: profile.user.bio,
    occupation: profile.user.occupation,
    location: profile.user.location,
    skills: profile.user.skills.map((s) => s.name),
  });

  bioChunks.forEach((chunk, index) => {
    allChunks.push({
      id: generateVectorId(profile.id, "PROFILE", profile.id, index),
      text: chunk.text,
      metadata: {
        ...chunk.metadata,
        text: chunk.text, // Store text in metadata for retrieval
      },
    });
  });
  totalItems += bioChunks.length;

  // 2. Process personal data (resume, etc.)
  if (profile.includePersonalData) {
    for (const data of profile.personalData) {
      if (!data.contentText) continue;

      try {
        const chunks = createProfileChunks(
          profile.id,
          data.dataType,
          data.id,
          data.contentText,
          { title: data.title || undefined }
        );

        chunks.forEach((chunk, index) => {
          allChunks.push({
            id: generateVectorId(profile.id, data.dataType, data.id, index),
            text: chunk.text,
            metadata: {
              ...chunk.metadata,
              text: chunk.text,
            },
          });
        });
        totalItems += chunks.length;
      } catch {
        failedItems++;
      }
    }
  }

  // 3. Process Coderz projects
  if (profile.includeProjects) {
    const projects = await prisma.projectV2.findMany({
      where: { createdBy: profile.userId },
      select: {
        id: true,
        title: true,
        description: true,
        technologies: true,
        slug: true,
      },
      take: 50, // Limit for performance
    });

    for (const project of projects) {
      try {
        const chunks = createProjectChunks(profile.id, project.id, {
          title: project.title,
          description: project.description,
          technologies: project.technologies,
          url: `/projects/${project.slug}`,
        });

        chunks.forEach((chunk, index) => {
          allChunks.push({
            id: generateVectorId(profile.id, "PROJECT", project.id, index),
            text: chunk.text,
            metadata: {
              ...chunk.metadata,
              text: chunk.text,
            },
          });
        });
        totalItems += chunks.length;
      } catch {
        failedItems++;
      }
    }
  }

  // 4. Process assessments
  if (profile.includeAssessments) {
    const examAttempts = await prisma.examAttempt.findMany({
      where: { 
        userId: profile.userId,
        passed: true,
      },
      include: {
        exam: {
          select: {
            title: true,
            technology: true,
          },
        },
      },
      take: 20,
    });

    for (const attempt of examAttempts) {
      try {
        const chunks = createAssessmentChunks(profile.id, attempt.id, {
          title: attempt.exam.title,
          technology: attempt.exam.technology,
          score: attempt.score,
          maxScore: 100,
          completedAt: attempt.completedAt || new Date(),
        });

        chunks.forEach((chunk, index) => {
          allChunks.push({
            id: generateVectorId(profile.id, "ASSESSMENT", attempt.id, index),
            text: chunk.text,
            metadata: {
              ...chunk.metadata,
              text: chunk.text,
            },
          });
        });
        totalItems += chunks.length;
      } catch {
        failedItems++;
      }
    }
  }

  // 5. Process external platform data
  if (profile.includePlatformData) {
    for (const data of profile.externalData) {
      try {
        let chunks;
        
        if (data.dataType === "GITHUB_REPO") {
          chunks = createGitHubRepoChunks(profile.id, {
            id: data.id,
            name: data.title || "Unknown",
            description: data.description,
            url: data.url || "",
            languages: data.techStack,
            stars: 0,
            forks: 0,
          });
        } else {
          const text = `${data.title || ""}\n${data.description || ""}`.trim();
          if (!text) continue;
          
          chunks = createProfileChunks(profile.id, data.dataType, data.id, text, {
            title: data.title || undefined,
            techStack: data.techStack,
            url: data.url || undefined,
          });
        }

        chunks.forEach((chunk, index) => {
          allChunks.push({
            id: generateVectorId(profile.id, data.dataType, data.id, index),
            text: chunk.text,
            metadata: {
              ...chunk.metadata,
              text: chunk.text,
            },
          });
        });
        totalItems += chunks.length;
      } catch {
        failedItems++;
      }
    }
  }

  if (allChunks.length === 0) {
    return { totalItems: 0, processedItems: 0, failedItems };
  }

  // Generate embeddings in batches
  const batchSize = 50;
  const vectorsToUpsert: {
    id: string;
    embedding: number[];
    metadata: Record<string, unknown>;
  }[] = [];

  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const texts = batch.map((c) => c.text);

    try {
      const embeddings = await generateEmbeddingsBatch(texts);

      batch.forEach((chunk, index) => {
        if (embeddings[index] && embeddings[index].length > 0) {
          vectorsToUpsert.push({
            id: chunk.id,
            embedding: embeddings[index],
            metadata: chunk.metadata as Record<string, unknown>,
          });
        }
      });
    } catch (error) {
      console.error("Error generating batch embeddings:", error);
      failedItems += batch.length;
    }
  }

  // Upsert to vector database
  if (vectorsToUpsert.length > 0) {
    await upsertVectorsBatch(
      vectorsToUpsert.map((v) => ({
        id: v.id,
        embedding: v.embedding,
        metadata: v.metadata as import("@/types/knowme").EmbeddingMetadata,
      })),
      profile.id
    );

    // Save embedding metadata to database
    const embeddingRecords = vectorsToUpsert.map((v) => ({
      profileId: profile.id,
      sourceType: (v.metadata.sourceType as KnowMeDataType) || "OTHER",
      sourceId: (v.metadata.sourceId as string) || v.id,
      chunkIndex: (v.metadata.chunkIndex as number) || 0,
      chunkText: v.metadata.text as string,
      chunkHash: createContentHash(v.metadata.text as string),
      vectorId: v.id,
      vectorNamespace: profile.id,
      metadata: v.metadata,
      isActive: true,
    }));

    // Delete existing embeddings for this profile
    await prisma.knowMeEmbedding.deleteMany({
      where: { profileId: profile.id },
    });

    // Insert new embeddings
    await prisma.knowMeEmbedding.createMany({
      data: embeddingRecords,
    });
  }

  return {
    totalItems,
    processedItems: vectorsToUpsert.length,
    failedItems,
  };
}

// ============================================
// MANUAL UPDATE ACTIONS
// ============================================

/**
 * Trigger manual embedding update
 */
export async function triggerManualUpdate(): Promise<
  KnowMeActionResponse<void>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user has credits (if required)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user || user.credits < 1) {
      return { success: false, error: "Insufficient credits" };
    }

    // Deduct credit
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: 1 } },
    });

    // Log credit transaction
    await prisma.knowMeCreditTransaction.create({
      data: {
        userId: session.user.id,
        transactionType: "manual_update",
        amount: -1,
        reason: "Manual KnowMe embedding update",
        balanceBefore: user.credits,
        balanceAfter: user.credits - 1,
      },
    });

    // Trigger embedding generation
    const result = await generateProfileEmbeddings();

    if (!result.success) {
      // Refund credit on failure
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { increment: 1 } },
      });
      return result;
    }

    return { success: true, message: "Update completed successfully" };
  } catch (error) {
    console.error("Error triggering manual update:", error);
    return { success: false, error: "Failed to trigger update" };
  }
}

/**
 * Delete all embeddings for current user
 */
export async function deleteAllEmbeddings(): Promise<
  KnowMeActionResponse<void>
> {
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

    // Delete from vector database
    await deleteNamespace(profile.id);

    // Delete from database
    await prisma.knowMeEmbedding.deleteMany({
      where: { profileId: profile.id },
    });

    // Update profile
    await prisma.knowMeProfile.update({
      where: { id: profile.id },
      data: {
        totalEmbeddingsCount: 0,
        lastUpdatedAt: null,
      },
    });

    revalidatePath("/knowme");

    return { success: true, message: "All embeddings deleted" };
  } catch (error) {
    console.error("Error deleting embeddings:", error);
    return { success: false, error: "Failed to delete embeddings" };
  }
}

// ============================================
// JOB STATUS
// ============================================

/**
 * Get embedding job status
 */
export async function getEmbeddingJobStatus(
  jobId: string
): Promise<KnowMeActionResponse<KnowMeEmbeddingJobData>> {
  try {
    const job = await prisma.knowMeEmbeddingJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return { success: false, error: "Job not found" };
    }

    return {
      success: true,
      data: {
        id: job.id,
        jobType: job.jobType,
        status: job.status,
        progress: job.progress,
        totalItems: job.totalItems,
        processedItems: job.processedItems,
        failedItems: job.failedItems,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        errorLogs: job.errorLogs,
      },
    };
  } catch (error) {
    console.error("Error getting job status:", error);
    return { success: false, error: "Failed to get job status" };
  }
}

