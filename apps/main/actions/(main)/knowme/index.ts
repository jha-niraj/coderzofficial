/**
 * KnowMe Server Actions - Main Export
 * 
 * This file exports all KnowMe server actions for easy importing
 */

// Profile actions
export {
  getMyKnowMeProfile,
  getKnowMeProfileByUsername,
  initializeKnowMeProfile,
  updateKnowMeProfile,
  activateKnowMeProfile,
  updateOnboardingStep,
  deleteKnowMeProfile,
  hasKnowMeProfile,
} from "./profile.action";

// Chat actions
export {
  getOrCreateChatSession,
  sendChatMessage,
  getChatHistory,
  submitMessageFeedback,
  endChatSession,
} from "./chat.action";

// Embedding actions
export {
  generateProfileEmbeddings,
  triggerManualUpdate,
  deleteAllEmbeddings,
  getEmbeddingJobStatus,
} from "./embeddings.action";

// Analytics actions
export {
  getKnowMeAnalytics,
  exportAnalyticsData,
} from "./analytics.action";

// Data management actions
export {
  getPersonalData,
  addPersonalData,
  updatePersonalData,
  deletePersonalData,
  getPlatformConnections,
  connectPlatform,
  disconnectPlatform,
  syncPlatformData,
  syncAllPlatforms,
} from "./data.action";

// API management actions
export {
  getApiConfig,
  toggleApiAccess,
  regenerateApiKey,
  updateApiRateLimit,
  getApiUsageStats,
  getRecentApiRequests,
  validateApiRequest,
  recordApiRequest,
} from "./api.action";