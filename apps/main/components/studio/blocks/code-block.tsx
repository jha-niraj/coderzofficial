"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
	Play, Copy, Check, Maximize2, Minimize2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { cn } from "../../lib/utils";
import { saveCodeBlock } from "@/actions/(main)/studios/studio.action";
import { toast } from "sonner";
import { useTheme } from "next-themes";

// Dynamically import Monaco to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = [
	{ value: "javascript", label: "JavaScript" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "python", label: "Python" },
	{ value: "java", label: "Java" },
	{ value: "cpp", label: "C++" },
	{ value: "c", label: "C" },
	{ value: "csharp", label: "C#" },
	{ value: "go", label: "Go" },
	{ value: "rust", label: "Rust" },
	{ value: "ruby", label: "Ruby" },
	{ value: "php", label: "PHP" },
	{ value: "swift", label: "Swift" },
	{ value: "kotlin", label: "Kotlin" },
	{ value: "sql", label: "SQL" },
	{ value: "html", label: "HTML" },
	{ value: "css", label: "CSS" },
	{ value: "json", label: "JSON" },
	{ value: "markdown", label: "Markdown" },
];

interface StudioCodeBlockProps {
	studioId: string;
	blockId: string;
	initialData?: {
		language?: string;
		code?: string;
		isPractice?: boolean;
		problemTitle?: string;
		problemDescription?: string;
	};
	onChange?: (data: any) => void;
}

export default function StudioCodeBlock({
	studioId,
	blockId,
	initialData,
	onChange,
}: StudioCodeBlockProps) {
	const { theme } = useTheme();
	const [language, setLanguage] = useState(initialData?.language || "javascript");
	const [code, setCode] = useState(initialData?.code || getDefaultCode(initialData?.language || "javascript"));
	const [isExpanded, setIsExpanded] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const [isRunning, setIsRunning] = useState(false);
	const [output, setOutput] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Auto-save with debounce
	const handleCodeChange = useCallback(
		(value: string | undefined) => {
			const newCode = value || "";
			setCode(newCode);
			onChange?.({ language, code: newCode });

			// Debounced save
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
			saveTimeoutRef.current = setTimeout(async () => {
				setIsSaving(true);
				await saveCodeBlock(studioId, blockId, {
					language,
					code: newCode,
				});
				setIsSaving(false);
			}, 2000);
		},
		[language, studioId, blockId, onChange]
	);

	const handleLanguageChange = async (newLanguage: string) => {
		setLanguage(newLanguage);
		const newCode = getDefaultCode(newLanguage);
		setCode(newCode);
		onChange?.({ language: newLanguage, code: newCode });

		await saveCodeBlock(studioId, blockId, {
			language: newLanguage,
			code: newCode,
		});
	};

	const handleCopy = async () => {
		await navigator.clipboard.writeText(code);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
		toast.success("Code copied to clipboard");
	};

	const handleRun = async () => {
		setIsRunning(true);
		setOutput(null);

		// Simulate code execution (in a real app, you'd send this to a sandboxed executor)
		try {
			if (language === "javascript") {
				// Use Function constructor for basic JS execution (not safe for production!)
				const result = new Function(`
          const console = { 
            log: (...args) => args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
            logs: []
          };
          console.log = (...args) => {
            console.logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
          };
          ${code}
          return console.logs.join('\\n');
        `)();
				setOutput(result || "No output");
			} else {
				setOutput(`⚠️ Code execution for ${LANGUAGES.find(l => l.value === language)?.label} is not supported in the browser.\n\nTo run this code, please use your local development environment.`);
			}
		} catch (error: any) {
			setOutput(`❌ Error: ${error.message}`);
		}

		setIsRunning(false);
	};

	return (
		<div
			className={cn(
				"border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-900",
				isExpanded && "fixed inset-4 z-50"
			)}
		>
			<div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
				<div className="flex items-center gap-3">
					<div className="flex gap-1.5">
						<div className="h-3 w-3 rounded-full bg-red-500" />
						<div className="h-3 w-3 rounded-full bg-yellow-500" />
						<div className="h-3 w-3 rounded-full bg-green-500" />
					</div>
					<Select value={language} onValueChange={handleLanguageChange}>
						<SelectTrigger className="w-[140px] h-8 bg-neutral-700 border-neutral-600 text-white text-sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{
								LANGUAGES.map((lang) => (
									<SelectItem key={lang.value} value={lang.value}>
										{lang.label}
									</SelectItem>
								))
							}
						</SelectContent>
					</Select>
					{
						isSaving && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex items-center gap-1 text-xs text-neutral-400"
							>
								<Loader2 className="h-3 w-3 animate-spin" />
								Saving...
							</motion.div>
						)
					}
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-700"
						onClick={handleCopy}
					>
						{isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-700"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						{isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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
			<div className={cn("relative", isExpanded ? "h-[calc(100%-8rem)]" : "h-64")}>
				<Editor
					height="100%"
					language={language}
					value={code}
					onChange={handleCodeChange}
					theme={theme === "dark" ? "vs-dark" : "light"}
					options={{
						minimap: { enabled: false },
						fontSize: 14,
						lineNumbers: "on",
						roundedSelection: true,
						scrollBeyondLastLine: false,
						automaticLayout: true,
						padding: { top: 16 },
						fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace",
						cursorBlinking: "smooth",
						smoothScrolling: true,
						folding: true,
						lineDecorationsWidth: 0,
						lineNumbersMinChars: 3,
						renderLineHighlight: "all",
						tabSize: 2,
					}}
				/>
			</div>
			{
				output && (
					<div className="border-t border-neutral-700">
						<div className="flex items-center justify-between px-4 py-2 bg-neutral-800">
							<span className="text-xs text-neutral-400 font-medium uppercase">Output</span>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 text-xs text-neutral-400 hover:text-white"
								onClick={() => setOutput(null)}
							>
								Clear
							</Button>
						</div>
						<pre className="p-4 text-sm font-mono text-green-400 bg-neutral-950 overflow-x-auto whitespace-pre-wrap">
							{output}
						</pre>
					</div>
				)
			}
		</div>
	);
}

function getDefaultCode(language: string): string {
	const defaults: Record<string, string> = {
		javascript: `// JavaScript Example
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
		typescript: `// TypeScript Example
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
		python: `# Python Example
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`,
		java: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
		cpp: `// C++ Example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
		c: `// C Example
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
		go: `// Go Example
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
		rust: `// Rust Example
fn main() {
    println!("Hello, World!");
}`,
	};

	return defaults[language] || `// ${language} code here`;
}