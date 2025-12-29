"use client"

import { Plus, Minus, Send } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar"

interface UserCardProps {
    user: {
        id: string | null
        username: string | null
        name: string | null
        avatar: string | null
    }
    creditAmount: number
    onCreditChange: (amount: number) => void
    onTransfer: () => void
    currentUserCredits: number
}

export default function UserCard({
    user, creditAmount, onCreditChange, onTransfer, currentUserCredits
}: UserCardProps) {
    const canAfford = currentUserCredits >= creditAmount;

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-800 p-6 transition-all hover:border-emerald-200 dark:hover:border-emerald-900 hover:shadow-emerald-100/50 dark:hover:shadow-none group">
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Avatar className="h-14 w-14 border-2 border-neutral-100 dark:border-neutral-800 shadow-sm">
                        <AvatarImage src={user.avatar || undefined} alt={user.name || 'User'} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 font-bold">
                            {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                        <h3 className="font-bold text-neutral-900 dark:text-white text-lg">{user.name || 'Unknown User'}</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">@{user.username || 'unknown'}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center bg-neutral-50 dark:bg-neutral-800 rounded-lg p-1 border border-neutral-200 dark:border-neutral-700">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white dark:hover:bg-neutral-700 text-neutral-500 rounded-md"
                            onClick={() => onCreditChange(creditAmount - 10)}
                            disabled={creditAmount <= 20}
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <div className="w-12 text-center font-bold text-neutral-900 dark:text-white text-sm">
                            {creditAmount}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white dark:hover:bg-neutral-700 text-neutral-500 rounded-md"
                            onClick={() => onCreditChange(creditAmount + 10)}
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    <Button
                        onClick={onTransfer}
                        disabled={!canAfford}
                        className={`w-full sm:w-auto gap-2 font-medium shadow-md transition-all ${canAfford
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                            }`}
                    >
                        {
                            canAfford ? (
                                <>
                                    Send Credits <Send className="w-3.5 h-3.5" />
                                </>
                            ) : (
                                "Insufficient Funds"
                            )
                        }
                    </Button>
                </div>
            </div>
        </div>
    )
}