"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@repo/ui/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import {
    Play, Send, Copy, Check, Loader2, Maximize2, Minimize2,
    Terminal, RotateCcw, Lightbulb, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import { useTheme } from '@repo/ui/components/themeprovider';
import toast from '@repo/ui/components/ui/sonner';
import { cn } from "@repo/ui/lib/utils";

// Dynamically import Monaco to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Supported languages configuration
const SUPPORTED_LANGUAGES = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "json", label: "JSON" },
    { value: "markdown", label: "Markdown" },
    { value: "shell", label: "Shell/Bash" },
    { value: "git", label: "Git Commands" },
] as const;

const languageMap: Record<string, string> = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    html: "html",
    css: "css",
    json: "json",
    markdown: "markdown",
    shell: "shell",
    git: "shell",
};

export type EditorMode = 'code' | 'terminal' | 'readonly';

export interface ValidationResult {
    isCorrect: boolean;
    score: number; // 0-100
    feedback: string;
    hints?: string[];
    errors?: string[];
    expectedOutput?: string;
    actualOutput?: string;
}

export interface LearnCodeEditorProps {
    /** Initial code to display */
    code?: string;
    /** Programming language for syntax highlighting */
    language?: string;
    /** Editor mode: code, terminal, or readonly */
    mode?: EditorMode;
    /** Height of the editor */
    height?: string;
    /** Whether the editor is read-only */
    readOnly?: boolean;
    /** Callback when code changes */
    onChange?: (code: string) => void;
    /** Callback when language changes */
    onLanguageChange?: (language: string) => void;
    /** Show language selector dropdown */
    showLanguageSelector?: boolean;
    /** Show copy button */
    showCopyButton?: boolean;
    /** Show Run/Check button */
    showRunButton?: boolean;
    /** Show Submit button */
    showSubmitButton?: boolean;
    /** Show Reset button */
    showResetButton?: boolean;
    /** Show Hint button */
    showHintButton?: boolean;
    /** Run button handler - validates code via AI */
    onRun?: (code: string) => Promise<ValidationResult>;
    /** Submit button handler */
    onSubmit?: (code: string) => void | Promise<void>;
    /** Whether run is in progress (controlled) */
    isRunning?: boolean;
    /** Whether submit is in progress (controlled) */
    isSubmitting?: boolean;
    /** Allowed languages (subset of supported languages) */
    allowedLanguages?: string[];
    /** Show expand/fullscreen button */
    showExpandButton?: boolean;
    /** Additional class names */
    className?: string;
    /** Placeholder text when no code is provided */
    placeholder?: string;
    /** Expected output/answer for validation */
    expectedOutput?: string;
    /** Hints to show when user is stuck */
    hints?: string[];
    /** Task/exercise description */
    taskDescription?: string;
    /** Validation prompt for AI */
    validationPrompt?: string;
    /** Terminal prompt text */
    terminalPrompt?: string;
    /** Terminal history (for terminal mode) */
    terminalHistory?: string[];
    /** On terminal command execution (for terminal mode) */
    onTerminalCommand?: (command: string) => Promise<string>;
}

export default function LearnCodeEditor({
    code,
    language = "javascript",
    mode = 'code',
    height = "300px",
    readOnly = false,
    onChange,
    onLanguageChange,
    showLanguageSelector = true,
    showCopyButton = true,
    showRunButton = true,
    showSubmitButton = false,
    showResetButton = true,
    showHintButton = true,
    onRun,
    onSubmit,
    isRunning: isRunningProp,
    isSubmitting: isSubmittingProp,
    allowedLanguages,
    showExpandButton = false,
    className = "",
    placeholder = "// Write your code here...",
    hints = [],
    taskDescription,
    terminalPrompt = "$ ",
    terminalHistory = [],
    onTerminalCommand,
}: LearnCodeEditorProps) {
    const { theme } = useTheme();
    const [currentLanguage, setCurrentLanguage] = useState(language);
    const [currentCode, setCurrentCode] = useState(code ?? "");
    const [initialCode] = useState(code ?? "");
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentHintIndex, setCurrentHintIndex] = useState(-1);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const editorRef = useRef<unknown>(null);

    // Terminal state
    const [terminalOutput, setTerminalOutput] = useState<string[]>(terminalHistory);
    const [terminalInput, setTerminalInput] = useState("");
    const terminalRef = useRef<HTMLDivElement>(null);

    // Internal state for execution if controlled props are not provided
    const [internalIsRunning, setInternalIsRunning] = useState(false);

    // Effective state
    const isRunning = isRunningProp ?? internalIsRunning;
    const isSubmitting = isSubmittingProp ?? false;

    // Update code when prop changes
    useEffect(() => {
        if (code !== undefined) {
            setCurrentCode(code);
        }
    }, [code]);

    // Update language when prop changes
    useEffect(() => {
        setCurrentLanguage(language);
    }, [language]);

    // Scroll terminal to bottom when output changes
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalOutput]);

    const handleEditorDidMount = useCallback((editor: unknown) => {
        editorRef.current = editor;
    }, []);

    const handleLanguageChange = useCallback((newLanguage: string) => {
        setCurrentLanguage(newLanguage);
        onLanguageChange?.(newLanguage);
    }, [onLanguageChange]);

    const handleCodeChange = useCallback((value: string | undefined) => {
        const newCode = value || "";
        setCurrentCode(newCode);
        onChange?.(newCode);
        // Clear validation result when code changes
        setValidationResult(null);
    }, [onChange]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(currentCode);
            setCopied(true);
            toast.success("Code copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.log("Failed to copy: " + error);
            toast.error("Failed to copy");
        }
    }, [currentCode]);

    const handleReset = useCallback(() => {
        setCurrentCode(initialCode);
        setValidationResult(null);
        setCurrentHintIndex(-1);
        onChange?.(initialCode);
        toast.info("Code reset to initial state");
    }, [initialCode, onChange]);

    const handleShowHint = useCallback(() => {
        if (hints.length === 0) {
            toast.info("No hints available for this exercise");
            return;
        }

        const nextHintIndex = currentHintIndex + 1;
        if (nextHintIndex < hints.length) {
            setCurrentHintIndex(nextHintIndex);
            toast.info(`Hint ${nextHintIndex + 1}: ${hints[nextHintIndex]}`);
        } else {
            toast.info("No more hints available");
        }
    }, [hints, currentHintIndex]);

    const handleRun = useCallback(async () => {
        if (isRunning) return;

        setInternalIsRunning(true);
        setValidationResult(null);

        try {
            if (onRun) {
                const result = await onRun(currentCode);
                setValidationResult(result);

                if (result.isCorrect) {
                    toast.success("Great job! Your code is correct!");
                } else {
                    toast.error(result.feedback || "Not quite right. Try again!");
                }
            }
        } catch (error) {
            console.error("Validation error:", error);
            const errorMessage = error instanceof Error ? error.message : "Validation failed";
            toast.error(errorMessage);
            setValidationResult({
                isCorrect: false,
                score: 0,
                feedback: errorMessage,
                errors: [errorMessage]
            });
        } finally {
            setInternalIsRunning(false);
        }
    }, [onRun, isRunning, currentCode]);

    const handleSubmit = useCallback(async () => {
        if (onSubmit && !isSubmitting) {
            await onSubmit(currentCode);
        }
    }, [onSubmit, isSubmitting, currentCode]);

    // Terminal mode handlers
    const handleTerminalKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && terminalInput.trim()) {
            const command = terminalInput.trim();
            setTerminalOutput(prev => [...prev, `${terminalPrompt}${command}`]);
            setTerminalInput("");

            if (onTerminalCommand) {
                setInternalIsRunning(true);
                try {
                    const output = await onTerminalCommand(command);
                    setTerminalOutput(prev => [...prev, output]);
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : "Command failed";
                    setTerminalOutput(prev => [...prev, `Error: ${errorMsg}`]);
                } finally {
                    setInternalIsRunning(false);
                }
            }
        }
    }, [terminalInput, terminalPrompt, onTerminalCommand]);

    const getMonacoLanguage = (lang: string): string => {
        return languageMap[lang] || lang;
    };

    // Filter languages if allowedLanguages is provided
    const availableLanguages = allowedLanguages
        ? SUPPORTED_LANGUAGES.filter(l => allowedLanguages.includes(l.value))
        : SUPPORTED_LANGUAGES;

    // Render validation result
    const renderValidationResult = () => {
        if (!validationResult) return null;

        return (
            <div className={cn(
                "border-t border-neutral-200 dark:border-neutral-700 p-3",
                validationResult.isCorrect
                    ? "bg-green-50 dark:bg-green-950/30"
                    : "bg-red-50 dark:bg-red-950/30"
            )}>
                <div className="flex items-start gap-2">
                    {
                        validationResult.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )
                    }
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                                "font-medium text-sm",
                                validationResult.isCorrect
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-red-700 dark:text-red-400"
                            )}>
                                {validationResult.isCorrect ? "Correct!" : "Not quite right"}
                            </span>
                            <span className="text-xs text-neutral-500">
                                Score: {validationResult.score}%
                            </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {validationResult.feedback}
                        </p>
                        {
                            validationResult.errors && validationResult.errors.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {
                                        validationResult.errors.map((error, i) => (
                                            <li key={i} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
                                                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                {error}
                                            </li>
                                        ))
                                    }
                                </ul>
                            )
                        }
                        {
                            validationResult.hints && validationResult.hints.length > 0 && (
                                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded">
                                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                                        💡 Hints:
                                    </p>
                                    <ul className="space-y-1">
                                        {
                                            validationResult.hints.map((hint, i) => (
                                                <li key={i} className="text-xs text-amber-600 dark:text-amber-400">
                                                    • {hint}
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        );
    };

    // Render terminal mode
    if (mode === 'terminal') {
        return (
            <div
                className={cn(
                    "flex flex-col border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-neutral-900 dark:bg-neutral-950",
                    isExpanded && "fixed inset-4 z-50",
                    className
                )}
            >
                <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-700 bg-neutral-800">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5 mr-2">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                            <Terminal className="w-3 h-3" />
                            <span>Terminal</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {
                            showExpandButton && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-neutral-400 hover:text-white"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    {
                                        isExpanded ? (
                                            <Minimize2 className="h-3 w-3" />
                                        ) : (
                                            <Maximize2 className="h-3 w-3" />
                                        )
                                    }
                                </Button>
                            )
                        }
                    </div>
                </div>
                <div
                    ref={terminalRef}
                    className="flex-1 p-3 font-mono text-sm text-green-400 overflow-y-auto"
                    style={{ height: isExpanded ? "calc(100% - 100px)" : height }}
                >
                    {
                        terminalOutput.map((line, i) => (
                            <div key={i} className="whitespace-pre-wrap mb-1">
                                {line}
                            </div>
                        ))
                    }

                    <div className="flex items-center gap-1">
                        <span className="text-green-400">{terminalPrompt}</span>
                        <input
                            type="text"
                            value={terminalInput}
                            onChange={(e) => setTerminalInput(e.target.value)}
                            onKeyDown={handleTerminalKeyDown}
                            disabled={isRunning}
                            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
                            placeholder={isRunning ? "Running..." : "Type a command..."}
                            autoFocus
                        />
                        {
                            isRunning && (
                                <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                            )
                        }
                    </div>
                </div>

                {renderValidationResult()}
            </div>
        );
    }

    // Render code editor mode
    return (
        <div
            className={cn(
                "flex flex-col border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-900",
                isExpanded && "fixed inset-4 z-50",
                className
            )}
        >
            <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 mr-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>

                    {
                        showLanguageSelector && availableLanguages.length > 1 ? (
                            <Select
                                value={currentLanguage}
                                onValueChange={handleLanguageChange}
                                disabled={readOnly}
                            >
                                <SelectTrigger className="w-[130px] h-7 text-xs">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        availableLanguages.map((lang) => (
                                            <SelectItem key={lang.value} value={lang.value} className="text-xs">
                                                {lang.label}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded">
                                {SUPPORTED_LANGUAGES.find(l => l.value === currentLanguage)?.label || currentLanguage}
                            </div>
                        )
                    }
                </div>
                <div className="flex items-center gap-2">
                    {
                        showResetButton && !readOnly && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="h-7 text-xs px-2"
                                title="Reset code"
                            >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Reset
                            </Button>
                        )
                    }
                    {
                        showHintButton && hints.length > 0 && !readOnly && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleShowHint}
                                className="h-7 text-xs px-2"
                                title={`Show hint (${currentHintIndex + 1}/${hints.length})`}
                            >
                                <Lightbulb className="h-3 w-3 mr-1" />
                                Hint
                            </Button>
                        )
                    }
                    {
                        showCopyButton && currentCode && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-7 text-xs px-2"
                            >
                                {
                                    copied ? (
                                        <>
                                            <Check className="h-3 w-3 mr-1" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3 mr-1" />
                                            Copy
                                        </>
                                    )
                                }
                            </Button>
                        )
                    }
                    {
                        showExpandButton && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {
                                    isExpanded ? (
                                        <Minimize2 className="h-3 w-3" />
                                    ) : (
                                        <Maximize2 className="h-3 w-3" />
                                    )
                                }
                            </Button>
                        )
                    }
                    {
                        showRunButton && onRun && !readOnly && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRun}
                                disabled={isRunning || isSubmitting}
                                className="h-7 text-xs gap-1"
                            >
                                {
                                    isRunning ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Checking...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-3 w-3" />
                                            Check
                                        </>
                                    )
                                }
                            </Button>
                        )
                    }
                    {
                        showSubmitButton && onSubmit && !readOnly && (
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={isRunning || isSubmitting || !validationResult?.isCorrect}
                                className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700"
                            >
                                {
                                    isSubmitting ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-3 w-3" />
                                            Submit
                                        </>
                                    )
                                }
                            </Button>
                        )
                    }
                </div>
            </div>

            {
                taskDescription && (
                    <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            📝 {taskDescription}
                        </p>
                    </div>
                )
            }

            {
                currentHintIndex >= 0 && hints[currentHintIndex] && (
                    <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            💡 <strong>Hint {currentHintIndex + 1}:</strong> {hints[currentHintIndex]}
                        </p>
                    </div>
                )
            }

            <div style={{ height: isExpanded ? "calc(100% - 48px)" : height }}>
                <Editor
                    height="100%"
                    language={getMonacoLanguage(currentLanguage)}
                    value={currentCode || placeholder}
                    onChange={handleCodeChange}
                    onMount={handleEditorDidMount}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                        readOnly: readOnly || mode === 'readonly',
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        formatOnPaste: true,
                        formatOnType: true,
                        suggestOnTriggerCharacters: !readOnly,
                        quickSuggestions: !readOnly,
                        cursorBlinking: "smooth",
                        smoothScrolling: true,
                        folding: true,
                        renderLineHighlight: "all",
                        scrollbar: {
                            vertical: "auto",
                            horizontal: "auto",
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                        },
                        padding: {
                            top: 12,
                            bottom: 12,
                        },
                    }}
                    loading={
                        <div className="flex items-center justify-center h-full bg-neutral-50 dark:bg-neutral-900">
                            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                        </div>
                    }
                />
            </div>

            {renderValidationResult()}
        </div>
    );
}