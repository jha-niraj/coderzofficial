"use client"

import Link from "next/link"
import { LucideIcon } from "lucide-react"

import { cn } from "@repo/ui/lib/utils"
import { buttonVariants } from "@repo/ui/components/ui/button"
import { usePathname } from "next/navigation"
import { Separator } from "@repo/ui/components/ui/separator"

interface NavProps {
    isCollapsed: boolean
    links: {
        title: string
        icon: LucideIcon
        variant: "default" | "ghost"
        href: string
    }[]
}
export function Nav({ links, isCollapsed }: NavProps) {
    const pathname = usePathname();

    return (

        <div
            data-collapsed={isCollapsed}
            className="group flex flex-col items-start w-full gap-6 py-2 data-[collapsed=true]:py-2"
        >
            <nav className="grid gap-2 w-full group-[[data-collapsed=true]]:justify-center">
                {
                    links.map((link, index) =>
                        isCollapsed ? (
                            <>
                                <Link
                                    key={index}
                                    href={link.href}
                                    className={cn(
                                        buttonVariants({
                                            variant: link.href === pathname ? "default" : "ghost",
                                            size: "sm"
                                        }),
                                        "dark:bg-muted dark:text-white w-40 dark:hover:bg-muted dark:hover:text-white",
                                        "justify-start"
                                    )}
                                >
                                    <link.icon className="mr-2 h-5 w-5" />
                                    {link.title}
                                </Link>
                                <Separator />
                            </>
                        ) : ""
                    )
                }
            </nav>
        </div>
    )
}