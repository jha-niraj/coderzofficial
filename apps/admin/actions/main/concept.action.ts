"use server";

import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";
import { ConceptStatus } from "@repo/prisma/client";
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

export async function getPendingVerificationConcepts() {
    try {
        const adminCheck = await checkAdminAuth();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error, concepts: [] };
        }

        const concepts = await prisma.concept.findMany({
            where: { status: ConceptStatus.PENDING_VERIFICATION },
            orderBy: { updatedAt: "desc" },
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
                    },
                },
            },
        });

        return { concepts };
    } catch (error) {
        console.error("Error fetching pending concepts:", error);
        return { error: "Failed to fetch pending concepts", concepts: [] };
    }
}

export async function verifyConcept(conceptId: string) {
    try {
        const adminCheck = await checkAdminAuth();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            select: { status: true },
        });

        if (!concept) {
            return { error: "Concept not found" };
        }

        if (concept.status !== ConceptStatus.PENDING_VERIFICATION) {
            return { error: "Concept is not pending verification" };
        }

        await prisma.concept.update({
            where: { id: conceptId },
            data: {
                status: ConceptStatus.PUBLISHED,
                verifiedAt: new Date(),
                verifiedBy: adminCheck.userId,
            },
        });

        revalidatePath("/main/concepts");
        return { success: true };
    } catch (error) {
        console.error("Error verifying concept:", error);
        return { error: "Failed to verify concept" };
    }
}

export async function rejectConcept(conceptId: string, reason: string) {
    try {
        const adminCheck = await checkAdminAuth();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            select: { status: true, creatorId: true },
        });

        if (!concept) {
            return { error: "Concept not found" };
        }

        if (concept.status !== ConceptStatus.PENDING_VERIFICATION) {
            return { error: "Concept is not pending verification" };
        }

        // Move concept back to draft and potentially notify creator
        await prisma.concept.update({
            where: { id: conceptId },
            data: {
                status: ConceptStatus.DRAFT,
                // Could add rejectionReason field to schema if needed
            },
        });

        // TODO: Send notification to creator about rejection with reason
        // await createNotification(concept.creatorId, { ... });

        revalidatePath("/main/concepts");
        return { success: true };
    } catch (error) {
        console.error("Error rejecting concept:", error);
        return { error: "Failed to reject concept" };
    }
}

export async function getAllConceptsAdmin(filters: {
    search?: string;
    status?: ConceptStatus;
    pricingType?: "FREE" | "PAID";
    page?: number;
    limit?: number;
} = {}) {
    try {
        const adminCheck = await checkAdminAuth();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error, concepts: [], pagination: null };
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

        const [concepts, total] = await Promise.all([
            prisma.concept.findMany({
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
            prisma.concept.count({ where }),
        ]);

        return {
            concepts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching concepts:", error);
        return { error: "Failed to fetch concepts", concepts: [], pagination: null };
    }
}
