import { redirect } from "next/navigation";
import { getLearnBySlug } from "@/actions/(main)/learn/learn.action";

interface LearnPageProps {
    params: Promise<{
        slug: string;
    }>;
}

// This page redirects old /learn/[slug] URLs to the new /learn/[subcategorySlug]/[learnSlug] format
export default async function LearnSlugRedirect({ params }: LearnPageProps) {
    const { slug } = await params;

    // Try to find the learn and its subcategory
    const result = await getLearnBySlug(slug);

    if (result.learn && result.learn.subCategory?.slug) {
        redirect(`/learn/${result.learn.subCategory.slug}/${slug}`);
    }

    // Fallback: redirect to /learn if not found or no subcategory
    redirect(`/learn`);
}