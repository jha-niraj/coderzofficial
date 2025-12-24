"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/components/ui/dialog"
import { Button } from "@repo/ui/components/ui/button"
import { Coins } from "lucide-react"

interface AnswerDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    userCredits: number
}

export function AnswerDialog({ open, onClose, onConfirm, userCredits }: AnswerDialogProps) {
    const requiredCredits = 4;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>View Answer</DialogTitle>
                    <DialogDescription>
                        This will cost {requiredCredits} credits to view the answer. You currently have {userCredits} credits.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                        <Coins className="h-6 w-6" />
                        <span>{requiredCredits}</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button 
                        onClick={onConfirm}
                        disabled={userCredits < requiredCredits}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                        View Answer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 