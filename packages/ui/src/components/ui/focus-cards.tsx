"use client";
import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@repo/ui/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export const Card = React.memo(
	({
		card,
		index,
		hovered,
		setHovered,
		className
	}: {
		card: any;
		index: number;
		hovered: number | null;
		setHovered: React.Dispatch<React.SetStateAction<number | null>>;
		className: string;
	}) => (
		<Link href={card.link} className="space-y-3">
			<div
				onMouseEnter={() => setHovered(index)}
				onMouseLeave={() => setHovered(null)}
				className={cn(
					"rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-full w-full transition-all duration-300 ease-out",
					hovered !== null && hovered !== index && "blur-sm scale-[0.98]",
					className
				)}
			>
				<Image
					src={card.image}
					alt={card.title}
					fill
					className="object-cover absolute inset-0"
				/>
				<div
					className={cn(
						"absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
						hovered === index ? "opacity-100" : "opacity-0"
					)}
				>
					<div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
						<h3 className="text-lg font-semibold">{card.title}</h3>
						<p className="text-sm">{card.description}</p>
					</div>
				</div>
			</div>
		</Link>
	)
);

Card.displayName = "Card";

type Card = {
	title: string;
	description: string;
	icon: LucideIcon;
	link: string;
	image: string;
};

export function FocusCards({ cards }: { cards: Card[] }) {
	const [hovered, setHovered] = useState<number | null>(null);

	return (
		<div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto md:px-8 w-full">
			{cards.map((card, index) => (
				<Card
					key={card.title}
					card={card}
					index={index}
					hovered={hovered}
					setHovered={setHovered}
					className="h-64"
				/>
			))}
		</div>
	);
}
