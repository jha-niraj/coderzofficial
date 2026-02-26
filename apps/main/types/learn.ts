// Learn Module Types

export interface LearnSubCategory {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    _count?: { learns?: number };
    [key: string]: unknown;
}

export interface LearnCategory {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    _count?: { learns?: number };
    subCategories: LearnSubCategory[];
    [key: string]: unknown;
}

export interface LearnListItem {
    id: string;
    slug: string;
    title: string;
    description: string;
    difficulty: string;
    iconEmoji?: string | null;
    thumbnail?: string | null;
    category?: string;
    estimatedTime?: number | null;
    tags: string[];
    viewCount?: number;
    likeCount?: number;
    createdAt?: Date;
    mainCategory?: { id: string; name: string; slug: string } | null;
    subCategory?: { id: string; name: string; slug: string } | null;
    author?: { id: string; name: string | null; image: string | null } | null;
    creator?: {
        id: string;
        name?: string | null;
        username?: string | null;
        image?: string | null;
    };
    _count?: { steps?: number; completions?: number; likes?: number; comments?: number };
}

export interface LearnProgressItem {
    id: string;
    learnId?: string;
    progressPercent?: number;
    isCompleted?: boolean;
    lastAccessedAt?: Date;
    learn: {
        id: string;
        title: string;
        slug: string;
        iconEmoji?: string | null;
        thumbnail?: string | null;
        difficulty?: string;
        estimatedTime?: number | null;
        category?: string;
        _count?: { steps?: number };
    };
}

export interface LearnSearchResult {
    id: string;
    title: string;
    iconEmoji: string | null;
    slug: string;
    difficulty: string;
    mainCategory?: { name: string } | null;
}
