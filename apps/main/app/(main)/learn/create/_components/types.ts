
import { LearnStepType } from "@repo/prisma/client";

export interface StepBlock {
    id: string;
    localId: string;
    order: number;
    title: string;
    type: LearnStepType;
    content: string;
    stepData?: Record<string, unknown>;
    tips: string[];
    codeBlocks: {
        id?: string;
        order: number;
        title: string;
        language: string;
        code: string;
        explanation: string;
        isRunnable: boolean
    }[];
    isExpanded: boolean;
    isSaved: boolean;
    isSaving: boolean;
    isGenerating: boolean;
}