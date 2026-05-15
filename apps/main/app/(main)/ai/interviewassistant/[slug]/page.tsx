import type { Metadata } from 'next'
import InterviewAssistantDetails from '../_components/interviewassistantdetails';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: `Interview Prep: ${slug.replace(/-/g, ' ')} | BuildrHQ`,
        description: 'AI-generated interview questions and preparation guide for your target role.',
    };
}

export default async function GenerationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return <InterviewAssistantDetails slug={slug} />;
}
