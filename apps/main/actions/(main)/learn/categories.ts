
"use server";

import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import { LearnStatus } from "@repo/prisma/client";
import { generateSlug, checkIsAuthenticated } from "./utils";

// ==========================================
// HIERARCHICAL CATEGORY OPERATIONS
// ==========================================

/**
 * Get all main categories with their subcategories and Learn counts
 */
export async function getHierarchicalCategories() {
    try {
        const mainCategories = await prisma.learnMainCategory.findMany({
            orderBy: { order: "asc" },
            include: {
                subCategories: {
                    orderBy: { order: "asc" },
                    include: {
                        _count: {
                            select: { learns: true },
                        },
                    },
                },
                _count: {
                    select: { learns: true },
                },
            },
        });

        return { categories: mainCategories };
    } catch (error) {
        console.error("Error fetching hierarchical categories:", error);
        return { error: "Failed to fetch categories", categories: [] };
    }
}

/**
 * Create a new main category (any authenticated user can create)
 */
export async function createMainCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
}) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const slug = generateSlug(data.name);

        // Check if already exists
        const existing = await prisma.learnMainCategory.findUnique({
            where: { slug },
        });
        if (existing) {
            return { category: existing };
        }

        const maxOrder = await prisma.learnMainCategory.aggregate({
            _max: { order: true },
        });

        const category = await prisma.learnMainCategory.create({
            data: {
                slug,
                name: data.name,
                description: data.description,
                icon: data.icon,
                color: data.color,
                order: (maxOrder._max.order || 0) + 1,
            },
        });

        revalidatePath("/learn");
        return { category };
    } catch (error) {
        console.error("Error creating main category:", error);
        return { error: "Failed to create category" };
    }
}

/**
 * Create a sub category under a main category
 */
export async function createSubCategory(data: {
    name: string;
    mainCategoryId: string;
    description?: string;
    icon?: string;
    color?: string;
}) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const slug = generateSlug(data.name);

        // Check if already exists
        const existing = await prisma.learnSubCategory.findUnique({
            where: { slug },
        });
        if (existing) {
            return { subCategory: existing };
        }

        const maxOrder = await prisma.learnSubCategory.aggregate({
            where: { mainCategoryId: data.mainCategoryId },
            _max: { order: true },
        });

        const subCategory = await prisma.learnSubCategory.create({
            data: {
                slug,
                name: data.name,
                mainCategoryId: data.mainCategoryId,
                description: data.description,
                icon: data.icon,
                color: data.color,
                order: (maxOrder._max.order || 0) + 1,
            },
        });

        revalidatePath("/learn");
        return { subCategory };
    } catch (error) {
        console.error("Error creating sub category:", error);
        return { error: "Failed to create sub category" };
    }
}
