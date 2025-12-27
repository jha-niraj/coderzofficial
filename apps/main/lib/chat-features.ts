// Chat Feature Configuration System

export type ChatFeatureType =
    | 'JOBINTERVIEWASSISTANT'
    | 'QUIZ'
    | 'STUDYPLAN'
    | 'BUGHUNT'
    | 'MOCKINTERVIEW'
    | 'GENERAL';

export interface ChatFeatureConfig {
    name: string;
    description: string;
    icon: string;
    baseCredits: number;
    requiredFields: string[];
    optionalFields: string[];
    examples: string[];
    handler: string; // Function name to handle this feature
    category: 'ai-tools' | 'learning' | 'assessment' | 'practice';
    isActive: boolean;
}

export const CHAT_FEATURES: Record<ChatFeatureType, ChatFeatureConfig> = {
    JOBINTERVIEWASSISTANT: {
        name: "Job Interview Assistant",
        description: "Generate personalized interview questions for any position",
        icon: "💼",
        baseCredits: 5,
        requiredFields: ["title", "description"],
        optionalFields: ["company", "answers", "practice", "technicalCount", "behavioralCount", "codingCount"],
        examples: [
            "@jobinterviewassistant title: Software Engineer, description: Build web applications using React and Node.js",
            "@jobinterviewassistant Create questions for Frontend Developer position at Google, include answers and practice mode",
            "@jobinterviewassistant title: Data Scientist, description: Analyze large datasets and build ML models, company: https://netflix.com, answers: yes"
        ],
        handler: "handleJobInterviewFeature",
        category: "ai-tools",
        isActive: true
    },
    QUIZ: {
        name: "Quiz Generator",
        description: "Create custom quizzes on any programming topic",
        icon: "🧠",
        baseCredits: 3,
        requiredFields: ["topic", "difficulty"],
        optionalFields: ["questions", "type", "timeLimit", "isPublic"],
        examples: [
            "@quiz topic: JavaScript fundamentals, difficulty: intermediate, questions: 15",
            "@quiz Create a React Hooks quiz with 20 questions, advanced difficulty",
            "@quiz topic: Data Structures, difficulty: beginner, questions: 10, type: multiple-choice"
        ],
        handler: "handleQuizFeature",
        category: "assessment",
        isActive: true
    },
    STUDYPLAN: {
        name: "Study Plan Generator",
        description: "Create personalized learning paths for any topic",
        icon: "📚",
        baseCredits: 8,
        requiredFields: ["topic", "level"],
        optionalFields: ["duration", "goals", "preferences", "timePerDay"],
        examples: [
            "@studyplan topic: Full Stack Development, level: beginner, duration: 3 months",
            "@studyplan Create a study plan for Machine Learning, intermediate level, 2 hours per day",
            "@studyplan topic: System Design, level: advanced, duration: 6 weeks, goals: FAANG interviews"
        ],
        handler: "handleStudyPlanFeature",
        category: "learning",
        isActive: false // Will be implemented later
    },
    BUGHUNT: {
        name: "BugHunt Challenge",
        description: "Create debugging challenges and practice code detective skills",
        icon: "🐛",
        baseCredits: 4,
        requiredFields: ["track", "difficulty"],
        optionalFields: ["visibility", "language", "topic"],
        examples: [
            "@bughunt track: DSA, difficulty: INVESTIGATOR, language: JavaScript",
            "@bughunt Create a debugging challenge for React components, difficulty: HUNTER",
            "@bughunt track: DEVELOPMENT, difficulty: ROOKIE, topic: API integration, visibility: public"
        ],
        handler: "handleBugHuntFeature",
        category: "practice",
        isActive: true
    },
    MOCKINTERVIEW: {
        name: "Mock Interview",
        description: "Schedule and conduct practice interviews with AI or peers",
        icon: "🎤",
        baseCredits: 15,
        requiredFields: ["type", "position"],
        optionalFields: ["duration", "difficulty", "company", "interviewStyle"],
        examples: [
            "@mockinterview type: AI, position: Software Engineer, duration: 45 minutes",
            "@mockinterview Schedule a peer interview for Data Scientist role at Meta",
            "@mockinterview type: expert, position: Frontend Developer, difficulty: senior, company: Google"
        ],
        handler: "handleMockInterviewFeature",
        category: "practice",
        isActive: false // Will be implemented later
    },
    GENERAL: {
        name: "General Chat",
        description: "General conversation and help",
        icon: "💬",
        baseCredits: 0,
        requiredFields: [],
        optionalFields: [],
        examples: [
            "How does the platform work?",
            "What features are available?",
            "Help me choose the right tool for interview preparation"
        ],
        handler: "handleGeneralChat",
        category: "ai-tools",
        isActive: true
    }
};

// Quick access arrays for UI components
export const ACTIVE_FEATURES = Object.entries(CHAT_FEATURES)
    .filter(([, config]) => config.isActive)
    .map(([type, config]) => ({ type: type as ChatFeatureType, ...config }));

export const FEATURES_BY_CATEGORY = ACTIVE_FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
        acc[feature.category] = [];
    }
    acc[feature.category]!.push(feature);
    return acc;
}, {} as Record<string, typeof ACTIVE_FEATURES>);

// Feature detection patterns
export const FEATURE_PATTERNS: Record<ChatFeatureType, RegExp> = {
    JOBINTERVIEWASSISTANT: /@jobinterviewassistant|@interview|job.?interview|interview.?questions/i,
    QUIZ: /@quiz|create.?quiz|quiz.?generator|test.?questions/i,
    STUDYPLAN: /@studyplan|study.?plan|learning.?path|roadmap/i,
    BUGHUNT: /@bughunt|bug.?hunt|debugging.?challenge|code.?detective/i,
    MOCKINTERVIEW: /@mockinterview|mock.?interview|practice.?interview/i,
    GENERAL: /.*/ // Fallback pattern
};

// Cost calculation helpers
export function calculateFeatureCost(
    featureType: ChatFeatureType,
    options: Record<string, unknown> = {}
): { total: number; breakdown: Array<{ item: string; cost: number }> } {
    const config = CHAT_FEATURES[featureType];
    const base = config.baseCredits;
    const breakdown = [{ item: `${config.name} (Base)`, cost: base }];
    let total = base;

    // Feature-specific cost calculations
    switch (featureType) {
        case 'JOBINTERVIEWASSISTANT':
            if (options.answers) {
                const answerCost = 3;
                breakdown.push({ item: "Sample Answers", cost: answerCost });
                total += answerCost;
            }
            if (options.practice) {
                const practiceCost = 2;
                breakdown.push({ item: "Practice Mode", cost: practiceCost });
                total += practiceCost;
            }
            break;

        case 'QUIZ': {
            const questionCount = (options.questions as number) || 10;
            if (questionCount > 10) {
                const extraCost = Math.ceil((questionCount - 10) / 5);
                breakdown.push({ item: `Extra Questions (${questionCount - 10})`, cost: extraCost });
                total += extraCost;
            }
            break;
        }

        case 'BUGHUNT':
            if (options.visibility === 'private') {
                const privateCost = 2;
                breakdown.push({ item: "Private Challenge", cost: privateCost });
                total += privateCost;
            }
            break;
    }

    return { total, breakdown };
}

// Feature suggestion system
export function suggestFeatures(message: string): ChatFeatureType[] {
    const suggestions: ChatFeatureType[] = [];
    const lowerMessage = message.toLowerCase();

    // Check for explicit feature mentions
    for (const [featureType, pattern] of Object.entries(FEATURE_PATTERNS)) {
        if (pattern.test(message) && featureType !== 'GENERAL') {
            suggestions.push(featureType as ChatFeatureType);
        }
    }

    // Contextual suggestions based on keywords
    if (lowerMessage.includes('interview') || lowerMessage.includes('job') || lowerMessage.includes('position')) {
        if (!suggestions.includes('JOBINTERVIEWASSISTANT')) {
            suggestions.push('JOBINTERVIEWASSISTANT');
        }
    }

    if (lowerMessage.includes('quiz') || lowerMessage.includes('test') || lowerMessage.includes('question')) {
        if (!suggestions.includes('QUIZ')) {
            suggestions.push('QUIZ');
        }
    }

    if (lowerMessage.includes('bug') || lowerMessage.includes('debug') || lowerMessage.includes('error')) {
        if (!suggestions.includes('BUGHUNT')) {
            suggestions.push('BUGHUNT');
        }
    }

    // Return unique suggestions, prioritizing active features
    return [...new Set(suggestions)].filter(type => CHAT_FEATURES[type].isActive);
} 