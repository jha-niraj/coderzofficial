"use server";

import { auth } from '@repo/auth';
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProposal(formData: FormData) {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Authentication required");
	}

	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const playlistUrl = formData.get("playlistUrl") as string;
	const estimatedDays = parseInt(formData.get("estimatedDays") as string) || 30;
	const tags = (formData.get("tags") as string)?.split(",").map(tag => tag.trim()) || [];

	if (!title || !description) {
		throw new Error("Title and description are required");
	}

	// Create slug from title
	const slug = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

	// Check if slug already exists
	const existingProposal = await prisma.communityProposal.findFirst({
		where: {
			title: {
				equals: title,
				mode: "insensitive",
			},
		},
	});

	if (existingProposal) {
		throw new Error("A proposal with this title already exists");
	}

	const votingEndAt = new Date();
	votingEndAt.setDate(votingEndAt.getDate() + 7); // 7 days from now

	const proposal = await prisma.communityProposal.create({
		data: {
			title,
			description,
			playlistUrl,
			estimatedDays,
			tags,
			proposerId: session.user.id,
			votingEndAt,
		},
	});

	revalidatePath("/communityhub");
	redirect(`/communityhub/${slug}/voting`);
}

export async function voteOnProposal(proposalId: string, value: number) {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Authentication required");
	}

	if (value !== 1 && value !== -1) {
		throw new Error("Invalid vote value");
	}

	try {
		// Check if user already voted
		const existingVote = await prisma.proposalVote.findUnique({
			where: {
				userId_proposalId: {
					userId: session.user.id,
					proposalId,
				},
			},
		});

		if (existingVote) {
			// Update existing vote
			await prisma.proposalVote.update({
				where: {
					id: existingVote.id,
				},
				data: {
					value,
				},
			});
		} else {
			// Create new vote
			await prisma.proposalVote.create({
				data: {
					userId: session.user.id,
					proposalId,
					value,
				},
			});
		}

		// Update vote counts on proposal
		const votes = await prisma.proposalVote.groupBy({
			by: ["value"],
			where: { proposalId },
			_count: { value: true },
		});

		const upvotes = votes.find((v: any) => v.value === 1)?._count.value || 0;
		const downvotes = votes.find((v: any) => v.value === -1)?._count.value || 0;

		await prisma.communityProposal.update({
			where: { id: proposalId },
			data: {
				upvotes,
				downvotes,
				netVotes: upvotes - downvotes,
			},
		});

		revalidatePath("/communityhub");
		return { success: true };
	} catch (error) {
		console.error("Error voting on proposal:", error);
		throw new Error("Failed to vote on proposal");
	}
}

export async function addComment(proposalId: string, content: string) {
	const session = await auth();
	if (!session?.user?.id) {
		throw new Error("Authentication required");
	}

	if (!content.trim()) {
		throw new Error("Comment content is required");
	}

	try {
		await prisma.proposalComment.create({
			data: {
				content: content.trim(),
				userId: session.user.id,
				proposalId,
			},
		});

		revalidatePath("/communityhub");
		return { success: true };
	} catch (error) {
		console.error("Error adding comment:", error);
		throw new Error("Failed to add comment");
	}
}

export async function getProposals(status?: string): Promise<any[]> {
	try {
		const where: any = {};

		if (status === "active") {
			where.status = "VOTING";
			where.votingEndAt = { gt: new Date() };
		} else if (status === "proposed") {
			where.status = { in: ["VOTING", "EXPIRED"] };
		}

		const proposals = await prisma.communityProposal.findMany({
			where,
			include: {
				proposer: {
					select: {
						id: true,
						name: true,
						image: true,
						username: true,
					},
				},
				_count: {
					select: {
						votes: true,
						comments: true,
					},
				},
			},
			orderBy: [
				{ netVotes: "desc" },
				{ createdAt: "desc" },
			],
		});

		return proposals;
	} catch (error) {
		console.error("Error fetching proposals:", error);
		return [];
	}
}

export async function getProposalByTitle(title: string) {
	try {
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

		const proposal = await prisma.communityProposal.findFirst({
			where: {
				title: {
					contains: title.replace(/-/g, " "),
					mode: "insensitive",
				},
			},
			include: {
				proposer: {
					select: {
						id: true,
						name: true,
						image: true,
						username: true,
					},
				},
				votes: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				},
				comments: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				},
			},
		});

		return proposal;
	} catch (error) {
		console.error("Error fetching proposal:", error);
		return null;
	}
}


