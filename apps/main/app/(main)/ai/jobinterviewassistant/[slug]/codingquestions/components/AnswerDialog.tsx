"use client"

import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { 
	Code2, BookOpen, Clock, Zap 
} from "lucide-react"

interface AnswerDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	answer: any
	language: string
	onMoveToEditor: () => void
}

export default function AnswerDialog({
	open,
	onOpenChange,
	answer,
	language,
	onMoveToEditor
}: AnswerDialogProps) {
	if (!answer?.answer) return null;

	const handleMoveToEditor = () => {
		onMoveToEditor();
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<BookOpen className="h-5 w-5 text-blue-600" />
						Expert Solution
						<Badge variant="outline" className="ml-2">
							{language.charAt(0).toUpperCase() + language.slice(1)}
						</Badge>
					</DialogTitle>
					<DialogDescription>
						Here&apos;s the optimal solution with detailed explanation
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-6">
					{
						answer.answer?.explanation && (
							<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
								<h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
									<BookOpen className="h-4 w-4" />
									Explanation
								</h4>
								<p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
									{answer.answer.explanation}
								</p>
							</div>
						)
					}
					{
						answer.answer?.solution && (
							<div className="border rounded-lg overflow-hidden">
								<div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b flex items-center justify-between">
									<h4 className="text-sm font-semibold flex items-center gap-2">
										<Code2 className="h-4 w-4" />
										Solution Code
									</h4>
									<Button
										onClick={handleMoveToEditor}
										size="sm"
										variant="outline"
										className="text-xs h-7"
									>
										<Code2 className="h-3 w-3 mr-1" />
										Move to Editor
									</Button>
								</div>
								<div className="p-4 bg-gray-900 text-gray-100 overflow-x-auto">
									<pre className="text-sm font-mono whitespace-pre-wrap">
										<code>{answer.answer.solution}</code>
									</pre>
								</div>
							</div>
						)
					}
					{
						answer.answer?.approach && (
							<div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
								<h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
									<Zap className="h-4 w-4" />
									Approach
								</h4>
								<p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
									{answer.answer.approach}
								</p>
							</div>
						)
					}
					{
						answer.answer?.keyPoints && answer.answer.keyPoints.length > 0 && (
							<div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
								<h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
									Key Points
								</h4>
								<ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
									{
										answer.answer.keyPoints.map((point: string, index: number) => (
											<li key={index}>• {point}</li>
										))
									}
								</ul>
							</div>
						)
					}
					{
						(answer.answer?.timeComplexity || answer.answer?.spaceComplexity) && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{
									answer.answer?.timeComplexity && (
										<div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
											<h5 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1 flex items-center gap-2">
												<Clock className="h-4 w-4" />
												Time Complexity
											</h5>
											<p className="text-sm text-orange-800 dark:text-orange-200">{answer.answer.timeComplexity}</p>
										</div>
									)
								}
								{
									answer.answer?.spaceComplexity && (
										<div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
											<h5 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1 flex items-center gap-2">
												<Zap className="h-4 w-4" />
												Space Complexity
											</h5>
											<p className="text-sm text-indigo-800 dark:text-indigo-200">{answer.answer.spaceComplexity}</p>
										</div>
									)
								}
							</div>
						)
					}
				</div>
			</DialogContent>
		</Dialog>
	)
}
