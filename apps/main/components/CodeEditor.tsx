"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@repo/ui/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import { Play, Send, Copy, Check, Loader2 } from "lucide-react";
import useTheme from "@repo/ui/components/themetoggle";
import toast from "@repo/ui/components/ui/sonner";

interface CodeEditorProps {
    language?: string;
    initialCode?: string;
    readOnly?: boolean;
    questionType?: "DSA" | "Development";
    showRunSubmit?: boolean;
    allowCopyPaste?: boolean;
    allowRightClick?: boolean;
    onRun?: (code: string) => void | Promise<void>;
    onSubmit?: (code: string) => void | Promise<void>;
    allowedLanguages?: string[];
    onLanguageChange?: (language: string) => void;
    forceCode?: string;
    isRunning?: boolean;
    isSubmitting?: boolean;
    height?: string;
    onChange?: (code: string) => void;
}

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
};

const getDefaultCode = (language: string, questionType?: string): string => {
    if (questionType === "Development") {
        switch (language) {
            case "html":
                return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <!-- Your code here -->
</body>
</html>`;
            case "css":
                return `/* Your styles here */
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
}`;
            case "javascript":
                return `// Write your code here
function solution() {
    // Your implementation
}`;
            default:
                return "";
        }
    } else {
        // DSA templates
        switch (language) {
            case "javascript":
                return `// Write your solution here
function solution(input) {
    // Your implementation
    return result;
}`;
            case "typescript":
                return `// Write your solution here
function solution(input: any): any {
    // Your implementation
    return result;
}`;
            case "python":
                return `# Write your solution here
def solution(input):
    # Your implementation
    return result`;
            case "java":
                return `// Write your solution here
public class Solution {
    public static void solution(String input) {
        // Your implementation
    }
}`;
            case "cpp":
                return `// Write your solution here
#include <iostream>
using namespace std;

int main() {
    // Your implementation
    return 0;
}`;
            default:
                return "// Write your code here";
        }
    }
};

export default function CodeEditor({
    language = "javascript",
    initialCode,
    readOnly = false,
    questionType = "DSA",
    showRunSubmit = true,
    allowCopyPaste = true,
    allowRightClick = true,
    onRun,
    onSubmit,
    allowedLanguages,
    onLanguageChange,
    forceCode,
    isRunning = false,
    isSubmitting = false,
    height = "100%",
    onChange,
}: CodeEditorProps) {
    const { theme } = useTheme();
    const [currentLanguage, setCurrentLanguage] = useState(language);
    const [code, setCode] = useState(
        forceCode || initialCode || getDefaultCode(language, questionType)
    );
    const [copied, setCopied] = useState(false);
    const editorRef = useRef<unknown>(null);

    // Update code when forceCode changes
    useEffect(() => {
        if (forceCode !== undefined) {
            setCode(forceCode);
        }
    }, [forceCode]);

    // Update code when initialCode changes
    useEffect(() => {
        if (initialCode && !forceCode) {
            setCode(initialCode);
        }
    }, [initialCode, forceCode]);

    // Update language when prop changes
    useEffect(() => {
        setCurrentLanguage(language);
    }, [language]);

    const handleEditorDidMount = (editor: unknown) => {
        editorRef.current = editor;
        const monacoEditor = editor as {
            onContextMenu: (callback: (e: { event: { preventDefault: () => void } }) => void) => void
            onKeyDown: (callback: (e: { ctrlKey: boolean; metaKey: boolean; code: string; preventDefault: () => void }) => void) => void
        };

        // Disable right-click context menu if not allowed
        if (!allowRightClick) {
            monacoEditor.onContextMenu((e) => {
                e.event.preventDefault();
            });
        }

        // Disable copy/paste if not allowed
        if (!allowCopyPaste) {
            monacoEditor.onKeyDown((e) => {
                const isCopyPaste =
                    (e.ctrlKey || e.metaKey) &&
                    (e.code === "KeyC" || e.code === "KeyV" || e.code === "KeyX");
                if (isCopyPaste) {
                    e.preventDefault();
                }
            });
        }
    };

    const handleLanguageChange = (newLanguage: string) => {
        setCurrentLanguage(newLanguage);
        if (onLanguageChange) {
            onLanguageChange(newLanguage);
        }
        // Update code template for new language
        if (!initialCode && !forceCode) {
            setCode(getDefaultCode(newLanguage, questionType));
        }
    };

    const handleCodeChange = (value: string | undefined) => {
        const newCode = value || "";
        setCode(newCode);
        if (onChange) {
            onChange(newCode);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast.success("Code copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.log("Failed to copy code: " + error);
            toast.error("Failed to copy code: " + error);
        }
    };

    const handleRun = async () => {
        if (onRun && !isRunning) {
            await onRun(code);
        }
    };

    const handleSubmit = async () => {
        if (onSubmit && !isSubmitting) {
            await onSubmit(code);
        }
    };

    const getMonacoLanguage = (lang: string): string => {
        return languageMap[lang] || lang;
    };

    const availableLanguages = allowedLanguages || Object.keys(languageMap);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                    {allowedLanguages && allowedLanguages.length > 1 && (
                        <Select
                            value={currentLanguage}
                            onValueChange={handleLanguageChange}
                            disabled={readOnly}
                        >
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableLanguages.map((lang) => (
                                    <SelectItem key={lang} value={lang} className="text-xs">
                                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {!allowedLanguages && (
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1)}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {allowCopyPaste && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-8 text-xs"
                            disabled={readOnly && !code}
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

                    {showRunSubmit && !readOnly && (
                        <>
                            {onRun && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRun}
                                    disabled={isRunning || isSubmitting}
                                    className="h-8 text-xs"
                                >
                                    {isRunning ? (
                                        <>
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-3 w-3 mr-1" />
                                            Run
                                        </>
                                    )}
                                </Button>
                            )}

                            {onSubmit && (
                                <Button
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={isRunning || isSubmitting}
                                    className="h-8 text-xs bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-3 w-3 mr-1" />
                                            {onRun ? "Run & Submit" : "Submit"}
                                        </>
                                    )}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden" style={{ height }}>
                <Editor
                    height="100%"
                    language={getMonacoLanguage(currentLanguage)}
                    value={code}
                    onChange={handleCodeChange}
                    onMount={handleEditorDidMount}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                        readOnly,
                        minimap: { enabled: false },
                        fontSize: 14,
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
                        contextmenu: allowRightClick,
                        scrollbar: {
                            vertical: "auto",
                            horizontal: "auto",
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                        },
                        padding: {
                            top: 16,
                            bottom: 16,
                        },
                    }}
                    loading={
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    }
                />
            </div>
        </div>
    );
}

