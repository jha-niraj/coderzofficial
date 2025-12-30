"use client"

export const BackgroundOrbits = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

            {/* The "Medium-style" Warm Curvature */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,160,80,0.15),transparent_70%)] blur-[80px] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,100,50,0.1),transparent_70%)]" />

            {/* Schematic Orbits */}
            <div className="absolute h-[600px] w-[600px] border border-neutral-900/5 dark:border-white/5 rounded-full" />
            <div className="absolute h-[800px] w-[800px] border border-neutral-900/5 dark:border-white/5 rounded-full" />
            <div className="absolute h-[1000px] w-[1000px] border border-neutral-900/5 dark:border-white/5 rounded-full" />

            {/* Decorative "Planets" on Orbit */}
            <div className="absolute h-[800px] w-[800px] animate-spin-slow">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full blur-[1px]" />
            </div>
        </div>
    )
}