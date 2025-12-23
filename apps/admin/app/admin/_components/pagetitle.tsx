import { cn } from "@repo/ui/lib/utils"

import { Bell, ChevronDown } from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";

interface PageTitleProps {
    title: string,
    className?: string
}

export default function PageTitle({ title, className }: PageTitleProps) {
    return (
        <div className="flex justify-between">
            <h1 className={cn("text-2xl font-semibold", className)}>
                {title}
            </h1>
            <div className="flex gap-3 items-center justify-center">
                <Bell />
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex gap-2">
                        Admin
                        <ChevronDown />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="absolute -right-10">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

    )
}