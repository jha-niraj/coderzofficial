"use client"

import type React from "react"
import { useEffect } from "react"
import { ReactLenis, useLenis } from "@/lib/lenis"

interface LenisProps {
	children: React.ReactNode
}

function SmoothScroll({ children }: LenisProps) {
	const lenis = useLenis(() => {
		// You can add scroll event handling here if needed
	})

	useEffect(() => {
		// Initial resize
		if (lenis) {
			lenis.resize()
		}

		// Set up a resize observer to detect content changes
		const resizeObserver = new ResizeObserver(() => {
			if (lenis) {
				lenis.resize()
			}
		})

		// Observe the document body
		if (typeof window !== "undefined") {
			resizeObserver.observe(document.body)
		}

		// Set up a window resize handler
		const handleResize = () => {
			if (lenis) {
				lenis.resize()
			}
		}

		window.addEventListener("resize", handleResize)

		// Set up a mutation observer to detect DOM changes
		const mutationObserver = new MutationObserver(() => {
			if (lenis) {
				lenis.resize()
			}
		})

		// Observe the document body for DOM changes
		if (typeof window !== "undefined") {
			mutationObserver.observe(document.body, {
				childList: true,
				subtree: true,
			})
		}

		// Clean up
		return () => {
			resizeObserver.disconnect()
			mutationObserver.disconnect()
			window.removeEventListener("resize", handleResize)
		}
	}, [lenis])

	useEffect(() => {
		// Fix for scrolling to bottom
		if (lenis) {
			// Force recalculation of scroll limits
			setTimeout(() => {
				lenis.resize();
			}, 500);

			// Add additional recalculations when content might change
			const recalculateInterval = setInterval(() => {
				lenis.resize();
			}, 2000);

			return () => {
				clearInterval(recalculateInterval);
			};
		}
	}, [lenis]);

	return (
		<ReactLenis
			root
			options={{
				duration: 1.2,
				syncTouch: true,
				touchMultiplier: 1.5,
				infinite: false,
				orientation: "vertical",
				gestureOrientation: "vertical",
				smoothWheel: true,
				wheelMultiplier: 1.2,
				autoResize: true,
				// @ts-expect-error smoothTouch is a valid lenis option but not in the type definitions
				smoothTouch: false,
			}}
		>
			{children}
		</ReactLenis>
	)
}

export default SmoothScroll;