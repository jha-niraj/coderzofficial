import { auth } from "@repo/auth";
import { redirect, notFound } from "next/navigation";
import { getStudioWithSteps } from "@/actions/(main)/studios/studio.actions";
import { StudioContainer } from "@/components/studio/studio-container";

interface StudioPageProps {
    params: Promise<{ slug: string }>;
}

export default async function StudioSlugPage({ params }: StudioPageProps) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect(`/login?callbackUrl=/studio/${(await params).slug}`);
    }

    const { slug } = await params;
    const result = await getStudioWithSteps(slug);

    if (!result.success || !result.studio) {
        notFound();
    }

    return (
        <StudioContainer
            studio={result.studio}
            backUrl="/studio"
        />
    );
}
