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

    // Learns Enums and Types
    LearnDifficulty,
    LearnStatus,
    LearnStepType,
    LearnRequestStatus,

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

    // Chat Enums and Types
    FollowRequestStatus,
    ChatMessageType,
    ChatMessageStatus,

    // Communities Enums and Types
    CommunityType,
    CommunityVisibility,
    CommunityRole,
    CommunityPostType,
    CommunityResourceType,
    CommunityEventStatus,
    AttendeeStatus,

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
    StudioMediaType,

    // Space Enums and Types
    SpaceVisibility,
    SpaceCategory,
    SpaceMemberRole,
    SpaceStepContentType,
    SpaceStepStatus,
    SpaceBranchVisibility,
    SpaceActivityType,

    // KnowMe Enums and Types
    KnowMeStatus,
    KnowMePrivacy,
    KnowMePlatform,
    KnowMeSyncStatus,
    KnowMeDataType,
    KnowMeJobStatus,
    KnowMeJobType,
    KnowMeQuestionCategory,
    KnowMeViewerType,

    // Hiring - FlowSync Enums and Types:
    CompanyMemberRole,
    CompanyMemberJobTitle,
    CompanyVerificationStatus,
    MemberInviteStatus,
    CompanyInvitationStatus,
    HiringSubscriptionPlan,
    HiringSubscriptionStatus,
    HiringPaymentStatus,
    HiringInvoiceStatus,
    JobLocationType,
    EmploymentType,
    JobStatus,
    JobVisibility,
    ApplicationStatus,
    ApplicationActivityType,
    InterviewRoundType,
    InterviewFormat,
    JobMockSessionType,
    JobMockStatus,
    TemplateStyle,
    TemplateCategory,

    // University - Academia Enums and Types:
    UniversityType,
    UniversityMemberRole,
    UniversityMemberJobTitle,
    UniversityVerificationStatus,
    UniversityMemberInviteStatus,
    StudentVerificationStatus,
    UniversityAssignmentType,
    UniversityAssignmentStatus,
    SubmissionGradingStatus,
    SemesterType,
    UniversityJobVisibility,
    UniversitySubscriptionPlan,
    UniversitySubscriptionStatus,

    // Practice Module Enums and Types:
    PracticeModule,
    PracticeDifficulty,
    PracticeSessionStatus,
    PracticeMode,

    // Credits Module:
    Module,

} from "@prisma/client";