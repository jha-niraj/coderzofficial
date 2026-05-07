/**
 * TypeScript-compatible enum re-exports from Drizzle pgEnum definitions.
 * Replaces the Prisma-generated enum types/values previously in @repo/prisma/client.
 *
 * Usage: import { SkillCategory, PathfinderCategory, ... } from "@repo/db"
 */

import {
    featureNotifySectionEnum,
    skillCategoryEnum,
    feedbackCategoryEnum,
    feedbackStatusEnum,
    creditTypeEnum,
    creditRequestStatusEnum,
    resourceTypeEnum,
    paymentStatusEnum,
    activityTypeEnum,
    currencyEnum,
    roleEnum,
    mockCategoryEnum,
} from "./schema/schema";
import {
    pathfinderCategoryEnum,
    pathfinderLevelEnum,
    pathfinderStatusEnum,
    verificationSectionStatusEnum,
    pathfinderVerifications,
} from "./schema/pathfinder";
import {
    knowMeDataTypeEnum,
    knowMeQuestionCategoryEnum,
    knowMeViewerTypeEnum,
} from "./schema/knowme";
import { questionDifficultyEnum } from "./schema/assessments";

function makeEnum<T extends readonly [string, ...string[]]>(
    pgEnumObj: { enumValues: T }
): { [K in T[number]]: K } {
    return Object.fromEntries(
        pgEnumObj.enumValues.map((v) => [v, v])
    ) as { [K in T[number]]: K };
}

export const FeatureNotifySection = makeEnum(featureNotifySectionEnum);
export type FeatureNotifySection = typeof featureNotifySectionEnum.enumValues[number];

export const SkillCategory = makeEnum(skillCategoryEnum);
export type SkillCategory = typeof skillCategoryEnum.enumValues[number];

export const FeedbackCategory = makeEnum(feedbackCategoryEnum);
export type FeedbackCategory = typeof feedbackCategoryEnum.enumValues[number];

export const FeedbackStatus = makeEnum(feedbackStatusEnum);
export type FeedbackStatus = typeof feedbackStatusEnum.enumValues[number];

export const CreditType = makeEnum(creditTypeEnum);
export type CreditType = typeof creditTypeEnum.enumValues[number];

export const CreditRequestStatus = makeEnum(creditRequestStatusEnum);
export type CreditRequestStatus = typeof creditRequestStatusEnum.enumValues[number];

export const ResourceType = makeEnum(resourceTypeEnum);
export type ResourceType = typeof resourceTypeEnum.enumValues[number];

export const PaymentStatus = makeEnum(paymentStatusEnum);
export type PaymentStatus = typeof paymentStatusEnum.enumValues[number];

export const ActivityType = makeEnum(activityTypeEnum);
export type ActivityType = typeof activityTypeEnum.enumValues[number];

export const Currency = makeEnum(currencyEnum);
export type Currency = typeof currencyEnum.enumValues[number];

export const Role = makeEnum(roleEnum);
export type Role = typeof roleEnum.enumValues[number];

export const MockCategory = makeEnum(mockCategoryEnum);
export type MockCategory = typeof mockCategoryEnum.enumValues[number];

export const PathfinderCategory = makeEnum(pathfinderCategoryEnum);
export type PathfinderCategory = typeof pathfinderCategoryEnum.enumValues[number];

export const PathfinderLevel = makeEnum(pathfinderLevelEnum);
export type PathfinderLevel = typeof pathfinderLevelEnum.enumValues[number];

export const PathfinderStatus = makeEnum(pathfinderStatusEnum);
export type PathfinderStatus = typeof pathfinderStatusEnum.enumValues[number];

export const VerificationSectionStatus = makeEnum(verificationSectionStatusEnum);
export type VerificationSectionStatus = typeof verificationSectionStatusEnum.enumValues[number];

export const KnowMeDataType = makeEnum(knowMeDataTypeEnum);
export type KnowMeDataType = typeof knowMeDataTypeEnum.enumValues[number];

export const KnowMeQuestionCategory = makeEnum(knowMeQuestionCategoryEnum);
export type KnowMeQuestionCategory = typeof knowMeQuestionCategoryEnum.enumValues[number];

export const KnowMeViewerType = makeEnum(knowMeViewerTypeEnum);
export type KnowMeViewerType = typeof knowMeViewerTypeEnum.enumValues[number];

export const QuestionDifficulty = makeEnum(questionDifficultyEnum);
export type QuestionDifficulty = typeof questionDifficultyEnum.enumValues[number];

// Model type exports (replacing Prisma model types)
export type PathfinderVerification = typeof pathfinderVerifications.$inferSelect;
