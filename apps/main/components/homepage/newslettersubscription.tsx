"use client"

import { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Mail } from "lucide-react"
import toast from "@repo/ui/components/ui/sonner"

export function NewsletterSubscription() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        // Add newsletter subscription logic here
        setTimeout(() => {
            toast.success("Thanks for subscribing!")
            setEmail("")
            setLoading(false)
        }, 1000)
    }

    return (
        <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
            <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
            />
            <Button type="submit" disabled={loading} className="gap-2">
                <Mail className="w-4 h-4" />
                Subscribe
            </Button>
        </form>
    )
}