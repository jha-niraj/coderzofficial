// Studio Types - Centralized type definitions for the Studio feature

// =========================================
// Enums (matching Prisma schema)
// =========================================

export type StudioCategory =
    | "PROGRAMMING"
    | "WEB_DEVELOPMENT"
    | "DATA_SCIENCE"
    | "MOBILE_DEVELOPMENT"
    | "DEVOPS"
    | "SYSTEM_DESIGN"
    | "INTERVIEW_PREP"
    | "PROJECT_NOTES"
    | "TUTORIAL"
    | "COURSE_NOTES"
    | "GENERAL"
    | "OTHER";
export type StudioBlockType =
    | "TEXT"
    | "HEADING"
    | "CODE"
    | "QUIZ"
    | "FLASHCARD"
    | "IMAGE"
    | "VIDEO"
    | "PRACTICE"
    | "MOCK_INTERVIEW"
    | "EMBED"
    | "DIVIDER"
    | "CALLOUT"
    | "BULLET_LIST"
    | "NUMBERED_LIST";

export type StudioVisibility = "PRIVATE" | "PUBLIC" | "COMMUNITY";

export type StudioMediaType = "IMAGE" | "VIDEO" | "DIAGRAM" | "UPLOAD";

// =========================================
// Block Editor Types
// =========================================

export interface EditorBlock {
    id: string;
    type: string;
    content?: string;
    data?: BlockData;
}

export interface BlockData {
    quizId?: string;
    flashcardDeckId?: string;
    codeBlockId?: string;
    mediaBlockId?: string;
    language?: string;
    level?: number;
    checked?: boolean;
    items?: string[];
    imageUrl?: string;
    prompt?: string;
    topic?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface BlockContent {
    blocks: EditorBlock[];
}

// =========================================
// Quiz Types
// =========================================

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export interface StudioQuiz {
    id: string;
    blockId: string;
    title: string;
    questions: QuizQuestion[];
    timeLimit?: number;
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    studioId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface StudioQuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    score: number;
    maxScore: number;
    answers: Record<string, number>;
    timeTaken?: number;
    createdAt: Date;
}

// =========================================
// Flashcard Types
// =========================================

export interface FlashCard {
    id: string;
    front: string;
    back: string;
    hint?: string;
}

export interface StudioFlashcardDeck {
    id: string;
    blockId: string;
    title: string;
    cards: FlashCard[];
    studioId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FlashcardProgress {
    correct: number;
    incorrect: number;
    lastSeen: Date;
}

export interface StudioFlashcardSession {
    id: string;
    deckId: string;
    userId: string;
    cardsStudied: number;
    correctCount: number;
    studyTime: number;
    cardProgress: Record<string, FlashcardProgress>;
    createdAt: Date;
}

// =========================================
// Code Block Types
// =========================================

export interface CodeTestCase {
    input: string;
    expectedOutput: string;
}

export interface StudioCodeBlock {
    id: string;
    blockId: string;
    language: string;
    code: string;
    isPractice: boolean;
    problemTitle?: string;
    problemDescription?: string;
    testCases?: CodeTestCase[];
    hints: string[];
    solution?: string;
    studioId: string;
    createdAt: Date;
    updatedAt: Date;
}

// =========================================
// Media Block Types
// =========================================

export interface StudioMediaBlock {
    id: string;
    blockId: string;
    type: StudioMediaType;
    url: string;
    prompt?: string;
    width?: number;
    height?: number;
    duration?: number;
    studioId: string;
    createdAt: Date;
}

// =========================================
// Chat Message Types
// =========================================

export type ChatRole = "user" | "assistant";

export interface StudioChatMessage {
    id: string;
    studioId: string;
    role: ChatRole;
    content: string;
    createdAt: Date;
}

// =========================================
// User Types (for Studio context)
// =========================================

export interface StudioUser {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
}

// =========================================
// Main Studio Types
// =========================================

export interface StudioListItem {
    id: string;
    slug: string | null;
    title: string;
    description: string | null;
    emoji?: string;
    coverImage?: string;
    category: StudioCategory;
    tags: string[];
    visibility: StudioVisibility;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        quizzes: number;
        flashcardDecks: number;
        codeBlocks: number;
    };
}

export interface Studio {
    id: string;
    slug: string | null;
    title: string;
    description: string | null;
    emoji?: string;
    coverImage?: string;
    content: BlockContent;
    category: StudioCategory;
    tags: string[];
    visibility: StudioVisibility;
    isTemplate: boolean;
    views: number;
    clones: number;
    likes: number;
    userId: string;
    projectId?: string;
    createdAt: Date;
    updatedAt: Date;
    lastEditedAt: Date;
    user: StudioUser;
    quizzes: StudioQuiz[];
    flashcardDecks: StudioFlashcardDeck[];
    codeBlocks: StudioCodeBlock[];
    mediaBlocks: StudioMediaBlock[];
    chatHistory: StudioChatMessage[];
}

// =========================================
// Component Props Types
// =========================================

export interface StudioEditorProps {
    studio: Studio;
}

export interface StudioBlockEditorProps {
    studioId: string;
    content: BlockContent | null;
    onChange: (content: BlockContent) => void;
    quizzes: StudioQuiz[];
    flashcardDecks: StudioFlashcardDeck[];
    codeBlocks: StudioCodeBlock[];
    mediaBlocks: StudioMediaBlock[];
}

export interface StudioAIPanelProps {
    studioId: string;
    initialMessages: StudioChatMessage[];
}

export interface StudioQuizBlockProps {
    quiz?: {
        id: string;
        title: string;
        questions: QuizQuestion[];
    };
    topic?: string;
}

export interface StudioFlashcardBlockProps {
    deck?: {
        id: string;
        title: string;
        cards: FlashCard[];
    };
    topic?: string;
}

export interface StudioCodeBlockProps {
    codeBlock?: StudioCodeBlock;
    language?: string;
    initialCode?: string;
    onSave?: (code: string, language: string) => void;
}

export interface StudioImageBlockProps {
    mediaBlock?: StudioMediaBlock;
    onGenerate?: (prompt: string) => Promise<string | null>;
}

// =========================================
// Action Response Types
// =========================================

export interface StudioActionResponse<T = undefined> {
    success?: boolean;
    error?: string;
    data?: T;
}

export interface CreateStudioData {
    title: string;
    description?: string;
    category: StudioCategory;
    visibility: StudioVisibility;
}

export interface UpdateStudioData {
    title?: string;
    description?: string;
    content?: BlockContent;
    category?: StudioCategory;
    tags?: string[];
    visibility?: StudioVisibility;
}

// =========================================
// Slash Command Types
// =========================================

export interface SlashCommand {
    type: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    isAI?: boolean;
    comingSoon?: boolean;
}

// =========================================
// Category UI Helper
// =========================================

export const STUDIO_CATEGORIES: { value: StudioCategory; label: string }[] = [
    { value: "PROGRAMMING", label: "Programming" },
    { value: "WEB_DEVELOPMENT", label: "Web Development" },
    { value: "DATA_SCIENCE", label: "Data Science" },
    { value: "MOBILE_DEVELOPMENT", label: "Mobile Development" },
    { value: "DEVOPS", label: "DevOps" },
    { value: "SYSTEM_DESIGN", label: "System Design" },
    { value: "INTERVIEW_PREP", label: "Interview Prep" },
    { value: "PROJECT_NOTES", label: "Project Notes" },
    { value: "TUTORIAL", label: "Tutorial" },
    { value: "COURSE_NOTES", label: "Course Notes" },
    { value: "GENERAL", label: "General" },
    { value: "OTHER", label: "Other" },
];

export const getCategoryColor = (category: StudioCategory): string => {
    const colors: Record<StudioCategory, string> = {
        PROGRAMMING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        WEB_DEVELOPMENT: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        DATA_SCIENCE: "bg-green-500/10 text-green-600 dark:text-green-400",
        MOBILE_DEVELOPMENT: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
        DEVOPS: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
        SYSTEM_DESIGN: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        INTERVIEW_PREP: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
        PROJECT_NOTES: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        TUTORIAL: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
        COURSE_NOTES: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        GENERAL: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
        OTHER: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
    };
    return colors[category] || colors.OTHER;
};