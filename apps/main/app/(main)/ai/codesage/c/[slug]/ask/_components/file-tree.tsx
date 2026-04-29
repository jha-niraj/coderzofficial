"use client"

import { useState } from "react"
import {
    ChevronRight, ChevronDown, File, Folder, FolderOpen, Pin, X
} from "lucide-react"
import { cn } from "@repo/ui/lib/utils"

// ── File icon by extension ─────────────────────────────────────────────────────
const EXT_COLORS: Record<string, string> = {
    ts: "text-blue-500", tsx: "text-blue-400", js: "text-yellow-500", jsx: "text-yellow-400",
    py: "text-green-500", go: "text-cyan-500", rs: "text-orange-500",
    prisma: "text-indigo-500", graphql: "text-pink-500", sql: "text-teal-500",
    css: "text-purple-500", scss: "text-pink-400",
    json: "text-amber-500", md: "text-neutral-500",
}

function getExtColor(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
    return EXT_COLORS[ext] ?? "text-neutral-400"
}

// ── Tree node types ───────────────────────────────────────────────────────────
type TreeNode =
    | { _type: "file"; path: string; ext: string }
    | { _type: "dir"; children: Record<string, TreeNode> }

interface FileTreeProps {
    tree: Record<string, TreeNode>
    pinnedFiles: string[]
    citedFiles: string[]
    onPinToggle: (path: string) => void
    onFileSelect: (path: string) => void
    selectedFile: string | null
}

function TreeItem({
    name,
    node,
    depth,
    pinnedFiles,
    citedFiles,
    onPinToggle,
    onFileSelect,
    selectedFile,
}: {
    name: string
    node: TreeNode
    depth: number
    pinnedFiles: string[]
    citedFiles: string[]
    onPinToggle: (path: string) => void
    onFileSelect: (path: string) => void
    selectedFile: string | null
}) {
    const [open, setOpen] = useState(depth < 1)

    if (node._type === "file") {
        const isPinned = pinnedFiles.includes(node.path)
        const isCited = citedFiles.includes(node.path)
        const isSelected = selectedFile === node.path

        return (
            <div
                className={cn(
                    "group flex items-center gap-1 py-0.5 px-2 rounded cursor-pointer text-xs transition-colors",
                    isSelected
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                )}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => onFileSelect(node.path)}
            >
                <File className={cn("w-3 h-3 shrink-0", !isSelected && getExtColor(name))} />
                <span className="truncate flex-1">{name}</span>

                {isCited && !isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" title="Referenced in AI response" />
                )}

                <button
                    onClick={e => { e.stopPropagation(); onPinToggle(node.path) }}
                    className={cn(
                        "shrink-0 transition-opacity",
                        isPinned
                            ? "opacity-100 text-amber-500"
                            : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-amber-500"
                    )}
                >
                    {isPinned ? <Pin className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                </button>
            </div>
        )
    }

    // Directory
    const hasContent = Object.keys(node.children).length > 0
    return (
        <div>
            <button
                className="flex items-center gap-1 py-0.5 px-2 w-full rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 transition-colors"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => setOpen(o => !o)}
            >
                {hasContent
                    ? open ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />
                    : <span className="w-3 h-3" />}
                {open
                    ? <FolderOpen className="w-3 h-3 shrink-0 text-amber-500" />
                    : <Folder className="w-3 h-3 shrink-0 text-amber-500" />}
                <span className="truncate">{name}</span>
            </button>
            {open && (
                <div>
                    {Object.entries(node.children)
                        .sort(([, a], [, b]) => {
                            if (a._type !== b._type) return a._type === "dir" ? -1 : 1
                            return 0
                        })
                        .map(([childName, childNode]) => (
                            <TreeItem
                                key={childName}
                                name={childName}
                                node={childNode}
                                depth={depth + 1}
                                pinnedFiles={pinnedFiles}
                                citedFiles={citedFiles}
                                onPinToggle={onPinToggle}
                                onFileSelect={onFileSelect}
                                selectedFile={selectedFile}
                            />
                        ))}
                </div>
            )}
        </div>
    )
}

export function FileTree({
    tree,
    pinnedFiles,
    citedFiles,
    onPinToggle,
    onFileSelect,
    selectedFile,
}: FileTreeProps) {
    const [search, setSearch] = useState("")

    const sortedEntries = Object.entries(tree).sort(([, a], [, b]) => {
        if (a._type !== b._type) return a._type === "dir" ? -1 : 1
        return 0
    })

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Filter files…"
                    className="w-full text-xs px-2 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border-0 outline-none placeholder:text-neutral-400 text-neutral-700 dark:text-neutral-300"
                />
            </div>

            {/* Pinned files */}
            {pinnedFiles.length > 0 && (
                <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
                    <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                        Pinned ({pinnedFiles.length})
                    </p>
                    <div className="space-y-0.5">
                        {pinnedFiles.map(path => (
                            <div key={path} className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                                <Pin className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                <span className="truncate flex-1 text-[10px] font-mono">{path.split("/").slice(-1)[0]}</span>
                                <button onClick={() => onPinToggle(path)} className="text-neutral-400 hover:text-red-500">
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tree */}
            <div className="flex-1 overflow-y-auto py-1 text-xs">
                {sortedEntries.map(([name, node]) => (
                    <TreeItem
                        key={name}
                        name={name}
                        node={node}
                        depth={0}
                        pinnedFiles={pinnedFiles}
                        citedFiles={citedFiles}
                        onPinToggle={onPinToggle}
                        onFileSelect={onFileSelect}
                        selectedFile={selectedFile}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="px-3 py-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-3 text-[10px] text-neutral-400">
                <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    Cited
                </span>
                <span className="flex items-center gap-1">
                    <Pin className="w-2.5 h-2.5 text-amber-500" />
                    Pinned to context
                </span>
            </div>
        </div>
    )
}
