// Practice module server actions

// Core CRUD + data fetching
export {
    getProblemsForModule,
    getProblemBySlug,
    getCategoriesForModule,
    getOrCreateSession,
    saveSessionProgress,
    updateSessionAfterAssess,
    getModuleProgress,
    getLeaderboard,
    getUserPracticeStats,
} from "./practice.action";

// AI Assessment & Mentor
export { assessPracticeWork, getMentorResponse } from "./assess.action";

// Voice (ElevenLabs STT/TTS)
export { getScribeToken, generateTTSAudio } from "./voice.action";