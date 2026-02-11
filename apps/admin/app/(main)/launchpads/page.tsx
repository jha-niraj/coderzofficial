import { 
    adminGetAllProducts, adminGetPendingProducts, adminGetLaunchpadAnalytics 
} from "@/actions/launchpads/admin.action"
import { LaunchpadsAdminDashboard } from "./_components/launchpads-dashboard"

export const dynamic = 'force-dynamic'

export default async function AdminLaunchpadsPage() {
    // Fetch all data server-side
    const [allProductsResult, pendingResult, analyticsResult] = await Promise.all([
        adminGetAllProducts({ limit: 50 }),
        adminGetPendingProducts(),
        adminGetLaunchpadAnalytics()
    ])

    const allProducts = allProductsResult.success ? allProductsResult.data : []
    const pendingProducts = pendingResult.success ? pendingResult.data : []
    const analytics = analyticsResult.success ? analyticsResult.data : null

    return (
        <LaunchpadsAdminDashboard
            allProducts={allProducts || []}
            pendingProducts={pendingProducts || []}
            analytics={analytics || null}
        />
    )
}