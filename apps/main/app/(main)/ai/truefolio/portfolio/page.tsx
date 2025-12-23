import PortfolioDetails from "./_components/portfoliodetails";

export default async function PortfolioPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    
    return (
        <section>
            <PortfolioDetails username={username} />
        </section>
    )
}