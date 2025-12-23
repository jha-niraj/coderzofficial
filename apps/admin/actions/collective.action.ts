"use server";

import { auth } from "@/auth";
import prisma from "@repo/prisma";
import { revalidatePath } from "next/cache";
import { ChallengeStepType } from "@repo/prisma/client";

export async function getTopProposals() {
	const session = await auth();
	if (!session?.user?.id || session.user.role !== "Admin") {
		throw new Error("Admin access required");
	}

	try {
		const proposals = await prisma.collectiveProposal.findMany({
			where: {
				status: "VOTING",
				votingEndAt: { lt: new Date() }, // Voting period ended
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
				_count: {
					select: {
						votes: true,
						comments: true,
					},
				},
			},
			orderBy: {
				netVotes: "desc",
			},
			take: 20,
		});

		return proposals;
	} catch (error) {
		console.error("Error fetching top proposals:", error);
		return [];
	}
}

export async function approveProposal(proposalId: string) {
	const session = await auth();
	if (!session?.user?.id || session.user.role !== "Admin") {
		throw new Error("Admin access required");
	}

	try {
		await prisma.collectiveProposal.update({
			where: { id: proposalId },
			data: { status: "APPROVED" },
		});

		revalidatePath("/admin/communityhub");
		return { success: true };
	} catch (error) {
		console.error("Error approving proposal:", error);
		throw new Error("Failed to approve proposal");
	}
}

export async function rejectProposal(proposalId: string) {
	const session = await auth();
	if (!session?.user?.id || session.user.role !== "Admin") {
		throw new Error("Admin access required");
	}

	try {
		await prisma.collectiveProposal.update({
			where: { id: proposalId },
			data: { status: "REJECTED" },
		});

		revalidatePath("/admin/communityhub");
		return { success: true };
	} catch (error) {
		console.error("Error rejecting proposal:", error);
		throw new Error("Failed to reject proposal");
	}
}

export async function createChallengeFromProposal(formData: FormData) {
	const session = await auth();
	if (!session?.user?.id || session.user.role !== "Admin") {
		throw new Error("Admin access required");
	}

	const proposalId = formData.get("proposalId") as string;
	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const playlistUrl = formData.get("playlistUrl") as string;
	const startDate = new Date(formData.get("startDate") as string);
	const endDate = new Date(formData.get("endDate") as string);
	const xpReward = parseInt(formData.get("xpReward") as string) || 0;
	const creditReward = parseInt(formData.get("creditReward") as string) || 0;

	try {
		const challenge = await prisma.collectiveChallenge.create({
			data: {
				title,
				description,
				playlistUrl,
				startDate,
				endDate,
				xpReward,
				creditReward,
				proposalId,
				status: "DRAFT",
			},
		});

		// Update proposal status
		await prisma.collectiveProposal.update({
			where: { id: proposalId },
			data: { status: "PUBLISHED" },
		});

		revalidatePath("/admin/communityhub");
		return { success: true, challengeId: challenge.id };
	} catch (error) {
		console.error("Error creating challenge:", error);
		throw new Error("Failed to create challenge");
	}
}

export async function addChallengeStep(formData: FormData) {
	const session = await auth();
	if (!session?.user?.id || session.user.role !== "Admin") {
		throw new Error("Admin access required");
	}

	const challengeId = formData.get("challengeId") as string;
	const stepNumber = parseInt(formData.get("stepNumber") as string);
	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const type = formData.get("type") as ChallengeStepType;
	const stepData = formData.get("stepData") as string;

	try {
		let parsedStepData = null;
		if (stepData) {
			parsedStepData = JSON.parse(stepData);
		}

		const step = await prisma.challengeStep.create({
			data: {
				challengeId,
				stepNumber,
				title,
				description,
				type,
				...(type === "QUIZ" && { quizData: parsedStepData }),
				...(type === "MOCK" && { mockData: parsedStepData }),
				...(type === "CODING" && { codingData: parsedStepData }),
				...(type === "PROJECT" && { projectData: parsedStepData }),
			},
		});

		// Update total steps count
		await prisma.collectiveChallenge.update({
			where: { id: challengeId },
			data: {
				totalSteps: {
					increment: 1,
				},
			},
		});

		revalidatePath("/admin/communityhub");
		return { success: true, stepId: step.id };
	} catch (error) {
		console.error("Error adding challenge step:", error);
		throw new Error("Failed to add challenge step");
	}
}

export async function publishChallenge(challengeId: string) {
	const session = await auth();
	if (!session?.user?.id || session.user.role !== "Admin") {
		throw new Error("Admin access required");
	}

	try {
		await prisma.collectiveChallenge.update({
			where: { id: challengeId },
			data: { status: "ACTIVE" },
		});

		revalidatePath("/admin/communityhub");
		return { success: true };
	} catch (error) {
		console.error("Error publishing challenge:", error);
		throw new Error("Failed to publish challenge");
	}
}

export async function getChallenges() {
	const session = await auth();
	if (!session?.user?.id || session.user.role !== "Admin") {
		throw new Error("Admin access required");
	}

	try {
		const challenges = await prisma.collectiveChallenge.findMany({
			include: {
				proposal: {
					include: {
						proposer: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				},
				steps: {
					orderBy: {
						stepNumber: "asc",
					},
				},
				_count: {
					select: {
						participations: true,
						steps: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return challenges;
	} catch (error) {
		console.error("Error fetching challenges:", error);
		return [];
	}
}

export async function getChallengeById(challengeId: string) {
	const session = await auth();
	if (!session?.user?.id || session.user.role !== "Admin") {
		throw new Error("Admin access required");
	}

	try {
		const challenge = await prisma.collectiveChallenge.findUnique({
			where: { id: challengeId },
			include: {
				proposal: {
					include: {
						proposer: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				},
				steps: {
					orderBy: {
						stepNumber: "asc",
					},
				},
				participations: {
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
			},
		});

		return challenge;
	} catch (error) {
		console.error("Error fetching challenge:", error);
		return null;
	}
}

export async function evaluateSubmission(formData: FormData) {
	const session = await auth();
	if (!session?.user?.id || session.user.role !== "Admin") {
		throw new Error("Admin access required");
	}

	const submissionId = formData.get("submissionId") as string;
	const status = formData.get("status") as "APPROVED" | "REJECTED" | "NEEDS_REVISION";
	const score = parseInt(formData.get("score") as string) || 0;
	const feedback = formData.get("feedback") as string;
	const xpAwarded = parseInt(formData.get("xpAwarded") as string) || 0;

	try {
		const submission = await prisma.stepSubmission.update({
			where: { id: submissionId },
			data: {
				status,
				score,
				feedback,
				xpAwarded,
				evaluatedBy: session.user.id,
				evaluatedAt: new Date(),
			},
			include: {
				participation: {
					include: {
						user: true,
						challenge: true,
					},
				},
			},
		});

		// If approved, update user progress and XP
		if (status === "APPROVED") {
			// Update participation progress
			await prisma.challengeParticipation.update({
				where: { id: submission.participationId },
				data: {
					completedSteps: {
						increment: 1,
					},
					currentStep: {
						increment: 1,
					},
					totalXpEarned: {
						increment: xpAwarded,
					},
				},
			});

			// Award XP to user
			if (xpAwarded > 0) {
				await prisma.user.update({
					where: { id: submission.participation.user.id },
					data: {
						currentXp: {
							increment: xpAwarded,
						},
						totalXp: {
							increment: xpAwarded,
						},
					},
				});

				// Create XP transaction
				await prisma.xpTransaction.create({
					data: {
						userId: submission.participation.user.id,
						amount: xpAwarded,
						type: "REWARD",
						description: `Challenge step completed: ${submission.participation.challenge.title}`,
					},
				});
			}

			// Update leaderboard
			await updateChallengeLeaderboard(submission.participation.challengeId, submission.participation.userId);
		}

		revalidatePath("/admin/communityhub");
		return { success: true };
	} catch (error) {
		console.error("Error evaluating submission:", error);
		throw new Error("Failed to evaluate submission");
	}
}

async function updateChallengeLeaderboard(challengeId: string, userId: string) {
	try {
		const participation = await prisma.challengeParticipation.findUnique({
			where: {
				userId_challengeId: {
					userId,
					challengeId,
				},
			},
			include: {
				challenge: true,
			},
		});

		if (!participation) return;

		const completionRate = (participation.completedSteps / participation.challenge.totalSteps) * 100;

		await prisma.challengeLeaderboard.upsert({
			where: {
				userId_challengeId: {
					userId,
					challengeId,
				},
			},
			update: {
				totalXp: participation.totalXpEarned,
				completionRate,
			},
			create: {
				userId,
				challengeId,
				rank: 1, // Will be updated by a separate ranking function
				totalXp: participation.totalXpEarned,
				completionRate,
			},
		});

		// Update ranks for all participants in this challenge
		const leaderboard = await prisma.challengeLeaderboard.findMany({
			where: { challengeId },
			orderBy: [
				{ totalXp: "desc" },
				{ completionRate: "desc" },
			],
		});

		for (let i = 0; i < leaderboard.length; i++) {
			await prisma.challengeLeaderboard.update({
				where: { id: leaderboard[i]?.id },
				data: { rank: i + 1 },
			});
		}
	} catch (error) {
		console.error("Error updating leaderboard:", error);
	}
}