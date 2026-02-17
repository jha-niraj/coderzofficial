
import {
    LearnDifficulty, LearnStatus, LearnStepType
} from "@repo/prisma/client";

export interface LearnFormData {
    title: string;
    description: string;
    difficulty: LearnDifficulty;
    tags?: string[];
    thumbnail?: string;
    coverImage?: string;
    iconEmoji?: string;
    accentColor?: string;
    estimatedTime?: number;
    prerequisites?: string[];
    metaTitle?: string;
    metaDescription?: string;
    // Hierarchical category IDs
    mainCategoryId?: string;
    subCategoryId?: string;
}

export interface LearnStepFormData {
    order: number;
    title: string;
    type: LearnStepType;
    content: string;
    // Type-specific JSON data (polymorphic)
    stepData?: Record<string, unknown>;
    tips?: string[];
}

export interface CodeBlockFormData {
    order: number;
    title?: string;
    language: string;
    code: string;
    explanation?: string;
    highlightLines?: number[];
    showLineNumbers?: boolean;
    isRunnable?: boolean;
}

export interface LearnFilters {
    search?: string;
    mainCategoryId?: string;  // For hierarchical filtering
    subCategoryId?: string;   // For hierarchical filtering
    difficulty?: LearnDifficulty;
    status?: LearnStatus;
    tags?: string[];
    sortBy?: "latest" | "popular" | "views" | "likes";
    page?: number;
    limit?: number;
}