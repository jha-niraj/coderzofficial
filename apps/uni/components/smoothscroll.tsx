"use client"

import React from "react"
import { ReactLenis } from "@/lib/lenis"

interface LenisProps {
    children: React.ReactNode
}

function SmoothScroll({ children }: LenisProps) {

    // We don't need manual resize observers because 'autoResize: true' handles it.
    // Manual observers conflict with internal ones and cause stuttering.

    return (
        <ReactLenis
            root
            options={{
                duration: 1.2,
                // syncTouch: true is often buggy on mobile mixed with native scroll
                syncTouch: false,
                touchMultiplier: 2,
                infinite: false,
                orientation: "vertical",
                gestureOrientation: "vertical",
                smoothWheel: true,
                wheelMultiplier: 1,
                // This option automatically listens to ResizeObserver on the body
                autoResize: true,
            }}
        >
            {children}
        </ReactLenis>
    )
}

export default SmoothScroll;