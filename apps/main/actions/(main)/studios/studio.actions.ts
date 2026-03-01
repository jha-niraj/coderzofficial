"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import type {
	Studio,
	StudioStep,
	StudioWithSteps,
	SaveStepRequest,
	StudioListItem,
} from "@/types/studios";

// Get user's studios
export async function getUserStudios(): Promise<{
	success: boolean;
	studios?: StudioListItem[];
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const studios = await prisma.studio.findMany({
			where: { userId: session.user.id },
			select: {
				id: true,
				slug: true,
				title: true,
				description: true,
				emoji: true,
				source: true,
				sourceId: true,
				stepCount: true,
				lastEditedAt: true,
				createdAt: true,
			},
			orderBy: { lastEditedAt: "desc" },
		});

		return {
			success: true,
			studios: studios as unknown as StudioListItem[],
		};
	} catch (error) {
		console.error("Error fetching studios:", error);
		return { success: false, error: "Failed to fetch studios" };
	}
}

// Get studio by ID with all steps
export async function getStudioWithSteps(
	studioId: string
): Promise<{
	success: boolean;
	studio?: StudioWithSteps;
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const studio = await prisma.studio.findUnique({
			where: { id: studioId, userId: session.user.id },
			include: {
				studioSteps: {
					orderBy: { orderNumber: "asc" },
				},
			},
		});

		if (!studio) {
			return { success: false, error: "Studio not found" };
		}

		return {
			success: true,
			studio: studio as unknown as StudioWithSteps,
		};
	} catch (error) {
		console.error("Error fetching studio:", error);
		return { success: false, error: "Failed to fetch studio" };
	}
}

// Generate a unique slug for a studio
async function generateUniqueSlug(title: string): Promise<string> {
	const baseSlug = title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.substring(0, 80);

	let slug = baseSlug;
	let counter = 0;

	while (true) {
		const existing = await prisma.studio.findUnique({
			where: { slug },
			select: { id: true },
		});

		if (!existing) break;

		counter++;
		slug = `${baseSlug}-${counter}`;
	}

	return slug;
}

// Create new studio (from Pathfinder or Space)
export async function createStudio(data: {
	title: string;
	description?: string;
	source: "pathfinder" | "space" | "manual";
	sourceId?: string;
}): Promise<{
	success: boolean;
	studio?: Studio;
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const slug = await generateUniqueSlug(data.title);

		const studio = await prisma.studio.create({
			data: {
				title: data.title,
				slug,
				description: data.description,
				source: data.source.toUpperCase() as any,
				sourceId: data.sourceId,
				userId: session.user.id,
				stepCount: 0,
			},
		});

		revalidatePath("/studio");
		return { success: true, studio: studio as unknown as Studio };
	} catch (error) {
		console.error("Error creating studio:", error);
		return { success: false, error: "Failed to create studio" };
	}
}

// Save or update a step
export async function saveStep(
	request: SaveStepRequest
): Promise<{
	success: boolean;
	step?: StudioStep;
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Verify studio ownership
		const studio = await prisma.studio.findUnique({
			where: { id: request.studioId, userId: session.user.id },
		});

		if (!studio) {
			return { success: false, error: "Studio not found" };
		}

		let step;

		if (request.stepId) {
			// Update existing step
			step = await prisma.studioStep.update({
				where: { id: request.stepId },
				data: {
					content: request.content,
					metadata: request.metadata as any,
					updatedAt: new Date(),
				},
			});
		} else {
			// Create new step
			const maxOrder = await prisma.studioStep.findFirst({
				where: { studioId: request.studioId },
				orderBy: { orderNumber: "desc" },
				select: { orderNumber: true },
			});

			const nextOrder = (maxOrder?.orderNumber ?? 0) + 1;

			step = await prisma.studioStep.create({
				data: {
					studioId: request.studioId,
					type: request.type.toUpperCase() as any,
					content: request.content,
					metadata: request.metadata as any,
					source: request.source.toUpperCase() as any,
					orderNumber: nextOrder,
					status: "COMPLETED",
				},
			});

			// Update studio step count and last edited
			await prisma.studio.update({
				where: { id: request.studioId },
				data: {
					stepCount: { increment: 1 },
					lastEditedAt: new Date(),
				},
			});
		}

		revalidatePath(`/studio/${request.studioId}`);
		return { success: true, step: step as unknown as StudioStep };
	} catch (error) {
		console.error("Error saving step:", error);
		return { success: false, error: "Failed to save step" };
	}
}

// Delete a step
export async function deleteStep(
	stepId: string
): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const step = await prisma.studioStep.findUnique({
			where: { id: stepId },
			include: { studio: true },
		});

		if (!step || step.studio.userId !== session.user.id) {
			return { success: false, error: "Step not found" };
		}

		await prisma.studioStep.delete({
			where: { id: stepId },
		});

		// Update studio step count
		await prisma.studio.update({
			where: { id: step.studioId },
			data: {
				stepCount: { decrement: 1 },
				lastEditedAt: new Date(),
			},
		});

		revalidatePath(`/studio/${step.studioId}`);
		return { success: true };
	} catch (error) {
		console.error("Error deleting step:", error);
		return { success: false, error: "Failed to delete step" };
	}
}

// Update studio title/description
export async function updateStudio(
	studioId: string,
	data: { title?: string; description?: string }
): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		await prisma.studio.update({
			where: { id: studioId, userId: session.user.id },
			data: {
				...data,
				lastEditedAt: new Date(),
			},
		});

		revalidatePath(`/studio/${studioId}`);
		return { success: true };
	} catch (error) {
		console.error("Error updating studio:", error);
		return { success: false, error: "Failed to update studio" };
	}
}

// Delete studio
export async function deleteStudio(
	studioId: string
): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		await prisma.studio.delete({
			where: { id: studioId, userId: session.user.id },
		});

		revalidatePath("/studio");
		return { success: true };
	} catch (error) {
		console.error("Error deleting studio:", error);
		return { success: false, error: "Failed to delete studio" };
	}
}
