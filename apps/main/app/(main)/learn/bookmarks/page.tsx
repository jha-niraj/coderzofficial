import { Suspense } from "react";
import { auth } from '@repo/auth';
import { redirect } from "next/navigation";
import { prisma } from "@repo/prisma";
import { BookmarksHeader } from "./_components/bookmarks-header";
import { Metadata } from "next";
import { BookmarksGrid } from "./_components/bookmarks-grid";
import { BookmarksSkeleton } from "./_components/bookmarks-skeleton";

export const metadata: Metadata = {
    title: "My Bookmarks | Learns Hub",
    description: "View your saved Learns for quick access",
};

async function getBookmarks(userId: string) {
    const bookmarks = await prisma.learnBookmark.findMany({
        where: { userId },
        include: {
            learn: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    category: true,
                    difficulty: true,
                    estimatedTime: true,
                    viewCount: true,
                    _count: {
                        select: {
                            steps: true,
                            likes: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return bookmarks;
}

async function BookmarksContent() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/signin");
    }

    const bookmarks = await getBookmarks(session.user.id);

    return <BookmarksGrid bookmarks={bookmarks} />;
}

export default async function BookmarksPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/signin");
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 pb-20">
            <BookmarksHeader />
            <div className="container max-w-6xl mx-auto px-4">
                <Suspense fallback={<BookmarksSkeleton />}>
                    <BookmarksContent />
                </Suspense>
            </div>
        </div>
    );
}