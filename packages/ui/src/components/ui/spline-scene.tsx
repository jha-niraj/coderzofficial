'use client'

import { Suspense, lazy } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
    scene: string
    className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
    return (
        <Suspense
            fallback={
                <div className="w-full h-full flex items-center justify-center bg-black/50">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-neutral-600 border-t-neutral-200 rounded-full animate-spin"></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs text-neutral-400">
                            Loading 3D
                        </span>
                    </div>
                </div>
            }
        >
            <Spline
                scene={scene}
                className={className}
            />
        </Suspense>
    )
}