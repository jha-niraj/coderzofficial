"use client"

import Navbar from "@/components/landingpage/homepagenavbar"
import Footer from "@/components/landingpage/footer"
import { ReactNode } from "react"

export default function BlogsLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen w-full bg-white dark:bg-neutral-950 flex flex-col">
			<Navbar />
			<main className="flex-1 pt-16">{children}</main>
		</div>
	)
}