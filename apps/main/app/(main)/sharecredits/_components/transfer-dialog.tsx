"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowRight, Check, Coins, AlertCircle, X, Loader2
} from "lucide-react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog"
import {
    Button
} from "@repo/ui/components/ui/button"
import {
    Avatar, AvatarFallback, AvatarImage

} from "@repo/ui/components/ui/avatar"
import toast from "@repo/ui/components/ui/sonner";

interface TransferDialogProps {
    open: boolean
    onClose: () => void
    sender: { name: string; image: string }
    recipient: { name: string; image: string }
    creditAmount: number
    onTransfer: () => Promise<boolean>
}

export default function TransferDialog({
    open, onClose, sender, recipient, creditAmount, onTransfer
}: TransferDialogProps) {
    const [transferState, setTransferState] = useState<"confirming" | "processing" | "completed" | "failed">("confirming")

    const handleConfirm = async () => {
        setTransferState("processing")
        try {
            const success = await onTransfer();
            if (success) {
                setTransferState("completed");
            } else {
                throw new Error("Transfer returned false");
            }
        } catch (err) {
            console.error(err)
            toast.error("Transfer failed. Please check your balance and try again.");
            setTransferState("failed");
        }
    }

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) setTransferState("confirming")
    }, [open])

    return (
        <Dialog open={open} onOpenChange={(val) => !val && transferState !== "processing" && onClose()}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center text-neutral-900 dark:text-white">
                        {
                            transferState === "completed" ? "Transfer Successful" :
                                transferState === "failed" ? "Transfer Failed" :
                                    "Confirm Transfer"
                        }
                    </DialogTitle>
                </DialogHeader>
                <div className="py-6">
                    <AnimatePresence mode="wait">
                        {
                            transferState === "confirming" && (
                                <motion.div
                                    key="confirming"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center justify-between px-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <Avatar className="h-16 w-16 border-2 border-emerald-100 dark:border-emerald-900">
                                                <AvatarImage src={sender.image} />
                                                <AvatarFallback>ME</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-medium text-neutral-500">From You</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center px-4">
                                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xl mb-2">
                                                <Coins className="w-5 h-5" />
                                                {creditAmount}
                                            </div>
                                            <div className="w-full h-0.5 bg-neutral-100 dark:bg-neutral-800 relative">
                                                <div className="absolute inset-0 bg-emerald-500/20 animate-pulse"></div>
                                                <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4 bg-white dark:bg-neutral-900 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <Avatar className="h-16 w-16 border-2 border-emerald-100 dark:border-emerald-900">
                                                <AvatarImage src={recipient.image} />
                                                <AvatarFallback>{recipient.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-medium text-neutral-500 text-center max-w-[60px] truncate">{recipient.name}</span>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl text-sm text-neutral-600 dark:text-neutral-400 text-center">
                                        Are you sure you want to send <strong className="text-emerald-600 dark:text-emerald-400">{creditAmount} credits</strong> to {recipient.name}? This action cannot be undone.
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={onClose} className="flex-1 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleConfirm} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700">
                                            Confirm
                                        </Button>
                                    </div>
                                </motion.div>
                            )
                        }
                        {
                            transferState === "processing" && (
                                <motion.div
                                    key="processing"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-8"
                                >
                                    <div className="relative">
                                        <div className="h-16 w-16 rounded-full border-4 border-neutral-100 dark:border-neutral-800"></div>
                                        <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                                    </div>
                                    <p className="mt-6 text-lg font-medium text-neutral-900 dark:text-white">Processing Transaction...</p>
                                    <p className="text-sm text-neutral-500">Securely moving your credits.</p>
                                </motion.div>
                            )
                        }
                        {
                            transferState === "completed" && (
                                <motion.div
                                    key="completed"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-4"
                                >
                                    <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                                        <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-center text-neutral-600 dark:text-neutral-400 mb-8 max-w-[80%]">
                                        Successfully sent {creditAmount} credits to {recipient.name}.
                                    </p>
                                    <Button onClick={onClose} className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                                        Done
                                    </Button>
                                </motion.div>
                            )
                        }
                        {
                            transferState === "failed" && (
                                <motion.div
                                    key="failed"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-4"
                                >
                                    <div className="h-20 w-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
                                        <X className="h-10 w-10 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <p className="text-center text-neutral-600 dark:text-neutral-400 mb-8 max-w-[80%]">
                                        Something went wrong. Please check your internet connection or credit balance.
                                    </p>
                                    <div className="flex gap-3 w-full">
                                        <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
                                        <Button onClick={() => setTransferState("confirming")} className="flex-1">Try Again</Button>
                                    </div>
                                </motion.div>
                            )
                        }
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    )
}