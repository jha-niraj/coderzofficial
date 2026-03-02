import { notFound } from "next/navigation";
import { getProblemBySlug, getOrCreateSession } from "@/actions/(main)/practice";
import { PracticeWorkspace } from "../../_components/workspace/practice-workspace";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ mode?: string }>;
}

export default async function DSAProblemPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { mode } = await searchParams;

    const problem = await getProblemBySlug(slug);
    if (!problem || problem.module !== "DSA") return notFound();

    const practiceMode = mode === "exam" ? "EXAM" : "ASSIST";
    const session = await getOrCreateSession(slug, practiceMode);

    return (
        <PracticeWorkspace
            problem={problem}
            session={session}
            mode={practiceMode}
        />
    );
}