"use client"

import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface Testimonial {
	text: string
	image: string
	name: string
	role: string
}

export const TestimonialsColumn = (props: {
	className?: string
	testimonials: Testimonial[]
	duration?: number
}) => {
	return (
		<div className={props.className}>
			<motion.div
				animate={{
					translateY: "-50%",
				}}
				transition={{
					duration: props.duration || 10,
					repeat: Infinity,
					ease: "linear",
					repeatType: "loop",
				}}
				className="flex flex-col gap-6 will-change-transform" // Added will-change-transform for smoothness
			>
				{
					[...new Array(2)].fill(0).map((_, index) => (
						<React.Fragment key={index}>
							{props.testimonials.map(({ text, image, name, role }, i) => (
								<div
									key={i}
									className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors hover:border-neutral-300 dark:hover:border-neutral-700"
								>
									<p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
										"{text}"
									</p>
									<div className="flex items-center gap-3">
										<div className="relative h-10 w-10 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-700">
											<Image
												src={image || "/placeholder.svg"}
												alt={name}
												fill
												className="object-cover"
											/>
										</div>
										<div className="flex flex-col">
											<span className="text-sm font-bold text-neutral-900 dark:text-white leading-none mb-1">
												{name}
											</span>
											<span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
												{role}
											</span>
										</div>
									</div>
								</div>
							))
							}
						</React.Fragment>
					))
				}
			</motion.div>
		</div>
	)
};