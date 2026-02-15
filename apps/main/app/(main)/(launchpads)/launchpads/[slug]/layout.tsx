import { LaunchpadsHeader } from "../_components/launchpads-header"

export default function ProductDetailLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <LaunchpadsHeader />
            {children}
        </>
    )
}