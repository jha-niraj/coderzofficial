// Types for the Request Body for the SignUp:
export interface RequestBody {
    name: string;
    email: string;
    password: string;
    referralCode: string;
}

// User related types
export interface UserInfo {
    id: string
    name?: string
    email: string
    emailVerified?: boolean
    image?: string
    role?: "Student" | "Admin" | "Instructor"
    gender?: string
    phone?: string
    yearofbirth?: string
    bio?: string
    university?: string
    location?: string
    company?: string
    occupation?: string
    website?: string
    title?: string
    xp?: number
    credits?: number
    referralCode?: string
    referralCount?: number
    createdAt?: Date
    updatedAt?: Date
    
    // Social links
    socials?: {
        instagram?: string
        linkedin?: string
        twitter?: string
        facebook?: string
        github?: string
        youtube?: string
    }
    // For compatibility with existing code
    socialLinks?: {
        instagram?: string
        linkedin?: string
        twitter?: string
        facebook?: string
        github?: string
        youtube?: string
    }
    
    // Arrays of interests
    interests?: string[]
    
    // Skills and certifications
    Skill?: UserSkill[]
    skills?: UserSkill[]
    certifications?: UserCertification[]
    
    // Learning related
    courses?: UserCourse[]
    learningPaths?: UserLearningPath[]
    
    // Open source contributions
    openSourceContributions?: OpenSourceContribution[]
    openSourceRankings?: OpenSourceRanking[]
    
    // Other fields
    followers?: number
    following?: number
    eventsCreated?: number
    eventsParticipated?: number
    creatorStatus?: "VERIFIED" | "PENDING" | "NONE"
    organizationVerified?: boolean
    
    // Recent activity and achievements
    recentActivity?: RecentActivity[]
    achievements?: Achievement[]
}

export interface UserSkill {
    id: string
    name: string
    level: number
    userId?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface UserCertification {
    id: string
    name: string
    issuer: string
    issueDate: Date | string
    userId?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface UserCourse {
    id: string
    title: string
    progress: number
    lastAccessed?: Date | string
}

export interface UserLearningPath {
    id: string
    name: string
    progress: number
    completedCourses: number
    totalCourses: number
}

export interface OpenSourceContribution {
    id: string
    projectName: string
    repositoryUrl: string
    contributionType: string
    description: string
    prUrl?: string
    commitUrl?: string
    status: string
    points: number
    createdAt?: Date
    updatedAt?: Date
}

export interface OpenSourceRanking {
    position: number
    score: number
    level: string
}

export interface RecentActivity {
    id: string
    activityType: string
    description: string
    timestamp: Date
}

export interface Achievement {
    id: string
    name: string
    description: string
    earnedAt: Date
    icon?: string
}

// Skills and certifications data
export interface UserData {
    skills: {
        name: string
        level: number
    }[]
    certifications: {
        name: string
        issuer: string
        issueDate: Date
    }[]
}

export interface Certification {
    name: string
    issuer: string
    issueDate: Date
}

// Types and Interface for the Quiz Component:
export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}
export interface UnitQuiz {
    title: string;
    questions: QuizQuestion[];
}

// Types for the Project Page:
type DifficultyLevel = "All" | "Beginner" | "Intermediate" | "Advanced";
export interface Project {
    id: string;
    title: string;
    description: string;
    difficulty: DifficultyLevel;
    tags: string[];
    techStack: string[];
    requirements: string[];
    expectedOutput: string;
    learningBenefits: string[];
    evaluationCriteria: string[];
    extensions: string[];
    prerequisites: string[];
    resources: {
        name: string;
        link: string;
    }[];
    approvalCriteria: string[];
    image: string | null;
    category: string;
}
export interface UserProjectList {
    projects: {
        projectId: string;
        isSubmitted: boolean;
        isApproved: boolean;
    }[]
}
export interface ProjectCardProps {
    project: Project;
    index: number;
    onClick: (project: Project) => void;
}
export interface ProjectModalProps {
    project: Project;
    onClose: () => void;
}
export interface UserProjectProps {
    id: string;
    userId: string;
    submittedBy: string;
    projectId: string;
    projectName: string;
    githubUrl?: string | null;
    liveUrl?: string | null;
    isSubmitted: boolean;
    isApproved: boolean;
    submissionDate?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface categoryDataProps {
    title: string;
    description: string;
    icon: string;
    accent: string;
}
export interface ProjectDataProps {
    [category: string]: Project[]
}

// Types for the Pathway Page:
export type Pathway = {
    title: string;
    description: string;
    color: string;
    niche: string;
    domain: string;
    careers: {
        title: string;
        description: string;
        skills: string;
        opportunities: string;
    }[],
    challenges: {
        title: string;
        description: string;
        opportunity: string;
    }[],
    skills: {
        name: string;
        description: string;
    }[],
    trends: {
        name: string;
        description: string;
    }[]
};
export interface PathwayDetailsProps {
    pathway: Pathway;
    onBack: () => void;
}

// Interface and Types for the Viva and Interview Questions:
export interface SubjectProps {
    title: string;
    description: string;
}
export interface QuestionProps {
    id: string;
    question: string;
    description: string;
    points?: string[];
    code?: string | null;
}

// Interview Preparation Types:
export type Difficulty = "Easy" | "Medium" | "Hard";

export type Question = {
    id: string;
    title: string;
    leetcodeLink: string;
    gfgLink: string;
    companies: string[];
    difficulty: Difficulty;
    category: string;
};


// New Projects Types and Interfaces:
export interface Project {
    id: string
    title: string
    description: string
    category: string
    difficult: string
    techStack: string[]
    estimatedTime: string
    completions: number
    progress: number
    isPremium: boolean
}
export interface Category {
    id: string
    name: string
}
export interface CodeSnippet {
    language: string
    content: string
    filename?: string
}
export interface Step {
    title: string
    description: string
    code?: CodeSnippet
}
export interface ExpectedOutput {
    type: "text" | "code" | "image"
    content: string
    language?: string
}
export interface CommonIssue {
    problem: string
    solution: string
}
export interface Resource {
    type: "documentation" | "video" | "article" | "link"
    title: string
    description: string
    url: string
}
export interface Task {
    title: string
    description: string
    objectives?: string[]
    steps?: Step[]
    tips?: string[]
    expectedOutput?: ExpectedOutput
    commonIssues?: CommonIssue[]
    resources?: Resource[]
}

// Re-export assessment types
export * from './assessment'