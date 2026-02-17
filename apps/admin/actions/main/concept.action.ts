"use server";

import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";
import { LearnStatus } from "@repo/prisma/client";
import { revalidatePath } from "next/cache";

async function checkAdminAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Not authenticated", isAdmin: false };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (user?.role !== "Admin") {
        return { error: "Admin access required", isAdmin: false };
    }

    return { userId: session.user.id, isAdmin: true };
}

export async function getPendingVerificationLearns() {
    return { Learns: [] };
}

export async function getAllLearnsAdmin(filters: {
    search?: string;
    status?: LearnStatus;
    pricingType?: "FREE" | "PAID";
    page?: number;
    limit?: number;
} = {}) {
    try {
        const adminCheck = await checkAdminAuth();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error, Learns: [], pagination: null };
        }

        const { search, status, pricingType, page = 1, limit = 20 } = filters;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (pricingType) {
            where.pricingType = pricingType;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        const [Learns, total] = await Promise.all([
            prisma.Learn.findMany({
                where,
                orderBy: { updatedAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            steps: true,
                            likes: true,
                            purchases: true,
                            progress: true,
                        },
                    },
                },
            }),
            prisma.Learn.count({ where }),
        ]);

        return {
            Learns,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching Learns:", error);
        return { error: "Failed to fetch Learns", Learns: [], pagination: null };
    }
}
