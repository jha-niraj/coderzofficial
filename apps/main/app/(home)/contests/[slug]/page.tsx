import ContestDetailsPage from "../_components/contestdetails";

export default async function ContestPage({ params } : { params : Promise<{ slug : string }> }) {
    const { slug } = await params;

    return (
        <ContestDetailsPage slug={slug} />
    )
}