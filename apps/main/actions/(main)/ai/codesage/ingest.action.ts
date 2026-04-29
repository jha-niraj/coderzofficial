"use server"

import { auth } from "@repo/auth"
import { prisma } from "@repo/prisma"
import { revalidatePath } from "next/cache"

// ── Source file detection ─────────────────────────────────────────────────────
const SOURCE_EXTENSIONS = new Set([
    "ts", "tsx", "js", "jsx", "mjs", "cjs",
    "py", "go", "rs", "java", "kt", "rb", "php", "cs", "swift",
    "cpp", "c", "h", "hpp",
    "prisma", "graphql", "gql", "sql",
    "vue", "svelte",
    "css", "scss", "sass",
    "md",
])

const EXCLUDED_PATH_FRAGMENTS = [
    "node_modules/", ".git/", ".next/", "dist/", "build/", "out/",
    ".turbo/", ".cache/", "coverage/", "__pycache__/", "vendor/",
    ".pytest_cache/", "target/", ".cargo/",
]

const ALWAYS_INCLUDE_NAMES = new Set([
    "package.json", "tsconfig.json", "next.config.js", "next.config.ts",
    "vite.config.ts", "vite.config.js", "tailwind.config.ts", "tailwind.config.js",
    ".env.example", "docker-compose.yml", "docker-compose.yaml",
    "prisma.config.ts",
])

function isSourceFile(path: string, size: number): boolean {
    if (size > 200_000) return false // skip files > 200KB
    if (EXCLUDED_PATH_FRAGMENTS.some(f => path.includes(f))) return false
    if (path.endsWith(".min.js") || path.endsWith(".min.css")) return false
    if (path.endsWith(".map") || path.endsWith(".lock") || path.endsWith(".log")) return false

    const parts = path.split("/")
    const fileName = parts[parts.length - 1] ?? ""
    if (ALWAYS_INCLUDE_NAMES.has(fileName)) return true

    const ext = fileName.split(".").pop()?.toLowerCase()
    if (!ext) return false
    return SOURCE_EXTENSIONS.has(ext)
}

// ── Language detection ────────────────────────────────────────────────────────
function detectLanguage(ext: string): string {
    const map: Record<string, string> = {
        ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript",
        py: "Python", go: "Go", rs: "Rust", java: "Java", kt: "Kotlin",
        rb: "Ruby", php: "PHP", cs: "C#", swift: "Swift",
        cpp: "C++", c: "C", h: "C/C++ Header",
        prisma: "Prisma", graphql: "GraphQL", gql: "GraphQL", sql: "SQL",
        vue: "Vue", svelte: "Svelte",
        css: "CSS", scss: "SCSS", sass: "Sass",
        md: "Markdown",
    }
    return map[ext] ?? ext.toUpperCase()
}

// ── Framework detection from file tree ───────────────────────────────────────
function detectStack(filePaths: string[], packageJson?: string): Record<string, string> {
    const stack: Record<string, string> = {}

    if (filePaths.some(p => p.endsWith("next.config.js") || p.endsWith("next.config.ts"))) {
        stack.framework = "Next.js"
    } else if (filePaths.some(p => p.endsWith("vite.config.ts") || p.endsWith("vite.config.js"))) {
        stack.framework = "Vite/React"
    } else if (filePaths.some(p => p.endsWith("angular.json"))) {
        stack.framework = "Angular"
    } else if (filePaths.some(p => p.endsWith("nuxt.config.ts"))) {
        stack.framework = "Nuxt.js"
    }

    if (filePaths.some(p => p.endsWith(".prisma"))) stack.orm = "Prisma"
    if (filePaths.some(p => p.endsWith("drizzle.config.ts"))) stack.orm = "Drizzle"

    const tsCount = filePaths.filter(p => p.endsWith(".ts") || p.endsWith(".tsx")).length
    const pyCount = filePaths.filter(p => p.endsWith(".py")).length
    const goCount = filePaths.filter(p => p.endsWith(".go")).length

    if (tsCount > pyCount && tsCount > goCount) stack.language = "TypeScript"
    else if (pyCount > goCount) stack.language = "Python"
    else if (goCount > 0) stack.language = "Go"

    if (filePaths.some(p => p === "pnpm-lock.yaml")) stack.packageManager = "pnpm"
    else if (filePaths.some(p => p === "yarn.lock")) stack.packageManager = "yarn"
    else if (filePaths.some(p => p === "package-lock.json")) stack.packageManager = "npm"

    if (filePaths.some(p => p === "turbo.json" || p === "pnpm-workspace.yaml")) {
        stack.monorepo = "Turborepo"
    }

    if (packageJson) {
        try {
            const pkg = JSON.parse(packageJson)
            const deps = { ...pkg.dependencies, ...pkg.devDependencies }
            if (deps.tailwindcss) stack.css = "TailwindCSS"
            if (deps.prisma) stack.orm = "Prisma"
            if (deps.drizzle) stack.orm = "Drizzle"
        } catch { /* ignore */ }
    }

    return stack
}

// ── Build nested file tree ────────────────────────────────────────────────────
type FileTreeNode = { _type: "file"; path: string; ext: string } | { _type: "dir"; children: Record<string, FileTreeNode> }

function buildFileTree(filePaths: string[]): Record<string, FileTreeNode> {
    const tree: Record<string, FileTreeNode> = {}
    for (const filePath of filePaths) {
        const parts = filePath.split("/")
        let node = tree
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i]!
            if (!node[part]) {
                node[part] = { _type: "dir", children: {} }
            }
            const n = node[part]
            if (n._type === "dir") node = n.children
        }
        const fileName = parts[parts.length - 1]!
        const ext = fileName.split(".").pop() ?? ""
        node[fileName] = { _type: "file", path: filePath, ext }
    }
    return tree
}

// ── Parse GitHub URL ──────────────────────────────────────────────────────────
function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string } | null {
    const cleaned = url.trim().replace(/\.git$/, "")
    const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/([^/]+))?$/)
    if (match) return { owner: match[1]!, repo: match[2]!, branch: match[3] }
    const shorthand = cleaned.match(/^([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/)
    if (shorthand) return { owner: shorthand[1]!, repo: shorthand[2]! }
    return null
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
}

async function uniqueSlug(base: string): Promise<string> {
    let slug = base
    let attempt = 0
    while (await prisma.codebaseProject.findUnique({ where: { slug }, select: { id: true } })) {
        attempt++
        slug = `${base}-${attempt}`
    }
    return slug
}

// ── Main ingestion action ─────────────────────────────────────────────────────
export async function ingestGitHubRepo(input: {
    name: string
    githubUrl: string
    description?: string
    githubToken?: string
}) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const parsed = parseGitHubUrl(input.githubUrl)
    if (!parsed) return { success: false, error: "Invalid GitHub URL. Use format: github.com/owner/repo" }

    const { owner, repo, branch = "main" } = parsed
    const slug = await uniqueSlug(generateSlug(input.name || repo))

    // Create project record with "indexing" status
    const project = await prisma.codebaseProject.create({
        data: {
            userId: session.user.id,
            name: input.name || repo,
            slug,
            description: input.description,
            sourceType: "github",
            sourceUrl: input.githubUrl,
            repoOwner: owner,
            repoName: repo,
            branch,
            indexStatus: "indexing",
        },
    })

    try {
        const headers: Record<string, string> = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "CodeSage/1.0",
        }
        if (input.githubToken) headers.Authorization = `token ${input.githubToken}`

        // Step 1: Get default branch if branch not specified
        let activeBranch = branch
        if (activeBranch === "main") {
            const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers })
            if (repoRes.ok) {
                const repoData = await repoRes.json() as { default_branch?: string }
                activeBranch = repoData.default_branch ?? "main"
            }
        }

        // Step 2: Get recursive file tree
        const treeRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/${activeBranch}?recursive=1`,
            { headers }
        )
        if (!treeRes.ok) {
            const errData = await treeRes.json() as { message?: string }
            const errMsg = treeRes.status === 404
                ? "Repository not found. Make sure it exists and is public (or provide a GitHub token for private repos)."
                : treeRes.status === 403
                    ? "GitHub rate limit exceeded. Provide a GitHub personal access token to continue."
                    : errData.message ?? `GitHub API error: ${treeRes.status}`
            await prisma.codebaseProject.update({
                where: { id: project.id },
                data: { indexStatus: "failed", errorMessage: errMsg },
            })
            return { success: false, error: errMsg }
        }

        const treeData = await treeRes.json() as { tree?: Array<{ type: string; path: string; sha: string; size?: number }> }
        const allFiles = treeData.tree ?? []

        // Step 3: Filter source files
        const sourceFiles = allFiles
            .filter(f => f.type === "blob" && isSourceFile(f.path, f.size ?? 0))
            .slice(0, 500)

        if (sourceFiles.length === 0) {
            await prisma.codebaseProject.update({
                where: { id: project.id },
                data: { indexStatus: "failed", errorMessage: "No source files found in repository." },
            })
            return { success: false, error: "No source files found." }
        }

        // Step 4: Fetch file contents in batches of 8
        const BATCH = 8
        const fetchedFiles: Array<{ path: string; content: string; size: number }> = []
        let packageJsonContent: string | undefined

        for (let i = 0; i < sourceFiles.length; i += BATCH) {
            const batch = sourceFiles.slice(i, i + BATCH)
            const results = await Promise.all(
                batch.map(async f => {
                    try {
                        const res = await fetch(
                            `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(f.path)}?ref=${activeBranch}`,
                            { headers }
                        )
                        if (!res.ok) return null
                        const data = await res.json() as { content?: string; encoding?: string }
                        if (!data.content || data.encoding !== "base64") return null
                        const content = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8")
                        return { path: f.path, content: content.slice(0, 25_000), size: f.size ?? 0 }
                    } catch {
                        return null
                    }
                })
            )
            for (const r of results) {
                if (r) {
                    fetchedFiles.push(r)
                    if (r.path === "package.json") packageJsonContent = r.content
                }
            }
        }

        // Step 5: Detect stack
        const allPaths = allFiles.map(f => f.path)
        const detectedStack = detectStack(allPaths, packageJsonContent)

        // Step 6: Build file tree for sidebar
        const fileTree = buildFileTree(fetchedFiles.map(f => f.path))

        // Step 7: Store files in DB
        const totalLines = fetchedFiles.reduce((sum, f) => sum + f.content.split("\n").length, 0)

        await prisma.codebaseFile.createMany({
            data: fetchedFiles.map(f => {
                const parts = f.path.split("/")
                const fileName = parts[parts.length - 1] ?? f.path
                const ext = fileName.split(".").pop() ?? ""
                const lineCount = f.content.split("\n").length
                return {
                    projectId: project.id,
                    filePath: f.path,
                    fileName,
                    extension: ext,
                    content: f.content,
                    lineCount,
                    sizeBytes: f.size,
                    language: detectLanguage(ext),
                }
            }),
        })

        // Step 8: Update project to ready
        await prisma.codebaseProject.update({
            where: { id: project.id },
            data: {
                indexStatus: "ready",
                fileCount: fetchedFiles.length,
                totalLines,
                detectedStack,
                fileTree: fileTree as never,
                branch: activeBranch,
                indexedAt: new Date(),
            },
        })

        revalidatePath("/ai/codesage")
        return { success: true, slug: project.slug, fileCount: fetchedFiles.length }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Ingestion failed"
        await prisma.codebaseProject.update({
            where: { id: project.id },
            data: { indexStatus: "failed", errorMessage: message },
        })
        return { success: false, error: message }
    }
}
