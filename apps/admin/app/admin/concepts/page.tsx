import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/prisma";
import { AdminConceptsHeader } from "./_components/admin-concepts-header";
import { AdminConceptsTable } from "./_components/admin-concepts-table";
import { AdminConceptsSkeleton } from "./_components/admin-concepts-skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Manage Concepts | Admin",
	description: "Manage all concepts in the platform",
};

async function getConcepts() {
	const concepts = await prisma.concept.findMany({
		include: {
			creator: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
			_count: {
				select: {
					steps: true,
					likes: true,
					bookmarks: true,
					views: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return concepts;
}

async function ConceptsContent() {
	const concepts = await getConcepts();
	return <AdminConceptsTable concepts={concepts} />;
}

export default async function AdminConceptsPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/signin");
	}

	// Check if user is admin
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { role: true },
	});

	if (user?.role !== "Admin") {
		redirect("/concepts");
	}

	return (
		<div className="min-h-screen bg-background pb-20">
			<AdminConceptsHeader />
			<div className="container max-w-7xl mx-auto px-4">
				<Suspense fallback={<AdminConceptsSkeleton />}>
					<ConceptsContent />
				</Suspense>
			</div>
		</div>
	);
}