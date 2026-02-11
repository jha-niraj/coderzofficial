import { getCoderzProducts, getCommunityProducts, getFeaturedProducts } from "@/actions/(main)/launchpads"
import { LaunchpadsContent } from "./_components/launchpads-content"
import { LaunchpadsHeader } from "./_components/launchpads-header"

export const dynamic = 'force-dynamic'

export default async function LaunchpadsPage() {
    // Fetch data server-side
    const [coderzResult, communityResult, featuredResult] = await Promise.all([
        getCoderzProducts(20),
        getCommunityProducts(20, 0),
        getFeaturedProducts(5)
    ])

    const coderzProducts = coderzResult.success ? coderzResult.data : []
    const communityProducts = communityResult.success ? communityResult.data : []
    const featuredProducts = featuredResult.success ? featuredResult.data : []

    return (
        <>
            <LaunchpadsHeader />
            <LaunchpadsContent
                coderzProducts={coderzProducts || []}
                communityProducts={communityProducts || []}
                featuredProducts={featuredProducts || []}
            />
        </>
    )
}
