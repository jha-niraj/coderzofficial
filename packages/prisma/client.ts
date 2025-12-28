/**
 * Re-export all types, enums, and utilities from @prisma/client
 * This file serves as the central export point for all Prisma types
 * 
 * Import pattern: import { Role, User, Prisma } from "@repo/prisma/client"
 */

// Re-export everything from Prisma Client (all enums, types, and Prisma namespace)
export * from "@prisma/client";

// Types Export
export type {
    Prisma   
} from "@prisma/client"

// Enums exports for User and other models
export {
    Prisma as PrismaValue,
    Role,
    ContributionStatus,
    ContributionType,
    OpenSourceDifficulty,
    IssueDifficulty,
    SyncStatus,
    MockCategory,
    MockLevel,
    ProjectTier,
    ProjectStatus,
    SkillCategory,
    FeedbackCategory,
    FeedbackStatus,
    CreditType,
    CreditRequestStatus,
    ResourceType,
    PaymentStatus,
    ActivityType,
    PitchSessionStatus,
    Currency,
    PlanLevel,
    PlanPreference,
    TaskType,
    ContestStatus,
    PeerToPeerSessionStatus,
    QuizCategory,
    QuestionType,
    QuizStatus,
    QuestionStatus,
    MockType,
    ProgressStatus,
    XpTransactionProps,
    GoalType,
    ChallengeVisibility,
    ChallengeStatus,
    BadgeType,
    BadgeCategory,

    // Concepts Enums and Types
    ConceptCategory,
    ConceptDifficulty,
    ConceptStatus,
    ConceptStepType,
    ConceptRequestStatus,

    // Admin Enums and Types
    AdminRole,
    AdminStatus,
    AdminInviteStatus,

    // Assessment Enums and Types
    AssessmentMode,
    AssessmentType,
    QuestionDifficulty,
    AssessmentLanguage,
    AssessmentQuestionType,

    // Challange Enums and Types
    UserContentStatus,
    ChallengeTrackLevel,
    ChallengeTrackStatus,
    CrucibleEventStatus,
    StepSubmissionStatus,

    // Chat Enums and Types
    FollowRequestStatus,
    ChatMessageType,
    ChatMessageStatus,

    // Collective Enums and Types
    ProposalStatus,
    CollectiveChallengeStatus,
    ChallengeStepType,
    SubmissionStatus,

    // Communities Enums and Types
    CommunityType,
    CommunityVisibility,
    CommunityRole,
    CommunityChannelType,
    CommunityPostType,
    CommunityResourceType,
    CommunityEventStatus,
    AttendeeStatus,
    PeerSessionType,
    PeerSessionStatus,

    // Open Source Enums and Types
    OSProjectType,
    OSProjectStatus,
    OSIssueStatus,
    OSIssueDifficulty,
    OSContributionType,
    OSContributionStatus,
    OSLearnModuleType,
    OSCertificationStatus,

    // Projects Enums and Types
    ProjectV2Visibility,
    ProjectV2Difficulty,
    UserProjectV2Status,
    TaskKanbanStatus,
    QuizV2Difficulty,
    FeatureSuggestionType,
    FeatureSuggestionStatus,
    SuggestionSource,
    ProjectErrorSeverity,
    ProjectErrorCategory,
    ProjectErrorStatus,
    ProjectIdeaStatus,

    // Studio Enums and Types
    StudioCategory,
    StudioBlockType,
    StudioVisibility,
    StudioMediaType
} from "@prisma/client";