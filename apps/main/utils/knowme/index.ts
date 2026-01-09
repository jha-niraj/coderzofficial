/**
 * KnowMe Utilities - Main Export File
 * 
 * This module provides all utility functions for the KnowMe feature:
 * - Embedding generation (OpenAI)
 * - Vector database operations (Upstash)
 * - Text chunking for embeddings
 * - AI response generation (RAG)
 * - Helper functions
 */

// Embedding utilities
export {
  generateEmbedding,
  generateEmbeddingsBatch,
  generateChunkEmbedding,
  cosineSimilarity,
  estimateTokenCount,
  isWithinLimits,
  EMBEDDING_CONFIG,
} from "./embeddings";

// Vector database utilities
export {
  upsertVector,
  upsertVectorsBatch,
  queryVectors,
  deleteVector,
  deleteVectorsBatch,
  deleteNamespace,
  getVector,
  getNamespaceStats,
  checkVectorDbConnection,
  queryByFilter,
  VECTOR_CONFIG,
} from "./vector-db";

// Chunking utilities
export {
  chunkText,
  createProfileChunks,
  createProjectChunks,
  createAssessmentChunks,
  createGitHubRepoChunks,
  createResumeChunks,
  createBioChunks,
  estimateChunkTokens,
  CHUNK_CONFIG,
} from "./chunking";

// AI response generation
export {
  buildSystemPrompt,
  formatContextForPrompt,
  extractSources,
  generateResponse,
  generateNoContextResponse,
  categorizeQuestion as categorizeQuestionAI,
  enhanceResponseWithCTAs,
  AI_CONFIG,
} from "./ai-response";

// Helper functions
export {
  generateApiKey,
  hashApiKey,
  verifyApiKey,
  generateSessionToken,
  createContentHash,
  shouldResetRateLimit,
  calculateNextUpdate,
  formatRelativeDate,
  sanitizeForEmbedding,
  extractKeywords,
  categorizeQuestion,
  calculateTrend,
  truncateText,
  isValidProfileUrl,
  extractUsernameFromUrl,
  generateVectorId,
  parseVectorId,
  getCreditsRequired,
  hasEnoughCredits,
  generateInsight,
} from "./helpers";

