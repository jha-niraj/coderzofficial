import { auth } from "@repo/auth"
import { redirect } from "next/navigation"
import { getCodebaseProject } from "@/actions/(main)/ai/codesage/project.action"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileCode2, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"

const STATUS_CONFIG = {
    ready:    { icon: CheckCircle2, color: "text-green-500", label: "Ready" },
    indexing: { icon: Loader2,      color: "text-blue-500 animate-spin", label: "Indexing" },
    failed:   { icon: AlertCircle,  color: "text-red-500",  label: "Failed" },
} as const

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const { slug } = await params
    const { project } = await getCodebaseProject(slug)
    if (!project) notFound()

    const stack = project.detectedStack as Record<string, string> | null
    const statusKey = project.indexStatus as keyof typeof STATUS_CONFIG
    const status = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.indexing
    const StatusIcon = status.icon

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Project top bar */}
            <div className="border-b border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 h-14">
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                            <Link href="/ai/codesage">
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>

                        <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700" />

                        <FileCode2 className="w-4 h-4 text-neutral-500 shrink-0" />
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">{project.name}</span>

                        {stack?.framework && (
                            <Badge variant="secondary" className="text-[10px] font-normal hidden sm:inline-flex">
                                {stack.framework}
                            </Badge>
                        )}
                        {stack?.language && (
                            <Badge variant="outline" className="text-[10px] font-normal hidden sm:inline-flex">
                                {stack.language}
                            </Badge>
                        )}

                        <div className="ml-auto flex items-center gap-1.5">
                            <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                            <span className="text-xs text-neutral-500">{status.label}</span>
                            {project.fileCount && (
                                <span className="text-xs text-neutral-400 hidden sm:inline">· {project.fileCount} files</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {children}
        </div>
    )
}
