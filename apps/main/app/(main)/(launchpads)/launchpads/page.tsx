import { 
    getCoderzProducts, getCommunityProducts, getFeaturedProducts 
} from "@/actions/(main)/launchpads"
import { LaunchpadsContent } from "./_components/launchpads-content"
import { LaunchpadsHeader } from "./_components/launchpads-header"
import type { LaunchpadProduct } from "@/types/launchpads"

export const dynamic = 'force-dynamic'

/** Convert Prisma product (features as JsonValue) to LaunchpadProduct */
function toLaunchpadProduct(p: Record<string, unknown>): LaunchpadProduct {
    const features = p.features
    const featuresArray = Array.isArray(features) ? features : (features ? [] : undefined)
    return {
        ...p,
        features: featuresArray,
        twitterUrl: p.twitterUrl ?? undefined,
    } as LaunchpadProduct
}

export default async function LaunchpadsPage() {
    // Fetch data server-side
    const [coderzResult, communityResult, featuredResult] = await Promise.all([
        getCoderzProducts(20),
        getCommunityProducts(20, 0),
        getFeaturedProducts(5)
    ])

    const coderzProducts = (coderzResult?.success && coderzResult.data ? coderzResult.data : []).map(toLaunchpadProduct)
    const communityProducts = (communityResult?.success && communityResult.data ? communityResult.data : []).map(toLaunchpadProduct)
    const featuredProducts = (featuredResult?.success && featuredResult.data ? featuredResult.data : []).map(toLaunchpadProduct)

    return (
        <>
            <LaunchpadsHeader />
            <LaunchpadsContent
                coderzProducts={coderzProducts}
                communityProducts={communityProducts}
                featuredProducts={featuredProducts}
            />
        </>
    )
}