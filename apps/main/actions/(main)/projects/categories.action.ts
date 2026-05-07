'use server'

import {
    db,
    projectCategories,
    projectTechnologies,
    projectsV2,
    projectIdeas,
} from "@repo/db";
import { eq, and, sql, inArray } from "drizzle-orm";

export async function getProjectCategories() {
    try {
        const categories = await db.query.projectCategories.findMany({
            where: eq(projectCategories.isActive, true),
            with: {
                technologies: {
                    where: eq(projectTechnologies.isActive, true),
                    orderBy: (techs: any, { asc }: any) => [asc(techs.orderIndex)],
                },
            },
            orderBy: (cats: any, { asc }: any) => [asc(cats.orderIndex)],
        });
        return { success: true as const, data: categories }
    } catch (error) {
        console.error('Error fetching categories:', error)
        return { success: false as const, error: 'Failed to fetch categories' }
    }
}

export async function getProjectTechnologies(categorySlug?: string) {
    try {
        const technologies = await db.query.projectTechnologies.findMany({
            where: categorySlug
                ? and(
                    eq(projectTechnologies.isActive, true),
                    sql`${projectTechnologies.categoryId} IN (SELECT id FROM ${projectCategories} WHERE slug = ${categorySlug})`
                )
                : eq(projectTechnologies.isActive, true),
            with: {
                category: {
                    columns: { name: true, slug: true, icon: true, color: true }
                }
            },
            orderBy: (techs: any, { asc }: any) => [asc(techs.orderIndex)],
        });
        return { success: true as const, data: technologies }
    } catch (error) {
        console.error('Error fetching technologies:', error)
        return { success: false as const, error: 'Failed to fetch technologies' }
    }
}

export async function getPlatformProjects(options?: {
    technology?: string
    category?: string
    difficulty?: string
    limit?: number
    offset?: number
}) {
    try {
        const conditions: any[] = [
            eq(projectsV2.isPlatformSeeded, true),
            eq(projectsV2.visibility, 'PUBLIC'),
        ];
        if (options?.technology) {
            conditions.push(sql`${projectsV2.technologies} @> ARRAY[${options.technology}]::text[]`);
        }
        if (options?.difficulty) {
            conditions.push(eq(projectsV2.difficulty, options.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED"));
        }

        const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

        const [projects, totalArr] = await Promise.all([
            db.query.projectsV2.findMany({
                where: whereClause,
                columns: {
                    id: true, slug: true, title: true, shortDescription: true, description: true,
                    technologies: true, difficulty: true, estimatedHours: true, totalViews: true,
                    totalStarted: true, includeAssessment: true, isPlatformSeeded: true, projectSource: true,
                    recruiterSignal: true, generationType: true, guidedModeEnabled: true,
                },
                with: {
                    creator: { columns: { name: true, username: true, image: true } },
                },
                orderBy: (p: any, { desc }: any) => [desc(p.totalStarted)],
                limit: options?.limit || 20,
                offset: options?.offset || 0,
            }),
            db.select({ count: sql<number>`count(*)` }).from(projectsV2).where(whereClause),
        ]);

        const total = Number(totalArr[0]?.count ?? 0);
        return { success: true as const, data: projects, total }
    } catch (error) {
        console.error('Error fetching platform projects:', error)
        return { success: false as const, error: 'Failed to fetch platform projects' }
    }
}

export async function getCategoryWithIdeas(categorySlug: string) {
    try {
        const category = await db.query.projectCategories.findFirst({
            where: eq(projectCategories.slug, categorySlug),
            with: {
                technologies: {
                    where: eq(projectTechnologies.isActive, true),
                    orderBy: (techs: any, { asc }: any) => [asc(techs.orderIndex)],
                },
            },
        });

        if (!category) {
            return { success: false as const, error: 'Category not found' }
        }

        const techNames = category.technologies.map((t: any) => t.name);

        const [platformProjects, ideas] = await Promise.all([
            db.query.projectsV2.findMany({
                where: and(
                    eq(projectsV2.isPlatformSeeded, true),
                    eq(projectsV2.visibility, 'PUBLIC'),
                    sql`${projectsV2.technologies} && ARRAY[${sql.join(techNames.map((t: string) => sql`${t}`), sql`, `)}]::text[]`
                ),
                columns: {
                    id: true, slug: true, title: true, shortDescription: true, description: true,
                    technologies: true, difficulty: true, estimatedHours: true, totalViews: true,
                    totalStarted: true, includeAssessment: true, isPlatformSeeded: true, projectSource: true,
                    recruiterSignal: true, guidedModeEnabled: true,
                },
                with: {
                    creator: { columns: { name: true, username: true, image: true } },
                },
                orderBy: (p: any, { desc }: any) => [desc(p.totalStarted)],
            }),
            db.query.projectIdeas.findMany({
                where: and(
                    eq(projectIdeas.status, 'APPROVED'),
                    sql`(${projectIdeas.categories} @> ARRAY[${categorySlug}]::text[] OR ${projectIdeas.technologies} && ARRAY[${sql.join(techNames.map((t: string) => sql`${t}`), sql`, `)}]::text[])`
                ),
                orderBy: (ideas: any, { desc }: any) => [desc(ideas.upvotes)],
                limit: 20,
            }),
        ]);

        return { success: true as const, data: { category, platformProjects, ideas } }
    } catch (error) {
        console.error('Error fetching category:', error)
        return { success: false as const, error: 'Failed to fetch category data' }
    }
}
