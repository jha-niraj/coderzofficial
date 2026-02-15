export default function LaunchpadsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
            {children}
        </div>
    )
}