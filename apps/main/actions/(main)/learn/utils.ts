
import { auth } from '@repo/auth';
import { prisma } from "@repo/prisma";

export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

export async function checkIsAdmin() {
    const session = await auth();
    if (!session?.user?.id) {
        return { isAdmin: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    return {
        isAdmin: user?.role === "Admin",
        userId: session.user.id,
        role: user?.role
    };
}

export async function checkIsAuthenticated() {
    const session = await auth();
    if (!session?.user?.id) {
        return { isAuthenticated: false, error: "Unauthorized" };
    }
    return { isAuthenticated: true, userId: session.user.id };
}