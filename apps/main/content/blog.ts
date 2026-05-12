export interface BlogPost {
    slug: string
    title: string
    description: string
    publishedAt: string
    updatedAt?: string
    author: string          // key from authors.ts
    ogImage: string         // path under /og/blog/
    heroImage: string       // same as ogImage usually
    category: string
    tags: string[]
    readingTime: number     // minutes
    featured?: boolean
}

export const allPosts: BlogPost[] = [
    {
        slug: 'software-engineering-portfolio-guide',
        title: 'How to Build a Software Engineering Portfolio That Gets You Hired in 2025',
        description: 'A complete guide to building a software engineering portfolio from scratch — what to include, what to skip, and how to make recruiters take notice in a crowded market.',
        publishedAt: '2025-05-01',
        author: 'niraj',
        ogImage: '/og/blog/portfolio-hero.png',
        heroImage: '/og/blog/portfolio-hero.png',
        category: 'Career',
        tags: ['portfolio', 'career', 'software engineering', 'job search', 'github'],
        readingTime: 12,
        featured: true,
    },
    {
        slug: 'system-design-interview-prep',
        title: 'System Design Interview Prep: The Complete Roadmap for CS Students',
        description: 'Everything you need to crack system design interviews — from fundamentals to scalability patterns. A structured, week-by-week preparation plan used by engineers at FAANG.',
        publishedAt: '2025-05-05',
        author: 'niraj',
        ogImage: '/og/blog/system-design-hero.png',
        heroImage: '/og/blog/system-design-hero.png',
        category: 'Interview Prep',
        tags: ['system design', 'interview prep', 'software architecture', 'scalability', 'FAANG'],
        readingTime: 14,
        featured: true,
    },
    {
        slug: 'open-source-contribution-beginners',
        title: 'How to Get Your First Open Source Pull Request Merged: A Beginner\'s Guide',
        description: 'The step-by-step playbook for making your first meaningful open source contribution — from finding the right project to getting your PR merged and your profile noticed.',
        publishedAt: '2025-05-07',
        author: 'niraj',
        ogImage: '/og/blog/opensource-hero.png',
        heroImage: '/og/blog/opensource-hero.png',
        category: 'Open Source',
        tags: ['open source', 'github', 'pull request', 'contribution', 'beginners'],
        readingTime: 11,
    },
    {
        slug: 'ats-resume-software-engineer',
        title: 'ATS Resume Guide for Software Engineers: Beat the Bots and Get Interviews',
        description: 'How Applicant Tracking Systems actually work, what they filter out, and exactly how to format your software engineering resume to land interviews at top tech companies.',
        publishedAt: '2025-05-09',
        author: 'niraj',
        ogImage: '/og/blog/resume-hero.png',
        heroImage: '/og/blog/resume-hero.png',
        category: 'Resume',
        tags: ['ATS', 'resume', 'software engineer', 'job application', 'recruiter'],
        readingTime: 13,
        featured: true,
    },
    {
        slug: 'mock-technical-interview-guide',
        title: 'Mock Technical Interviews: Practice Strategies That Actually Improve Your Performance',
        description: 'Why most technical interview practice is a waste of time — and the deliberate practice framework that engineers use to go from struggling to confident in 4 weeks.',
        publishedAt: '2025-05-11',
        author: 'niraj',
        ogImage: '/og/blog/interview-hero.png',
        heroImage: '/og/blog/interview-hero.png',
        category: 'Interview Prep',
        tags: ['mock interview', 'technical interview', 'coding interview', 'practice', 'preparation'],
        readingTime: 12,
    },
    {
        slug: 'dsa-study-plan-coding-interview',
        title: 'The 3-Month DSA Study Plan to Crack Any Coding Interview',
        description: 'A battle-tested, week-by-week DSA study plan for CS students preparing for technical interviews. Covers arrays, trees, graphs, DP, and everything in between — with the right problem list.',
        publishedAt: '2025-05-12',
        author: 'niraj',
        ogImage: '/og/blog/dsa-hero.png',
        heroImage: '/og/blog/dsa-hero.png',
        category: 'DSA',
        tags: ['DSA', 'data structures', 'algorithms', 'coding interview', 'LeetCode', 'study plan'],
        readingTime: 15,
        featured: true,
    },
    {
        slug: 'ai-tools-developers-2025',
        title: '10 AI Tools Every Developer Must Use in 2025 (And How to Actually Use Them)',
        description: 'Beyond GitHub Copilot — the 10 AI tools that serious developers are using in 2025 to write better code, ship faster, and stand out in technical interviews and job searches.',
        publishedAt: '2025-05-13',
        author: 'niraj',
        ogImage: '/og/blog/ai-tools-hero.png',
        heroImage: '/og/blog/ai-tools-hero.png',
        category: 'AI Tools',
        tags: ['AI tools', 'developer tools', 'productivity', 'GitHub Copilot', 'ChatGPT', '2025'],
        readingTime: 11,
    },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
    return allPosts.find(p => p.slug === slug)
}
