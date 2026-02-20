"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
	Code, Play, Loader2, RotateCcw, CheckCircle, XCircle
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import dynamic from "next/dynamic";
import { saveStep } from "@/actions/(main)/studios/studio.actions";
import toast from "@repo/ui/components/ui/sonner";
import type { StudioStep, CodeMetadata } from "@/types/studios";

const CodeEditor = dynamic(() => import("@/components/main/code-editor"), { ssr: false });

interface CodeStepProps {
	step: StudioStep;
	studioId?: string;
}

export function CodeStep({ step, studioId }: CodeStepProps) {
	const metadata = (step.metadata || {}) as Partial<CodeMetadata>;
	const [isRunning, setIsRunning] = useState(false);
	const [currentCode, setCurrentCode] = useState(step.content || "// Start coding here...");
	const [output, setOutput] = useState<string | null>(null);
	const [hasError, setHasError] = useState(false);

	const handleCodeChange = useCallback((code: string) => {
		setCurrentCode(code);
	}, []);

	const handleRun = useCallback(async () => {
		setIsRunning(true);
		setOutput(null);
		setHasError(false);

		try {
			if (metadata.language === "javascript" || !metadata.language) {
				try {
					const logs: string[] = [];
					const originalLog = console.log;
					console.log = (...args: unknown[]) => {
						logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "));
					};

					// eslint-disable-next-line no-eval
					const result = eval(currentCode);
					console.log = originalLog;

					if (result !== undefined) {
						logs.push(`→ ${typeof result === "object" ? JSON.stringify(result, null, 2) : String(result)}`);
					}
					setOutput(logs.join("\n") || "✅ Code executed successfully (no output)");
				} catch (err) {
					setHasError(true);
					setOutput(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
				}
			} else {
				setOutput("⚠️ Execution for this language is coming soon. Only JavaScript is supported client-side.");
			}

			// Save code state
			if (studioId) {
				await saveStep({
					studioId,
					stepId: step.id,
					type: "CODE",
					content: currentCode,
					metadata: { ...metadata, lastExecutedAt: new Date().toISOString() },
					source: "USER",
				});
			}
		} catch (error) {
			console.error("Code execution error:", error);
			toast.error("Failed to execute code");
		}

		setIsRunning(false);
	}, [currentCode, metadata, step.id, studioId]);

	const handleReset = useCallback(() => {
		setCurrentCode(step.content || "// Start coding here...");
		setOutput(null);
		setHasError(false);
	}, [step.content]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="py-8"
		>
			<div className="rounded-2xl overflow-hidden bg-neutral-900">
				<div className="px-6 py-4 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center">
							<Code className="h-5 w-5 text-white" />
						</div>
						<div>
							<h3 className="font-semibold text-white">
								{metadata.problemTitle || "Code Challenge"}
							</h3>
							<p className="text-sm text-neutral-400">
								{metadata.language || "javascript"}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="ghost"
							className="text-neutral-400 hover:text-white"
							onClick={handleReset}
						>
							<RotateCcw className="h-4 w-4" />
						</Button>
						<Button
							size="sm"
							className="gap-2 bg-green-600 hover:bg-green-700"
							onClick={handleRun}
							disabled={isRunning}
						>
							{
								isRunning ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Play className="h-4 w-4" />
								)
							}
							Run
						</Button>
					</div>
				</div>
				<div className="h-64">
					<CodeEditor
						height="100%"
						language={metadata.language || "javascript"}
						code={currentCode}
						onChange={handleCodeChange}
						showLanguageSelector={false}
						showCopyButton={false}
						showExpandButton={false}
					/>
				</div>
				{
					output !== null && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							className="border-t border-neutral-700"
						>
							<div className="px-4 py-2 bg-neutral-800/50 flex items-center gap-2 text-xs">
								{
									hasError ? (
										<XCircle className="h-3.5 w-3.5 text-red-400" />
									) : (
										<CheckCircle className="h-3.5 w-3.5 text-green-400" />
									)
								}
								<span className={hasError ? "text-red-400" : "text-green-400"}>
									Output
								</span>
							</div>
							<pre className="px-4 py-3 text-sm text-neutral-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
								{output}
							</pre>
						</motion.div>
					)
				}
			</div>
		</motion.div>
	);
}