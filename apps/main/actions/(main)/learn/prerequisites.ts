
"use server";

import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import { checkIsAdmin } from "./utils";

export async function addPrerequisiteLearn(learnId: string, prerequisiteId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        await prisma.learnPrerequisite.create({
            data: { learnId, prerequisiteId },
        });

        revalidatePath("/learn");
        return { success: true };
    } catch (error) {
        console.error("Error adding prerequisite:", error);
        return { error: "Failed to add prerequisite" };
    }
}

export async function removePrerequisiteLearn(learnId: string, prerequisiteId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        await prisma.learnPrerequisite.deleteMany({
            where: { learnId, prerequisiteId },
        });

        revalidatePath("/learn");
        return { success: true };
    } catch (error) {
        console.error("Error removing prerequisite:", error);
        return { error: "Failed to remove prerequisite" };
    }
}

export async function addRelatedLearn(fromLearnId: string, toLearnId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        // Create bidirectional relation
        await prisma.$transaction([
            prisma.learnRelation.create({
                data: { fromLearnId, toLearnId },
            }),
            prisma.learnRelation.create({
                data: { fromLearnId: toLearnId, toLearnId: fromLearnId },
            }),
        ]);

        revalidatePath("/learn");
        return { success: true };
    } catch (error) {
        console.error("Error adding related learn:", error);
        return { error: "Failed to add related learn" };
    }
}

export async function removeRelatedLearn(fromLearnId: string, toLearnId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        await prisma.$transaction([
            prisma.learnRelation.deleteMany({
                where: { fromLearnId, toLearnId },
            }),
            prisma.learnRelation.deleteMany({
                where: { fromLearnId: toLearnId, toLearnId: fromLearnId },
            }),
        ]);

        revalidatePath("/learn");
        return { success: true };
    } catch (error) {
        console.error("Error removing related learn:", error);
        return { error: "Failed to remove related learn" };
    }
}
