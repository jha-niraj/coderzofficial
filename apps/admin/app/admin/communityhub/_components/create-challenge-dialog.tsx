"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trophy, Calendar, Gift } from "lucide-react";
import {
	createChallengeFromProposal
} from "@/actions/(main)/collective/admin.actions";
import { toast } from "sonner";

interface CreateChallengeDialogProps {
	children?: React.ReactNode;
	proposal?: {
		id: string;
		title: string;
		description: string;
		playlistUrl?: string | null;
		estimatedDays: number;
	};
}

export function CreateChallengeDialog({ children, proposal }: CreateChallengeDialogProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (formData: FormData) => {
		setIsSubmitting(true);
		try {
			if (proposal) {
				formData.set("proposalId", proposal.id);
			}

			const result = await createChallengeFromProposal(formData);
			toast.success("Challenge created successfully!");
			setOpen(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create challenge");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Calculate default dates
	const today = new Date();
	const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
	const endDate = new Date(startDate.getTime() + (proposal?.estimatedDays || 30) * 24 * 60 * 60 * 1000);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{
					children || (
						<Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
							<Plus className="w-4 h-4 mr-2" />
							Create Challenge
						</Button>
					)
				}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Trophy className="w-5 h-5 text-yellow-500" />
						Create New Challenge
					</DialogTitle>
					<DialogDescription>
						{proposal
							? "Create a challenge from the approved proposal"
							: "Create a new challenge from scratch"
						}
					</DialogDescription>
				</DialogHeader>
				<form action={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="title">Challenge Title *</Label>
						<Input
							id="title"
							name="title"
							defaultValue={proposal?.title || ""}
							placeholder="Enter challenge title"
							required
							className="text-lg"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description *</Label>
						<Textarea
							id="description"
							name="description"
							defaultValue={proposal?.description || ""}
							placeholder="Describe the challenge objectives and what participants will learn..."
							required
							rows={4}
							className="resize-none"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="playlistUrl">Learning Resource URL</Label>
						<Input
							id="playlistUrl"
							name="playlistUrl"
							type="url"
							defaultValue={proposal?.playlistUrl || ""}
							placeholder="https://youtube.com/playlist?list=... or course URL"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="startDate">Start Date *</Label>
							<Input
								id="startDate"
								name="startDate"
								type="datetime-local"
								defaultValue={startDate.toISOString().slice(0, 16)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="endDate">End Date *</Label>
							<Input
								id="endDate"
								name="endDate"
								type="datetime-local"
								defaultValue={endDate.toISOString().slice(0, 16)}
								required
							/>
						</div>
					</div>
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Gift className="w-5 h-5 text-yellow-500" />
							<Label className="text-base font-medium">Rewards</Label>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="xpReward">XP Reward</Label>
								<Input
									id="xpReward"
									name="xpReward"
									type="number"
									min="0"
									defaultValue="1000"
									placeholder="0"
								/>
								<p className="text-xs text-muted-foreground">
									XP awarded upon completion
								</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="creditReward">Credit Reward</Label>
								<Input
									id="creditReward"
									name="creditReward"
									type="number"
									min="0"
									defaultValue="100"
									placeholder="0"
								/>
								<p className="text-xs text-muted-foreground">
									Credits awarded upon completion
								</p>
							</div>
						</div>
					</div>
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
							<div className="space-y-1">
								<h4 className="font-medium text-blue-900">Next Steps</h4>
								<ul className="text-sm text-blue-800 space-y-1">
									<li>• Challenge will be created in DRAFT status</li>
									<li>• Add challenge steps (quizzes, coding tasks, etc.)</li>
									<li>• Review and publish when ready</li>
									<li>• Participants can then join and start learning</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create Challenge"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}