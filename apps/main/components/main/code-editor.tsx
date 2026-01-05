"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@repo/ui/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import { 
    Play, Send, Copy, Check, Loader2, Maximize2, Minimize2 
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
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "sql", label: "SQL" },
    { value: "json", label: "JSON" },
    { value: "yaml", label: "YAML" },
    { value: "markdown", label: "Markdown" },
    { value: "shell", label: "Shell/Bash" },
] as const;

const languageMap: Record<string, string> = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    csharp: "csharp",
    go: "go",
    rust: "rust",
    ruby: "ruby",
    php: "php",
    swift: "swift",
    kotlin: "kotlin",
    html: "html",
    css: "css",
    sql: "sql",
    json: "json",
    yaml: "yaml",
    markdown: "markdown",
    shell: "shell",
};

export interface CodeEditorProps {
    /** Initial code to display. If not provided, shows placeholder comment */
    code?: string;
    /** Programming language for syntax highlighting */
    language?: string;
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
    /** Show Run button - handler must be provided by parent */
    showRunButton?: boolean;
    /** Show Submit button - handler must be provided by parent */
    showSubmitButton?: boolean;
    /** Run button handler - provided by parent component */
    onRun?: (code: string) => void | Promise<void>;
    /** Submit button handler - provided by parent component */
    onSubmit?: (code: string) => void | Promise<void>;
    /** Whether run is in progress */
    isRunning?: boolean;
    /** Whether submit is in progress */
    isSubmitting?: boolean;
    /** Allowed languages (subset of supported languages) */
    allowedLanguages?: string[];
    /** Show expand/fullscreen button */
    showExpandButton?: boolean;
    /** Additional class names */
    className?: string;
    /** Placeholder text when no code is provided */
    placeholder?: string;
}

export default function CodeEditor({
    code,
    language = "javascript",
    height = "300px",
    readOnly = false,
    onChange,
    onLanguageChange,
    showLanguageSelector = true,
    showCopyButton = true,
    showRunButton = false,
    showSubmitButton = false,
    onRun,
    onSubmit,
    isRunning = false,
    isSubmitting = false,
    allowedLanguages,
    showExpandButton = false,
    className = "",
    placeholder = "// Write your code here...",
}: CodeEditorProps) {
    const { theme } = useTheme();
    const [currentLanguage, setCurrentLanguage] = useState(language);
    const [currentCode, setCurrentCode] = useState(code ?? "");
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const editorRef = useRef<unknown>(null);

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

    const handleRun = useCallback(async () => {
        if (onRun && !isRunning) {
            await onRun(currentCode);
        }
    }, [onRun, isRunning, currentCode]);

    const handleSubmit = useCallback(async () => {
        if (onSubmit && !isSubmitting) {
            await onSubmit(currentCode);
        }
    }, [onSubmit, isSubmitting, currentCode]);

    const getMonacoLanguage = (lang: string): string => {
        return languageMap[lang] || lang;
    };

    // Filter languages if allowedLanguages is provided
    const availableLanguages = allowedLanguages
        ? SUPPORTED_LANGUAGES.filter(l => allowedLanguages.includes(l.value))
        : SUPPORTED_LANGUAGES;

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
                    {showCopyButton && currentCode && (
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
                            {isExpanded ? (
                                <Minimize2 className="h-3 w-3" />
                            ) : (
                                <Maximize2 className="h-3 w-3" />
                            )}
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
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="h-3 w-3" />
                                    Run
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
                            disabled={isRunning || isSubmitting}
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
            <div style={{ height: isExpanded ? "calc(100% - 48px)" : height }}>
                <Editor
                    height="100%"
                    language={getMonacoLanguage(currentLanguage)}
                    value={currentCode || placeholder}
                    onChange={handleCodeChange}
                    onMount={handleEditorDidMount}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                        readOnly,
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
        </div>
    );
}