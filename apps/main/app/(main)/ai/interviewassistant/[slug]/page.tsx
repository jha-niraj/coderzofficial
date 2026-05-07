import InterviewAssistantDetails from '../_components/interviewassistantdetails';

export default async function GenerationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return <InterviewAssistantDetails slug={slug} />;
} 