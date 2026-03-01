export type CoverLetterQuestionType = "TEXTAREA" | "SINGLE" | "MULTIPLE";

export interface CoverLetterQuestion {
    id: string;
    text: string;
    type: CoverLetterQuestionType;
    options?: string[]; // Only for SINGLE/MULTIPLE
}

export interface CoverLetterHistoryItem {
    id: string;
    companyName: string | null;
    jobTitle: string | null;
    createdAt: Date;
}

export interface CoverLetterGenerationData {
    jobUrl: string;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    tone: string;
    questions: CoverLetterQuestion[];
    answers: Record<string, string | string[]>;
}

export interface CoverLetterRecord {
    id: string;
    userId: string;
    jobUrl: string;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    tone: string;
    questions: any; // Prisma JsonValue maps to any or Prisma.JsonValue, but we will use unknown/any for ease, or specific types if cast
    answers: any;
    generatedContent: string;
    createdAt: Date;
    updatedAt: Date;
}