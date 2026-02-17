import { prisma } from '@repo/prisma'

// ================================================================================
// LEVEL DEFINITIONS
// ================================================================================
const levels = [
    { level: 1, title: "Code Seedling", xpRequired: 0, xpReward: 0, creditsReward: 0, icon: "🌱", color: "#4ade80", description: "Welcome to your coding journey! Every expert was once a beginner." },
    { level: 2, title: "Code Sprout", xpRequired: 500, xpReward: 50, creditsReward: 10, icon: "🌿", color: "#22c55e", description: "You're starting to grow! Keep nurturing your skills." },
    { level: 3, title: "Code Sapling", xpRequired: 1200, xpReward: 75, creditsReward: 15, icon: "🌳", color: "#16a34a", description: "Your roots are getting stronger. Keep coding!" },
    { level: 4, title: "Bug Squasher", xpRequired: 2000, xpReward: 100, creditsReward: 20, icon: "🐛", color: "#eab308", description: "You've learned to hunt down bugs like a pro." },
    { level: 5, title: "Syntax Scholar", xpRequired: 3000, xpReward: 125, creditsReward: 25, icon: "📚", color: "#3b82f6", description: "Your syntax knowledge is growing impressive." },
    { level: 6, title: "Logic Learner", xpRequired: 4500, xpReward: 150, creditsReward: 30, icon: "🧠", color: "#8b5cf6", description: "You're developing strong logical thinking skills." },
    { level: 7, title: "Function Fanatic", xpRequired: 6000, xpReward: 175, creditsReward: 35, icon: "⚡", color: "#f59e0b", description: "Functions are your new best friend." },
    { level: 8, title: "Algorithm Apprentice", xpRequired: 8000, xpReward: 200, creditsReward: 40, icon: "📊", color: "#06b6d4", description: "You're starting to think in algorithms." },
    { level: 9, title: "Data Dynamo", xpRequired: 10000, xpReward: 225, creditsReward: 45, icon: "💾", color: "#ec4899", description: "Data structures are becoming second nature." },
    { level: 10, title: "Code Craftsman", xpRequired: 13000, xpReward: 250, creditsReward: 50, icon: "🔨", color: "#f97316", description: "You're crafting code with skill and precision." },
    { level: 11, title: "Pattern Prophet", xpRequired: 16000, xpReward: 275, creditsReward: 55, icon: "🔮", color: "#a855f7", description: "You can see patterns where others see chaos." },
    { level: 12, title: "Debug Detective", xpRequired: 20000, xpReward: 300, creditsReward: 60, icon: "🔍", color: "#14b8a6", description: "No bug can hide from your keen eye." },
    { level: 13, title: "API Architect", xpRequired: 25000, xpReward: 350, creditsReward: 70, icon: "🏗️", color: "#0ea5e9", description: "You're building bridges between systems." },
    { level: 14, title: "Database Designer", xpRequired: 30000, xpReward: 400, creditsReward: 80, icon: "🗄️", color: "#6366f1", description: "Your data models are works of art." },
    { level: 15, title: "Framework Fighter", xpRequired: 36000, xpReward: 450, creditsReward: 90, icon: "⚔️", color: "#ef4444", description: "You've mastered multiple frameworks." },
    { level: 16, title: "System Sage", xpRequired: 43000, xpReward: 500, creditsReward: 100, icon: "🏰", color: "#84cc16", description: "You understand how systems work together." },
    { level: 17, title: "Cloud Champion", xpRequired: 51000, xpReward: 550, creditsReward: 110, icon: "☁️", color: "#38bdf8", description: "The cloud is your playground." },
    { level: 18, title: "Security Sentinel", xpRequired: 60000, xpReward: 600, creditsReward: 120, icon: "🛡️", color: "#22d3ee", description: "You protect code from the shadows." },
    { level: 19, title: "Performance Pioneer", xpRequired: 70000, xpReward: 650, creditsReward: 130, icon: "🚀", color: "#f472b6", description: "Speed and efficiency are your hallmarks." },
    { level: 20, title: "Architecture Ace", xpRequired: 82000, xpReward: 700, creditsReward: 140, icon: "🎯", color: "#c084fc", description: "Your architectural decisions are legendary." },
    { level: 21, title: "Innovation Initiator", xpRequired: 95000, xpReward: 750, creditsReward: 150, icon: "💡", color: "#facc15", description: "You bring fresh ideas to every project." },
    { level: 22, title: "Mentor Maven", xpRequired: 110000, xpReward: 800, creditsReward: 160, icon: "👨‍🏫", color: "#4ade80", description: "Others look to you for guidance." },
    { level: 23, title: "Open Source Oracle", xpRequired: 128000, xpReward: 850, creditsReward: 170, icon: "🌐", color: "#60a5fa", description: "The open source world knows your name." },
    { level: 24, title: "Tech Titan", xpRequired: 150000, xpReward: 900, creditsReward: 180, icon: "⚡", color: "#fbbf24", description: "Your technical prowess is unmatched." },
    { level: 25, title: "Code Legend", xpRequired: 175000, xpReward: 1000, creditsReward: 200, icon: "👑", color: "#f59e0b", description: "You have achieved legendary status. Your code will inspire generations." },
    { level: 26, title: "Digital Demigod", xpRequired: 205000, xpReward: 1100, creditsReward: 220, icon: "🔥", color: "#ef4444", description: "Your power over code approaches divine." },
    { level: 27, title: "Algorithm Ascendant", xpRequired: 240000, xpReward: 1200, creditsReward: 240, icon: "✨", color: "#a78bfa", description: "You transcend ordinary algorithmic thinking." },
    { level: 28, title: "Binary Overlord", xpRequired: 280000, xpReward: 1300, creditsReward: 260, icon: "🎭", color: "#2dd4bf", description: "0s and 1s bend to your will." },
    { level: 29, title: "Quantum Coder", xpRequired: 330000, xpReward: 1400, creditsReward: 280, icon: "🌌", color: "#818cf8", description: "Your code exists in multiple states simultaneously." },
    { level: 30, title: "Eternal Engineer", xpRequired: 400000, xpReward: 2000, creditsReward: 500, icon: "💎", color: "#f0abfc", description: "The pinnacle of engineering excellence. Your legacy is eternal." },
]

// ================================================================================
// BADGE DEFINITIONS
// ================================================================================
const badges = [
    // ================================================================================
    // PROJECTS BADGES
    // ================================================================================
    // Tier 1 - Getting Started
    { slug: "first-project", name: "First Steps", description: "Complete your first project on the platform", category: "PROJECTS", rarity: "COMMON", tier: 1, icon: "🎯", color: "#4ade80", bgGradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", requirements: { type: "count", target: "projects_completed", count: 1 }, xpReward: 100, creditsReward: 10, order: 1 },
    { slug: "project-explorer", name: "Project Explorer", description: "Complete 3 different projects", category: "PROJECTS", rarity: "COMMON", tier: 1, icon: "🗺️", color: "#60a5fa", bgGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", requirements: { type: "count", target: "projects_completed", count: 3 }, xpReward: 200, creditsReward: 20, order: 2 },
    // Tier 2 - Building Experience
    { slug: "project-builder", name: "Project Builder", description: "Complete 5 projects", category: "PROJECTS", rarity: "RARE", tier: 2, icon: "🔨", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "count", target: "projects_completed", count: 5 }, xpReward: 400, creditsReward: 40, order: 3 },
    { slug: "sprint-master", name: "Sprint Master", description: "Complete 20 sprints across all projects", category: "PROJECTS", rarity: "RARE", tier: 2, icon: "🏃", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "count", target: "sprints_completed", count: 20 }, xpReward: 350, creditsReward: 35, order: 4 },
    { slug: "task-terminator", name: "Task Terminator", description: "Complete 50 tasks across all projects", category: "PROJECTS", rarity: "RARE", tier: 2, icon: "✅", color: "#34d399", bgGradient: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", requirements: { type: "count", target: "tasks_completed", count: 50 }, xpReward: 300, creditsReward: 30, order: 5 },
    // Tier 3 - Advanced Builder
    { slug: "project-veteran", name: "Project Veteran", description: "Complete 10 projects", category: "PROJECTS", rarity: "EPIC", tier: 3, icon: "⭐", color: "#f472b6", bgGradient: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)", requirements: { type: "count", target: "projects_completed", count: 10 }, xpReward: 750, creditsReward: 75, order: 6 },
    { slug: "quiz-ace", name: "Quiz Ace", description: "Score 95%+ on 10 project quizzes", category: "PROJECTS", rarity: "EPIC", tier: 3, icon: "📝", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "score", target: "project_quiz_high_scores", count: 10, minScore: 95 }, xpReward: 600, creditsReward: 60, order: 7 },
    { slug: "sprint-champion", name: "Sprint Champion", description: "Complete 50 sprints", category: "PROJECTS", rarity: "EPIC", tier: 3, icon: "🏆", color: "#fcd34d", bgGradient: "linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)", requirements: { type: "count", target: "sprints_completed", count: 50 }, xpReward: 700, creditsReward: 70, order: 8 },
    // Tier 4 - Master Level
    { slug: "project-legend", name: "Project Legend", description: "Complete 25 projects", category: "PROJECTS", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "count", target: "projects_completed", count: 25 }, xpReward: 1500, creditsReward: 150, order: 9 },
    { slug: "perfectionist", name: "Perfectionist", description: "Get 100% on 5 project quizzes", category: "PROJECTS", rarity: "LEGENDARY", tier: 4, icon: "💯", color: "#ef4444", bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", requirements: { type: "score", target: "perfect_quiz_scores", count: 5, minScore: 100 }, xpReward: 1200, creditsReward: 120, order: 10 },
    // Tier 5 - Mythic
    { slug: "project-deity", name: "Project Deity", description: "Complete 50 projects", category: "PROJECTS", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "count", target: "projects_completed", count: 50 }, xpReward: 3000, creditsReward: 300, order: 11 },

    // ================================================================================
    // ASSESSMENTS BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-practice", name: "Practice Makes Perfect", description: "Complete your first practice session", category: "ASSESSMENTS", rarity: "COMMON", tier: 1, icon: "📖", color: "#60a5fa", bgGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", requirements: { type: "count", target: "practice_sessions", count: 1 }, xpReward: 50, creditsReward: 5, order: 1 },
    { slug: "first-exam", name: "Exam Warrior", description: "Take your first exam", category: "ASSESSMENTS", rarity: "COMMON", tier: 1, icon: "📋", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "count", target: "exams_taken", count: 1 }, xpReward: 75, creditsReward: 10, order: 2 },
    // Tier 2
    { slug: "practice-pro", name: "Practice Pro", description: "Complete 25 practice sessions", category: "ASSESSMENTS", rarity: "RARE", tier: 2, icon: "🎯", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "count", target: "practice_sessions", count: 25 }, xpReward: 250, creditsReward: 25, order: 3 },
    { slug: "certified-beginner", name: "Certified Beginner", description: "Pass your first certification exam", category: "ASSESSMENTS", rarity: "RARE", tier: 2, icon: "🎓", color: "#4ade80", bgGradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", requirements: { type: "count", target: "certifications_earned", count: 1 }, xpReward: 300, creditsReward: 30, order: 4 },
    { slug: "answer-streak", name: "Answer Streak", description: "Answer 100 questions correctly", category: "ASSESSMENTS", rarity: "RARE", tier: 2, icon: "🔥", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "count", target: "correct_answers", count: 100 }, xpReward: 200, creditsReward: 20, order: 5 },
    // Tier 3
    { slug: "exam-expert", name: "Exam Expert", description: "Pass 10 exams with 85%+ score", category: "ASSESSMENTS", rarity: "EPIC", tier: 3, icon: "🏅", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "score", target: "high_score_exams", count: 10, minScore: 85 }, xpReward: 600, creditsReward: 60, order: 6 },
    { slug: "practice-master", name: "Practice Master", description: "Complete 100 practice sessions", category: "ASSESSMENTS", rarity: "EPIC", tier: 3, icon: "📚", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "practice_sessions", count: 100 }, xpReward: 500, creditsReward: 50, order: 7 },
    { slug: "multi-certified", name: "Multi-Certified", description: "Earn 5 different certifications", category: "ASSESSMENTS", rarity: "EPIC", tier: 3, icon: "🏆", color: "#a855f7", bgGradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)", requirements: { type: "count", target: "certifications_earned", count: 5 }, xpReward: 750, creditsReward: 75, order: 8 },
    // Tier 4
    { slug: "assessment-legend", name: "Assessment Legend", description: "Score 95%+ on 25 exams", category: "ASSESSMENTS", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "score", target: "elite_exam_scores", count: 25, minScore: 95 }, xpReward: 1500, creditsReward: 150, order: 9 },
    { slug: "certification-collector", name: "Certification Collector", description: "Earn 10 certifications", category: "ASSESSMENTS", rarity: "LEGENDARY", tier: 4, icon: "💎", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "count", target: "certifications_earned", count: 10 }, xpReward: 1200, creditsReward: 120, order: 10 },
    // Tier 5
    { slug: "assessment-deity", name: "Assessment Deity", description: "Answer 1000 questions correctly", category: "ASSESSMENTS", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "count", target: "correct_answers", count: 1000 }, xpReward: 3000, creditsReward: 300, order: 11 },

    // ================================================================================
    // CHALLENGES BADGES (Forge & Crucible)
    // ================================================================================
    // Tier 1
    { slug: "first-forge", name: "Forge Initiate", description: "Start your first Forge track", category: "CHALLENGES", rarity: "COMMON", tier: 1, icon: "🔥", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "count", target: "forge_enrollments", count: 1 }, xpReward: 75, creditsReward: 10, order: 1 },
    { slug: "first-crucible", name: "Crucible Challenger", description: "Solve your first Crucible problem", category: "CHALLENGES", rarity: "COMMON", tier: 1, icon: "⚗️", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "count", target: "crucible_problems_solved", count: 1 }, xpReward: 100, creditsReward: 10, order: 2 },
    // Tier 2
    { slug: "forge-apprentice", name: "Forge Apprentice", description: "Complete 10 Forge steps", category: "CHALLENGES", rarity: "RARE", tier: 2, icon: "⚒️", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "count", target: "forge_steps_completed", count: 10 }, xpReward: 250, creditsReward: 25, order: 3 },
    { slug: "crucible-solver", name: "Crucible Solver", description: "Solve 10 Crucible problems", category: "CHALLENGES", rarity: "RARE", tier: 2, icon: "🧪", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "count", target: "crucible_problems_solved", count: 10 }, xpReward: 300, creditsReward: 30, order: 4 },
    { slug: "no-hint-solver", name: "No Hints Needed", description: "Solve 5 Crucible problems without using hints", category: "CHALLENGES", rarity: "RARE", tier: 2, icon: "🧠", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "crucible_no_hint_solves", count: 5 }, xpReward: 350, creditsReward: 35, order: 5 },
    // Tier 3
    { slug: "forge-master", name: "Forge Master", description: "Complete 3 Forge tracks", category: "CHALLENGES", rarity: "EPIC", tier: 3, icon: "🏭", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "count", target: "forge_tracks_completed", count: 3 }, xpReward: 750, creditsReward: 75, order: 6 },
    { slug: "crucible-expert", name: "Crucible Expert", description: "Solve 50 Crucible problems", category: "CHALLENGES", rarity: "EPIC", tier: 3, icon: "🔬", color: "#8b5cf6", bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", requirements: { type: "count", target: "crucible_problems_solved", count: 50 }, xpReward: 600, creditsReward: 60, order: 7 },
    { slug: "speed-demon", name: "Speed Demon", description: "Solve 10 Crucible problems with time bonus", category: "CHALLENGES", rarity: "EPIC", tier: 3, icon: "⚡", color: "#fcd34d", bgGradient: "linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)", requirements: { type: "count", target: "crucible_time_bonus_solves", count: 10 }, xpReward: 500, creditsReward: 50, order: 8 },
    // Tier 4
    { slug: "forge-legend", name: "Forge Legend", description: "Complete 10 Forge tracks", category: "CHALLENGES", rarity: "LEGENDARY", tier: 4, icon: "🗡️", color: "#ef4444", bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", requirements: { type: "count", target: "forge_tracks_completed", count: 10 }, xpReward: 1500, creditsReward: 150, order: 9 },
    { slug: "crucible-champion", name: "Crucible Champion", description: "Reach top 10 on Crucible leaderboard", category: "CHALLENGES", rarity: "LEGENDARY", tier: 4, icon: "🏆", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "rank", target: "crucible_leaderboard", maxRank: 10 }, xpReward: 2000, creditsReward: 200, order: 10 },
    // Tier 5
    { slug: "challenge-deity", name: "Challenge Deity", description: "Solve 200 Crucible problems", category: "CHALLENGES", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "count", target: "crucible_problems_solved", count: 200 }, xpReward: 3000, creditsReward: 300, order: 11 },

    // ================================================================================
    // MOCK INTERVIEWS BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-mock", name: "Interview Ready", description: "Complete your first mock interview", category: "MOCK_INTERVIEWS", rarity: "COMMON", tier: 1, icon: "🎙️", color: "#60a5fa", bgGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", requirements: { type: "count", target: "mock_interviews_completed", count: 1 }, xpReward: 100, creditsReward: 10, order: 1 },
    { slug: "decent-performance", name: "Decent Performance", description: "Score 70%+ on a mock interview", category: "MOCK_INTERVIEWS", rarity: "COMMON", tier: 1, icon: "📊", color: "#4ade80", bgGradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", requirements: { type: "score", target: "mock_score", minScore: 70 }, xpReward: 125, creditsReward: 15, order: 2 },
    // Tier 2
    { slug: "mock-regular", name: "Mock Regular", description: "Complete 5 mock interviews", category: "MOCK_INTERVIEWS", rarity: "RARE", tier: 2, icon: "🎤", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "count", target: "mock_interviews_completed", count: 5 }, xpReward: 250, creditsReward: 25, order: 3 },
    { slug: "good-communicator", name: "Good Communicator", description: "Score 85%+ on communication in 3 mocks", category: "MOCK_INTERVIEWS", rarity: "RARE", tier: 2, icon: "💬", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "score", target: "mock_communication_high", count: 3, minScore: 85 }, xpReward: 300, creditsReward: 30, order: 4 },
    { slug: "tech-talent", name: "Tech Talent", description: "Score 85%+ on technical skills in 3 mocks", category: "MOCK_INTERVIEWS", rarity: "RARE", tier: 2, icon: "💻", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "score", target: "mock_technical_high", count: 3, minScore: 85 }, xpReward: 300, creditsReward: 30, order: 5 },
    // Tier 3
    { slug: "mock-veteran", name: "Mock Veteran", description: "Complete 15 mock interviews", category: "MOCK_INTERVIEWS", rarity: "EPIC", tier: 3, icon: "🎯", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "mock_interviews_completed", count: 15 }, xpReward: 600, creditsReward: 60, order: 6 },
    { slug: "excellent-performance", name: "Excellent Performer", description: "Score 90%+ overall on 5 mock interviews", category: "MOCK_INTERVIEWS", rarity: "EPIC", tier: 3, icon: "🌟", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "score", target: "mock_excellent_scores", count: 5, minScore: 90 }, xpReward: 700, creditsReward: 70, order: 7 },
    { slug: "custom-mock-creator", name: "Custom Creator", description: "Create 3 custom mock interviews", category: "MOCK_INTERVIEWS", rarity: "EPIC", tier: 3, icon: "🎨", color: "#a855f7", bgGradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)", requirements: { type: "count", target: "custom_mocks_created", count: 3 }, xpReward: 400, creditsReward: 40, order: 8 },
    // Tier 4
    { slug: "mock-master", name: "Mock Master", description: "Complete 50 mock interviews", category: "MOCK_INTERVIEWS", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "count", target: "mock_interviews_completed", count: 50 }, xpReward: 1500, creditsReward: 150, order: 9 },
    { slug: "perfect-interview", name: "Perfect Interview", description: "Score 95%+ overall on a mock interview", category: "MOCK_INTERVIEWS", rarity: "LEGENDARY", tier: 4, icon: "💎", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "score", target: "mock_perfect_score", minScore: 95 }, xpReward: 1000, creditsReward: 100, order: 10 },
    // Tier 5
    { slug: "interview-deity", name: "Interview Deity", description: "Complete 100 mock interviews with average 85%+ score", category: "MOCK_INTERVIEWS", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "combined", targets: ["mock_interviews_completed", "mock_average_score"], count: 100, minScore: 85 }, xpReward: 3000, creditsReward: 300, order: 11 },

    // ================================================================================
    // COMMUNITY BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-community", name: "Community Member", description: "Join your first community", category: "COMMUNITY", rarity: "COMMON", tier: 1, icon: "👋", color: "#60a5fa", bgGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", requirements: { type: "count", target: "communities_joined", count: 1 }, xpReward: 50, creditsReward: 5, order: 1 },
    { slug: "first-post", name: "First Post", description: "Create your first community post", category: "COMMUNITY", rarity: "COMMON", tier: 1, icon: "📝", color: "#4ade80", bgGradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", requirements: { type: "count", target: "posts_created", count: 1 }, xpReward: 75, creditsReward: 10, order: 2 },
    { slug: "first-likes", name: "Getting Noticed", description: "Receive 5 likes on your posts", category: "COMMUNITY", rarity: "COMMON", tier: 1, icon: "❤️", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "likes_received", count: 5 }, xpReward: 100, creditsReward: 10, order: 3 },
    // Tier 2
    { slug: "active-poster", name: "Active Poster", description: "Create 20 community posts", category: "COMMUNITY", rarity: "RARE", tier: 2, icon: "✍️", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "count", target: "posts_created", count: 20 }, xpReward: 250, creditsReward: 25, order: 4 },
    { slug: "helpful-member", name: "Helpful Member", description: "Help solve 10 questions in communities", category: "COMMUNITY", rarity: "RARE", tier: 2, icon: "🤝", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "count", target: "questions_helped", count: 10 }, xpReward: 300, creditsReward: 30, order: 5 },
    { slug: "popular-voice", name: "Popular Voice", description: "Receive 50 likes on your posts", category: "COMMUNITY", rarity: "RARE", tier: 2, icon: "📣", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "count", target: "likes_received", count: 50 }, xpReward: 250, creditsReward: 25, order: 6 },
    // Tier 3
    { slug: "community-champion", name: "Community Champion", description: "Create 50 posts and receive 200 likes", category: "COMMUNITY", rarity: "EPIC", tier: 3, icon: "🏆", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "combined", targets: ["posts_created", "likes_received"], counts: [50, 200] }, xpReward: 700, creditsReward: 70, order: 7 },
    { slug: "event-organizer", name: "Event Organizer", description: "Organize 3 community events", category: "COMMUNITY", rarity: "EPIC", tier: 3, icon: "🎉", color: "#a855f7", bgGradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)", requirements: { type: "count", target: "events_organized", count: 3 }, xpReward: 600, creditsReward: 60, order: 8 },
    { slug: "knowledge-sharer", name: "Knowledge Sharer", description: "Share 25 resources in communities", category: "COMMUNITY", rarity: "EPIC", tier: 3, icon: "📚", color: "#10b981", bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", requirements: { type: "count", target: "resources_shared", count: 25 }, xpReward: 500, creditsReward: 50, order: 9 },
    // Tier 4
    { slug: "community-legend", name: "Community Legend", description: "Receive 500 likes and help solve 50 questions", category: "COMMUNITY", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "combined", targets: ["likes_received", "questions_helped"], counts: [500, 50] }, xpReward: 1500, creditsReward: 150, order: 10 },
    { slug: "viral-post", name: "Viral Post", description: "Get a post with 100+ likes", category: "COMMUNITY", rarity: "LEGENDARY", tier: 4, icon: "🔥", color: "#ef4444", bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", requirements: { type: "single", target: "post_likes", count: 100 }, xpReward: 1000, creditsReward: 100, order: 11 },
    // Tier 5
    { slug: "community-deity", name: "Community Deity", description: "Become top contributor in 3 communities", category: "COMMUNITY", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "count", target: "top_contributor_communities", count: 3 }, xpReward: 3000, creditsReward: 300, order: 12 },

    // ================================================================================
    // LearnS BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-Learn", name: "Curious Mind", description: "Complete your first Learn", category: "LearnS", rarity: "COMMON", tier: 1, icon: "💡", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "count", target: "Learns_completed", count: 1 }, xpReward: 50, creditsReward: 5, order: 1 },
    { slug: "Learn-explorer", name: "Learn Explorer", description: "Complete 5 Learns", category: "LearnS", rarity: "COMMON", tier: 1, icon: "🔍", color: "#60a5fa", bgGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", requirements: { type: "count", target: "Learns_completed", count: 5 }, xpReward: 100, creditsReward: 10, order: 2 },
    // Tier 2
    { slug: "Learn-learner", name: "Learn Learner", description: "Complete 20 Learns", category: "LearnS", rarity: "RARE", tier: 2, icon: "📖", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "count", target: "Learns_completed", count: 20 }, xpReward: 250, creditsReward: 25, order: 3 },
    { slug: "Learn-quiz-pro", name: "Learn Quiz Pro", description: "Score 90%+ on 10 Learn quizzes", category: "LearnS", rarity: "RARE", tier: 2, icon: "📝", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "score", target: "Learn_quiz_high", count: 10, minScore: 90 }, xpReward: 300, creditsReward: 30, order: 4 },
    // Tier 3
    { slug: "Learn-master", name: "Learn Master", description: "Complete 50 Learns", category: "LearnS", rarity: "EPIC", tier: 3, icon: "🎓", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "Learns_completed", count: 50 }, xpReward: 600, creditsReward: 60, order: 5 },
    { slug: "multi-category", name: "Multi-Category Expert", description: "Complete Learns in 10 different categories", category: "LearnS", rarity: "EPIC", tier: 3, icon: "🎯", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "count", target: "Learn_categories_completed", count: 10 }, xpReward: 500, creditsReward: 50, order: 6 },
    // Tier 4
    { slug: "Learn-legend", name: "Learn Legend", description: "Complete 100 Learns", category: "LearnS", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "count", target: "Learns_completed", count: 100 }, xpReward: 1500, creditsReward: 150, order: 7 },
    // Tier 5
    { slug: "Learn-deity", name: "Learn Deity", description: "Complete 200 Learns with 95%+ average quiz score", category: "LearnS", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "combined", targets: ["Learns_completed", "Learn_quiz_average"], count: 200, minScore: 95 }, xpReward: 3000, creditsReward: 300, order: 8 },

    // ================================================================================
    // SPACES BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-space", name: "Space Traveler", description: "Join your first learning space", category: "SPACES", rarity: "COMMON", tier: 1, icon: "🚀", color: "#8b5cf6", bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", requirements: { type: "count", target: "spaces_joined", count: 1 }, xpReward: 50, creditsReward: 5, order: 1 },
    { slug: "space-explorer", name: "Space Explorer", description: "Complete 10 space steps", category: "SPACES", rarity: "COMMON", tier: 1, icon: "🌍", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "count", target: "space_steps_completed", count: 10 }, xpReward: 100, creditsReward: 10, order: 2 },
    // Tier 2
    { slug: "space-navigator", name: "Space Navigator", description: "Complete 3 spaces", category: "SPACES", rarity: "RARE", tier: 2, icon: "🧭", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "count", target: "spaces_completed", count: 3 }, xpReward: 300, creditsReward: 30, order: 3 },
    { slug: "space-creator", name: "Space Creator", description: "Create your first learning space", category: "SPACES", rarity: "RARE", tier: 2, icon: "🎨", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "spaces_created", count: 1 }, xpReward: 250, creditsReward: 25, order: 4 },
    // Tier 3
    { slug: "space-captain", name: "Space Captain", description: "Complete 10 spaces", category: "SPACES", rarity: "EPIC", tier: 3, icon: "👨‍🚀", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "count", target: "spaces_completed", count: 10 }, xpReward: 700, creditsReward: 70, order: 5 },
    { slug: "space-architect", name: "Space Architect", description: "Create 5 spaces with 100+ completions total", category: "SPACES", rarity: "EPIC", tier: 3, icon: "🏗️", color: "#a855f7", bgGradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)", requirements: { type: "combined", targets: ["spaces_created", "space_completions_by_others"], counts: [5, 100] }, xpReward: 600, creditsReward: 60, order: 6 },
    // Tier 4
    { slug: "space-legend", name: "Space Legend", description: "Complete 25 spaces", category: "SPACES", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "count", target: "spaces_completed", count: 25 }, xpReward: 1500, creditsReward: 150, order: 7 },
    // Tier 5
    { slug: "space-deity", name: "Space Deity", description: "Create 20 spaces with 500+ total completions", category: "SPACES", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "combined", targets: ["spaces_created", "space_completions_by_others"], counts: [20, 500] }, xpReward: 3000, creditsReward: 300, order: 8 },

    // ================================================================================
    // STUDIO BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-studio", name: "Studio Starter", description: "Create your first studio", category: "STUDIO", rarity: "COMMON", tier: 1, icon: "🎬", color: "#4ade80", bgGradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", requirements: { type: "count", target: "studios_created", count: 1 }, xpReward: 75, creditsReward: 10, order: 1 },
    { slug: "flashcard-fan", name: "Flashcard Fan", description: "Study 50 flashcards", category: "STUDIO", rarity: "COMMON", tier: 1, icon: "🎴", color: "#60a5fa", bgGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", requirements: { type: "count", target: "flashcards_studied", count: 50 }, xpReward: 100, creditsReward: 10, order: 2 },
    // Tier 2
    { slug: "studio-producer", name: "Studio Producer", description: "Create 10 studios", category: "STUDIO", rarity: "RARE", tier: 2, icon: "🎥", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "count", target: "studios_created", count: 10 }, xpReward: 250, creditsReward: 25, order: 3 },
    { slug: "quiz-wizard", name: "Quiz Wizard", description: "Score 90%+ on 20 studio quizzes", category: "STUDIO", rarity: "RARE", tier: 2, icon: "🧙", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "score", target: "studio_quiz_high", count: 20, minScore: 90 }, xpReward: 300, creditsReward: 30, order: 4 },
    { slug: "flashcard-master", name: "Flashcard Master", description: "Study 500 flashcards", category: "STUDIO", rarity: "RARE", tier: 2, icon: "📇", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "count", target: "flashcards_studied", count: 500 }, xpReward: 250, creditsReward: 25, order: 5 },
    // Tier 3
    { slug: "studio-director", name: "Studio Director", description: "Create 50 studios", category: "STUDIO", rarity: "EPIC", tier: 3, icon: "🎞️", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "studios_created", count: 50 }, xpReward: 700, creditsReward: 70, order: 6 },
    { slug: "clone-master", name: "Clone Master", description: "Have your studios cloned 50 times", category: "STUDIO", rarity: "EPIC", tier: 3, icon: "👥", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "count", target: "studio_clones", count: 50 }, xpReward: 500, creditsReward: 50, order: 7 },
    // Tier 4
    { slug: "studio-legend", name: "Studio Legend", description: "Create 100 studios with 200+ total clones", category: "STUDIO", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "combined", targets: ["studios_created", "studio_clones"], counts: [100, 200] }, xpReward: 1500, creditsReward: 150, order: 8 },
    // Tier 5
    { slug: "studio-deity", name: "Studio Deity", description: "Study 2000 flashcards and ace 100 quizzes", category: "STUDIO", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "combined", targets: ["flashcards_studied", "studio_quizzes_aced"], counts: [2000, 100] }, xpReward: 3000, creditsReward: 300, order: 9 },

    // ================================================================================
    // OPEN SOURCE BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-contribution", name: "First Contribution", description: "Make your first open source contribution", category: "OPENSOURCE", rarity: "COMMON", tier: 1, icon: "🌱", color: "#4ade80", bgGradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", requirements: { type: "count", target: "os_contributions", count: 1 }, xpReward: 100, creditsReward: 10, order: 1 },
    { slug: "os-learner", name: "Open Source Learner", description: "Complete 5 open source learning modules", category: "OPENSOURCE", rarity: "COMMON", tier: 1, icon: "📖", color: "#60a5fa", bgGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", requirements: { type: "count", target: "os_modules_completed", count: 5 }, xpReward: 75, creditsReward: 10, order: 2 },
    // Tier 2
    { slug: "contributor", name: "Contributor", description: "Make 10 open source contributions", category: "OPENSOURCE", rarity: "RARE", tier: 2, icon: "💻", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "count", target: "os_contributions", count: 10 }, xpReward: 300, creditsReward: 30, order: 3 },
    { slug: "first-pr-merged", name: "First PR Merged", description: "Get your first pull request merged", category: "OPENSOURCE", rarity: "RARE", tier: 2, icon: "✅", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "count", target: "os_prs_merged", count: 1 }, xpReward: 250, creditsReward: 25, order: 4 },
    { slug: "issue-solver", name: "Issue Solver", description: "Solve 5 open source issues", category: "OPENSOURCE", rarity: "RARE", tier: 2, icon: "🔧", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "count", target: "os_issues_solved", count: 5 }, xpReward: 300, creditsReward: 30, order: 5 },
    { slug: "os-certified", name: "Open Source Certified", description: "Earn your open source certification", category: "OPENSOURCE", rarity: "RARE", tier: 2, icon: "🎓", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "os_certifications", count: 1 }, xpReward: 350, creditsReward: 35, order: 6 },
    // Tier 3
    { slug: "os-veteran", name: "Open Source Veteran", description: "Make 50 contributions and solve 20 issues", category: "OPENSOURCE", rarity: "EPIC", tier: 3, icon: "🏅", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "combined", targets: ["os_contributions", "os_issues_solved"], counts: [50, 20] }, xpReward: 700, creditsReward: 70, order: 7 },
    { slug: "pr-machine", name: "PR Machine", description: "Get 10 pull requests merged", category: "OPENSOURCE", rarity: "EPIC", tier: 3, icon: "⚙️", color: "#a855f7", bgGradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)", requirements: { type: "count", target: "os_prs_merged", count: 10 }, xpReward: 600, creditsReward: 60, order: 8 },
    { slug: "code-reviewer", name: "Code Reviewer", description: "Give 25 code reviews", category: "OPENSOURCE", rarity: "EPIC", tier: 3, icon: "👁️", color: "#10b981", bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", requirements: { type: "count", target: "os_code_reviews", count: 25 }, xpReward: 500, creditsReward: 50, order: 9 },
    // Tier 4
    { slug: "os-legend", name: "Open Source Legend", description: "100 contributions with 25 merged PRs", category: "OPENSOURCE", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "combined", targets: ["os_contributions", "os_prs_merged"], counts: [100, 25] }, xpReward: 1500, creditsReward: 150, order: 10 },
    { slug: "bounty-hunter", name: "Bounty Hunter", description: "Earn $500+ in open source bounties", category: "OPENSOURCE", rarity: "LEGENDARY", tier: 4, icon: "💰", color: "#ef4444", bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", requirements: { type: "amount", target: "os_bounty_earnings", amount: 500 }, xpReward: 2000, creditsReward: 200, order: 11 },
    // Tier 5
    { slug: "os-deity", name: "Open Source Deity", description: "Top contributor to 5 projects with 50 merged PRs", category: "OPENSOURCE", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "combined", targets: ["top_contributor_projects", "os_prs_merged"], counts: [5, 50] }, xpReward: 3000, creditsReward: 300, order: 12 },

    // ================================================================================
    // PATHFINDER BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-goal", name: "Goal Setter", description: "Create your first learning goal", category: "PATHFINDER", rarity: "COMMON", tier: 1, icon: "🎯", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "count", target: "pathfinder_goals_created", count: 1 }, xpReward: 75, creditsReward: 10, order: 1 },
    { slug: "first-subgoal", name: "Breaking It Down", description: "Complete your first daily sub-goal", category: "PATHFINDER", rarity: "COMMON", tier: 1, icon: "📋", color: "#4ade80", bgGradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", requirements: { type: "count", target: "pathfinder_subgoals_completed", count: 1 }, xpReward: 50, creditsReward: 5, order: 2 },
    // Tier 2
    { slug: "goal-achiever", name: "Goal Achiever", description: "Complete your first learning goal", category: "PATHFINDER", rarity: "RARE", tier: 2, icon: "🏆", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "count", target: "pathfinder_goals_completed", count: 1 }, xpReward: 300, creditsReward: 30, order: 3 },
    { slug: "pathfinder-streak", name: "Learning Streak", description: "Maintain a 7-day learning streak in Pathfinder", category: "PATHFINDER", rarity: "RARE", tier: 2, icon: "🔥", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "streak", target: "pathfinder_streak", days: 7 }, xpReward: 250, creditsReward: 25, order: 4 },
    { slug: "verification-pass", name: "Verified Learner", description: "Pass your first goal verification", category: "PATHFINDER", rarity: "RARE", tier: 2, icon: "✅", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "count", target: "pathfinder_verifications_passed", count: 1 }, xpReward: 300, creditsReward: 30, order: 5 },
    // Tier 3
    { slug: "multi-goal", name: "Multi-Goal Master", description: "Complete 5 learning goals", category: "PATHFINDER", rarity: "EPIC", tier: 3, icon: "🎯", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "pathfinder_goals_completed", count: 5 }, xpReward: 700, creditsReward: 70, order: 6 },
    { slug: "pathfinder-month", name: "Month-Long Learner", description: "Maintain a 30-day learning streak", category: "PATHFINDER", rarity: "EPIC", tier: 3, icon: "📅", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "streak", target: "pathfinder_streak", days: 30 }, xpReward: 600, creditsReward: 60, order: 7 },
    { slug: "quiz-crusher", name: "Quiz Crusher", description: "Complete 100 daily quizzes in Pathfinder", category: "PATHFINDER", rarity: "EPIC", tier: 3, icon: "📝", color: "#10b981", bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", requirements: { type: "count", target: "pathfinder_quizzes_completed", count: 100 }, xpReward: 500, creditsReward: 50, order: 8 },
    // Tier 4
    { slug: "pathfinder-legend", name: "Pathfinder Legend", description: "Complete 15 goals with 90%+ verification scores", category: "PATHFINDER", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "combined", targets: ["pathfinder_goals_completed", "pathfinder_high_verification"], counts: [15, 15] }, xpReward: 1500, creditsReward: 150, order: 9 },
    // Tier 5
    { slug: "pathfinder-deity", name: "Pathfinder Deity", description: "Complete 30 goals with 100-day streak", category: "PATHFINDER", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "combined", targets: ["pathfinder_goals_completed", "pathfinder_streak"], counts: [30, 100] }, xpReward: 3000, creditsReward: 300, order: 10 },

    // ================================================================================
    // LAUNCHPADS BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-product", name: "Product Creator", description: "Submit your first product to Launchpads", category: "LAUNCHPADS", rarity: "COMMON", tier: 1, icon: "🚀", color: "#8b5cf6", bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", requirements: { type: "count", target: "products_submitted", count: 1 }, xpReward: 100, creditsReward: 10, order: 1 },
    // Tier 2
    { slug: "product-approved", name: "Approved Product", description: "Get your first product approved", category: "LAUNCHPADS", rarity: "RARE", tier: 2, icon: "✅", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "count", target: "products_approved", count: 1 }, xpReward: 250, creditsReward: 25, order: 2 },
    { slug: "product-views", name: "Getting Attention", description: "Get 100 views on your products", category: "LAUNCHPADS", rarity: "RARE", tier: 2, icon: "👀", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "count", target: "product_views", count: 100 }, xpReward: 200, creditsReward: 20, order: 3 },
    // Tier 3
    { slug: "popular-product", name: "Popular Product", description: "Get 500 views and 50 likes on a single product", category: "LAUNCHPADS", rarity: "EPIC", tier: 3, icon: "🔥", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "single_combined", targets: ["product_views", "product_likes"], counts: [500, 50] }, xpReward: 700, creditsReward: 70, order: 4 },
    { slug: "multi-launcher", name: "Multi-Launcher", description: "Get 5 products approved", category: "LAUNCHPADS", rarity: "EPIC", tier: 3, icon: "🎯", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "products_approved", count: 5 }, xpReward: 600, creditsReward: 60, order: 5 },
    // Tier 4
    { slug: "featured-product", name: "Featured Creator", description: "Have a product featured on Launchpads", category: "LAUNCHPADS", rarity: "LEGENDARY", tier: 4, icon: "⭐", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "count", target: "products_featured", count: 1 }, xpReward: 1500, creditsReward: 150, order: 6 },
    // Tier 5
    { slug: "launchpad-deity", name: "Launchpad Deity", description: "10 approved products with 2000+ total views", category: "LAUNCHPADS", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "combined", targets: ["products_approved", "total_product_views"], counts: [10, 2000] }, xpReward: 3000, creditsReward: 300, order: 7 },

    // ================================================================================
    // COLLECTIVE BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-proposal", name: "Proposal Maker", description: "Submit your first collective proposal", category: "COLLECTIVE", rarity: "COMMON", tier: 1, icon: "📜", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "count", target: "proposals_submitted", count: 1 }, xpReward: 100, creditsReward: 10, order: 1 },
    { slug: "voter", name: "Active Voter", description: "Vote on 10 proposals", category: "COLLECTIVE", rarity: "COMMON", tier: 1, icon: "🗳️", color: "#60a5fa", bgGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", requirements: { type: "count", target: "votes_cast", count: 10 }, xpReward: 75, creditsReward: 10, order: 2 },
    // Tier 2
    { slug: "proposal-approved", name: "Proposal Approved", description: "Get your first proposal approved", category: "COLLECTIVE", rarity: "RARE", tier: 2, icon: "✅", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "count", target: "proposals_approved", count: 1 }, xpReward: 300, creditsReward: 30, order: 3 },
    { slug: "challenge-participant", name: "Challenge Participant", description: "Complete your first collective challenge", category: "COLLECTIVE", rarity: "RARE", tier: 2, icon: "🏃", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "count", target: "collective_challenges_completed", count: 1 }, xpReward: 250, creditsReward: 25, order: 4 },
    // Tier 3
    { slug: "influential-voice", name: "Influential Voice", description: "Get 3 proposals approved", category: "COLLECTIVE", rarity: "EPIC", tier: 3, icon: "📢", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "count", target: "proposals_approved", count: 3 }, xpReward: 700, creditsReward: 70, order: 5 },
    { slug: "challenge-champion", name: "Challenge Champion", description: "Top performer in 3 collective challenges", category: "COLLECTIVE", rarity: "EPIC", tier: 3, icon: "🏆", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "challenge_top_performance", count: 3 }, xpReward: 600, creditsReward: 60, order: 6 },
    // Tier 4
    { slug: "collective-legend", name: "Collective Legend", description: "10 approved proposals and 50 votes cast", category: "COLLECTIVE", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "combined", targets: ["proposals_approved", "votes_cast"], counts: [10, 50] }, xpReward: 1500, creditsReward: 150, order: 7 },
    // Tier 5
    { slug: "collective-deity", name: "Collective Deity", description: "Shape the platform with 25 approved proposals", category: "COLLECTIVE", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "count", target: "proposals_approved", count: 25 }, xpReward: 3000, creditsReward: 300, order: 8 },

    // ================================================================================
    // PORTFOLIO BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-portfolio-project", name: "Portfolio Starter", description: "Add your first portfolio project", category: "PORTFOLIO", rarity: "COMMON", tier: 1, icon: "💼", color: "#4ade80", bgGradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", requirements: { type: "count", target: "portfolio_projects_added", count: 1 }, xpReward: 75, creditsReward: 10, order: 1 },
    // Tier 2
    { slug: "portfolio-builder", name: "Portfolio Builder", description: "Add 5 portfolio projects", category: "PORTFOLIO", rarity: "RARE", tier: 2, icon: "🏗️", color: "#60a5fa", bgGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", requirements: { type: "count", target: "portfolio_projects_added", count: 5 }, xpReward: 250, creditsReward: 25, order: 2 },
    { slug: "detailed-portfolio", name: "Detail Oriented", description: "Add descriptions, links, and media to 3 projects", category: "PORTFOLIO", rarity: "RARE", tier: 2, icon: "📝", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "count", target: "detailed_portfolio_projects", count: 3 }, xpReward: 200, creditsReward: 20, order: 3 },
    // Tier 3
    { slug: "portfolio-master", name: "Portfolio Master", description: "Add 10 portfolio projects with full details", category: "PORTFOLIO", rarity: "EPIC", tier: 3, icon: "🎯", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "count", target: "detailed_portfolio_projects", count: 10 }, xpReward: 600, creditsReward: 60, order: 4 },
    // Tier 4
    { slug: "portfolio-legend", name: "Portfolio Legend", description: "Build a portfolio with 20 impressive projects", category: "PORTFOLIO", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "count", target: "portfolio_projects_added", count: 20 }, xpReward: 1500, creditsReward: 150, order: 5 },

    // ================================================================================
    // CONSISTENCY BADGES (Streaks)
    // ================================================================================
    // Tier 1
    { slug: "first-streak", name: "Getting Started", description: "Maintain a 3-day activity streak", category: "CONSISTENCY", rarity: "COMMON", tier: 1, icon: "🔥", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "streak", target: "activity_streak", days: 3 }, xpReward: 50, creditsReward: 5, order: 1 },
    { slug: "week-streak", name: "Week Warrior", description: "Maintain a 7-day activity streak", category: "CONSISTENCY", rarity: "COMMON", tier: 1, icon: "📅", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "streak", target: "activity_streak", days: 7 }, xpReward: 100, creditsReward: 10, order: 2 },
    // Tier 2
    { slug: "two-week-streak", name: "Fortnight Fighter", description: "Maintain a 14-day activity streak", category: "CONSISTENCY", rarity: "RARE", tier: 2, icon: "⚔️", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "streak", target: "activity_streak", days: 14 }, xpReward: 200, creditsReward: 20, order: 3 },
    { slug: "month-streak", name: "Month Master", description: "Maintain a 30-day activity streak", category: "CONSISTENCY", rarity: "RARE", tier: 2, icon: "🗓️", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "streak", target: "activity_streak", days: 30 }, xpReward: 350, creditsReward: 35, order: 4 },
    // Tier 3
    { slug: "quarter-streak", name: "Quarter Conqueror", description: "Maintain a 90-day activity streak", category: "CONSISTENCY", rarity: "EPIC", tier: 3, icon: "🏅", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "streak", target: "activity_streak", days: 90 }, xpReward: 750, creditsReward: 75, order: 5 },
    // Tier 4
    { slug: "half-year-streak", name: "Six Month Samurai", description: "Maintain a 180-day activity streak", category: "CONSISTENCY", rarity: "LEGENDARY", tier: 4, icon: "⚡", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "streak", target: "activity_streak", days: 180 }, xpReward: 1500, creditsReward: 150, order: 6 },
    // Tier 5
    { slug: "year-streak", name: "Yearly Legend", description: "Maintain a 365-day activity streak", category: "CONSISTENCY", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "streak", target: "activity_streak", days: 365 }, xpReward: 5000, creditsReward: 500, order: 7 },

    // ================================================================================
    // SOCIAL BADGES
    // ================================================================================
    // Tier 1
    { slug: "first-follower", name: "First Follower", description: "Get your first follower", category: "SOCIAL", rarity: "COMMON", tier: 1, icon: "👋", color: "#60a5fa", bgGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", requirements: { type: "count", target: "followers_gained", count: 1 }, xpReward: 50, creditsReward: 5, order: 1 },
    { slug: "networker", name: "Networker", description: "Follow 10 other users", category: "SOCIAL", rarity: "COMMON", tier: 1, icon: "🤝", color: "#4ade80", bgGradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", requirements: { type: "count", target: "following_count", count: 10 }, xpReward: 50, creditsReward: 5, order: 2 },
    // Tier 2
    { slug: "growing-following", name: "Growing Following", description: "Reach 25 followers", category: "SOCIAL", rarity: "RARE", tier: 2, icon: "📈", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "count", target: "followers_gained", count: 25 }, xpReward: 200, creditsReward: 20, order: 3 },
    { slug: "engaged-user", name: "Engaged User", description: "Give 100 likes across the platform", category: "SOCIAL", rarity: "RARE", tier: 2, icon: "❤️", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "count", target: "likes_given", count: 100 }, xpReward: 150, creditsReward: 15, order: 4 },
    // Tier 3
    { slug: "popular-user", name: "Popular User", description: "Reach 100 followers", category: "SOCIAL", rarity: "EPIC", tier: 3, icon: "🌟", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "count", target: "followers_gained", count: 100 }, xpReward: 600, creditsReward: 60, order: 5 },
    { slug: "super-engager", name: "Super Engager", description: "Give 500 likes and 100 comments", category: "SOCIAL", rarity: "EPIC", tier: 3, icon: "💬", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "combined", targets: ["likes_given", "comments_made"], counts: [500, 100] }, xpReward: 500, creditsReward: 50, order: 6 },
    // Tier 4
    { slug: "influencer", name: "Platform Influencer", description: "Reach 500 followers", category: "SOCIAL", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "count", target: "followers_gained", count: 500 }, xpReward: 1500, creditsReward: 150, order: 7 },
    // Tier 5
    { slug: "social-deity", name: "Social Deity", description: "Reach 1000 followers", category: "SOCIAL", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "count", target: "followers_gained", count: 1000 }, xpReward: 3000, creditsReward: 300, order: 8 },

    // ================================================================================
    // MILESTONE BADGES (XP & Level based)
    // ================================================================================
    // Tier 1
    { slug: "xp-starter", name: "XP Starter", description: "Earn your first 500 XP", category: "MILESTONE", rarity: "COMMON", tier: 1, icon: "⚡", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "xp", amount: 500 }, xpReward: 50, creditsReward: 5, order: 1 },
    { slug: "level-5", name: "Level 5 Achiever", description: "Reach level 5", category: "MILESTONE", rarity: "COMMON", tier: 1, icon: "5️⃣", color: "#4ade80", bgGradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", requirements: { type: "level", level: 5 }, xpReward: 100, creditsReward: 10, order: 2 },
    // Tier 2
    { slug: "xp-collector", name: "XP Collector", description: "Earn 5,000 total XP", category: "MILESTONE", rarity: "RARE", tier: 2, icon: "💫", color: "#a78bfa", bgGradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)", requirements: { type: "xp", amount: 5000 }, xpReward: 200, creditsReward: 20, order: 3 },
    { slug: "level-10", name: "Double Digits", description: "Reach level 10", category: "MILESTONE", rarity: "RARE", tier: 2, icon: "🔟", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "level", level: 10 }, xpReward: 250, creditsReward: 25, order: 4 },
    // Tier 3
    { slug: "xp-hoarder", name: "XP Hoarder", description: "Earn 25,000 total XP", category: "MILESTONE", rarity: "EPIC", tier: 3, icon: "✨", color: "#ec4899", bgGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", requirements: { type: "xp", amount: 25000 }, xpReward: 500, creditsReward: 50, order: 5 },
    { slug: "level-20", name: "Level 20 Elite", description: "Reach level 20", category: "MILESTONE", rarity: "EPIC", tier: 3, icon: "🏅", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "level", level: 20 }, xpReward: 700, creditsReward: 70, order: 6 },
    // Tier 4
    { slug: "xp-master", name: "XP Master", description: "Earn 100,000 total XP", category: "MILESTONE", rarity: "LEGENDARY", tier: 4, icon: "💎", color: "#f59e0b", bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", requirements: { type: "xp", amount: 100000 }, xpReward: 1500, creditsReward: 150, order: 7 },
    { slug: "level-25", name: "Quarter Century", description: "Reach level 25 - Code Legend status", category: "MILESTONE", rarity: "LEGENDARY", tier: 4, icon: "👑", color: "#ef4444", bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", requirements: { type: "level", level: 25 }, xpReward: 1000, creditsReward: 100, order: 8 },
    // Tier 5
    { slug: "xp-deity", name: "XP Deity", description: "Earn 500,000 total XP", category: "MILESTONE", rarity: "MYTHIC", tier: 5, icon: "🌟", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "xp", amount: 500000 }, xpReward: 5000, creditsReward: 500, order: 9 },
    { slug: "level-30", name: "Eternal Engineer", description: "Reach level 30 - The pinnacle of achievement", category: "MILESTONE", rarity: "MYTHIC", tier: 5, icon: "💎", color: "#f0abfc", bgGradient: "linear-gradient(135deg, #f0abfc 0%, #d946ef 100%)", requirements: { type: "level", level: 30 }, xpReward: 2000, creditsReward: 200, order: 10 },

    // ================================================================================
    // SPECIAL BADGES (Limited, Events)
    // ================================================================================
    { slug: "early-adopter", name: "Early Adopter", description: "Joined the platform in its early days", category: "SPECIAL", rarity: "RARE", tier: 2, icon: "🌅", color: "#f97316", bgGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", requirements: { type: "join_date", before: "2024-06-01" }, xpReward: 500, creditsReward: 50, order: 1, isLimited: true },
    { slug: "bug-reporter", name: "Bug Reporter", description: "Report a verified bug on the platform", category: "SPECIAL", rarity: "RARE", tier: 2, icon: "🐛", color: "#ef4444", bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", requirements: { type: "count", target: "verified_bug_reports", count: 1 }, xpReward: 300, creditsReward: 30, order: 2 },
    { slug: "feedback-champion", name: "Feedback Champion", description: "Submit 10 helpful feedback items", category: "SPECIAL", rarity: "EPIC", tier: 3, icon: "💬", color: "#22d3ee", bgGradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", requirements: { type: "count", target: "helpful_feedback", count: 10 }, xpReward: 600, creditsReward: 60, order: 3 },
    { slug: "referral-master", name: "Referral Master", description: "Refer 10 friends who become active users", category: "SPECIAL", rarity: "EPIC", tier: 3, icon: "👥", color: "#a855f7", bgGradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)", requirements: { type: "count", target: "active_referrals", count: 10 }, xpReward: 1000, creditsReward: 100, order: 4 },
    { slug: "completionist", name: "Completionist", description: "Earn at least one badge from every category", category: "SPECIAL", rarity: "LEGENDARY", tier: 4, icon: "🎖️", color: "#fbbf24", bgGradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", requirements: { type: "category_completion", allCategories: true }, xpReward: 2000, creditsReward: 200, order: 5 },
    { slug: "platform-legend", name: "Platform Legend", description: "Earn 100 badges across all categories", category: "SPECIAL", rarity: "MYTHIC", tier: 5, icon: "🏆", color: "#c084fc", bgGradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)", requirements: { type: "count", target: "total_badges", count: 100 }, xpReward: 5000, creditsReward: 500, order: 6 },
]

// ================================================================================
// SEED FUNCTION
// ================================================================================
export async function seedAchievements() {
    console.log('🏆 Seeding achievements system...\n')

    // Seed Levels
    console.log('📊 Seeding levels...')
    for (const level of levels) {
        await prisma.level.upsert({
            where: { level: level.level },
            update: {
                title: level.title,
                xpRequired: level.xpRequired,
                xpReward: level.xpReward,
                creditsReward: level.creditsReward,
                description: level.description,
                icon: level.icon,
                color: level.color,
            },
            create: {
                level: level.level,
                title: level.title,
                xpRequired: level.xpRequired,
                xpReward: level.xpReward,
                creditsReward: level.creditsReward,
                description: level.description,
                icon: level.icon,
                color: level.color,
            },
        })
    }
    console.log(`✅ Seeded ${levels.length} levels`)

    // Seed Badges
    console.log('🎖️ Seeding badges...')
    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { slug: badge.slug },
            update: {
                name: badge.name,
                description: badge.description,
                category: badge.category as any,
                rarity: badge.rarity as any,
                tier: badge.tier,
                icon: badge.icon,
                color: badge.color,
                bgGradient: badge.bgGradient,
                requirements: badge.requirements,
                xpReward: badge.xpReward,
                creditsReward: badge.creditsReward,
                order: badge.order,
                isLimited: badge.isLimited || false,
            },
            create: {
                slug: badge.slug,
                name: badge.name,
                description: badge.description,
                category: badge.category as any,
                rarity: badge.rarity as any,
                tier: badge.tier,
                icon: badge.icon,
                color: badge.color,
                bgGradient: badge.bgGradient,
                requirements: badge.requirements,
                xpReward: badge.xpReward,
                creditsReward: badge.creditsReward,
                order: badge.order,
                isLimited: badge.isLimited || false,
            },
        })
    }
    console.log(`✅ Seeded ${badges.length} badges`)

    console.log('\n🎉 Achievements system seeded successfully!')
}

export { levels, badges }