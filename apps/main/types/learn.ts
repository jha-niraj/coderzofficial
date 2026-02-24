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
    estimatedTime?: number | null;
    tags: string[];
    mainCategory?: { id: string; name: string; slug: string } | null;
    subCategory?: { id: string; name: string; slug: string } | null;
    author?: { id: string; name: string | null; image: string | null } | null;
    _count?: { steps?: number; completions?: number };
    [key: string]: unknown;
}

export interface LearnProgressItem {
    id: string;
    learn: {
        id: string;
        title: string;
        slug: string;
        iconEmoji?: string | null;
        _count?: { steps?: number };
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface LearnSearchResult {
    id: string;
    title: string;
    iconEmoji: string | null;
    slug: string;
    difficulty: string;
    mainCategory?: { name: string } | null;
}
