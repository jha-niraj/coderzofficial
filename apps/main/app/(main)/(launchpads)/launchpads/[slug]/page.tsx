import { getLaunchpadProductBySlug, getCoderzProducts, getCommunityProducts } from "@/actions/(main)/launchpads"
import { ProductDetail } from "./_components/product-detail"
import { ProductSidebar } from "./_components/product-sidebar"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug } = await params
    
    // Fetch all data server-side
    const [productResult, coderzResult, communityResult] = await Promise.all([
        getLaunchpadProductBySlug(slug),
        getCoderzProducts(20),
        getCommunityProducts(20, 0)
    ])

    if (!productResult.success || !productResult.data) {
        notFound()
    }

    const coderzProducts = coderzResult.success ? coderzResult.data : []
    const communityProducts = communityResult.success ? communityResult.data : []

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Products List */}
            <ProductSidebar 
                coderzProducts={coderzProducts || []}
                communityProducts={communityProducts || []}
                currentSlug={slug}
            />

            {/* Right Side - Product Details */}
            <ProductDetail product={productResult.data} />
        </div>
    )
}
