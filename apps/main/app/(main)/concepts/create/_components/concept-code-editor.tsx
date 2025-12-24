"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@repo/ui/components/ui/button";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@repo/ui/components/ui/select";
import { Copy, Check, Loader2 } from "lucide-react";
import useTheme from '@repo/ui/components/themeprovider';
import toast from '@repo/ui/components/ui/sonner'

interface ConceptCodeEditorProps {
    language?: string;
    code?: string;
    readOnly?: boolean;
    height?: string;
    onChange?: (code: string) => void;
    onLanguageChange?: (language: string) => void;
    showLanguageSelector?: boolean;
    showCopyButton?: boolean;
    placeholder?: string;
    className?: string;
}

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
];

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

export default function ConceptCodeEditor({
    language = "javascript",
    code = "",
    readOnly = false,
    height = "200px",
    onChange,
    onLanguageChange,
    showLanguageSelector = true,
    showCopyButton = true,
    placeholder = "// Write your code here...",
    className = "",
}: ConceptCodeEditorProps) {
    const { theme } = useTheme();
    const [currentLanguage, setCurrentLanguage] = useState(language);
    const [currentCode, setCurrentCode] = useState(code || "");
    const [copied, setCopied] = useState(false);
    const editorRef = useRef<any>(null);

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

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    const handleLanguageChange = (newLanguage: string) => {
        setCurrentLanguage(newLanguage);
        if (onLanguageChange) {
            onLanguageChange(newLanguage);
        }
    };

    const handleCodeChange = (value: string | undefined) => {
        const newCode = value || "";
        setCurrentCode(newCode);
        if (onChange) {
            onChange(newCode);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentCode);
            setCopied(true);
            toast.success("Code copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error("Failed to copy");
        }
    };

    const getMonacoLanguage = (lang: string): string => {
        return languageMap[lang] || lang;
    };

    return (
        <div className={`flex flex-col border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-2">
                    {showLanguageSelector ? (
                        <Select
                            value={currentLanguage}
                            onValueChange={handleLanguageChange}
                            disabled={readOnly}
                        >
                            <SelectTrigger className="w-[130px] h-7 text-xs">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <SelectItem key={lang.value} value={lang.value} className="text-xs">
                                        {lang.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded">
                            {SUPPORTED_LANGUAGES.find(l => l.value === currentLanguage)?.label || currentLanguage}
                        </div>
                    )}
                </div>

                {showCopyButton && currentCode && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 text-xs px-2"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3 w-3 mr-1" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Editor */}
            <div style={{ height }}>
                <Editor
                    height="100%"
                    language={getMonacoLanguage(currentLanguage)}
                    value={currentCode}
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
                        placeholder: placeholder,
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
