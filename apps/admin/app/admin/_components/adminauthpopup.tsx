"use client"

import { motion } from "framer-motion"
import { Shield, AlertTriangle, Home, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useSession } from "next-auth/react"

export function AdminAuthPrompt() {
    const { data: session } = useSession()

    return (
        <div className="min-h-screen shadow-2xl bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full  max-w-md mx-auto"
            >
                <Card className="shadow-2xl border-red-200 dark:border-red-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-6">
                    <CardHeader className="text-center pb-2">
                        <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-4"
                        >
                            <Shield className="w-8 h-8 text-white" />
                        </motion.div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Admin Access Required
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            You need administrator privileges to access this area
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                                        Access Denied
                                    </h4>
                                    {
                                        session?.user ? (
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                Your account ({session.user.email}) does not have administrator privileges.
                                                Contact your system administrator if you believe this is an error.
                                            </p>
                                        ) : (
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                Please sign in with an administrator account to access the admin panel.
                                            </p>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {
                                session?.user ? (
                                    <Link href="/dashboard" className="w-full">
                                        <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white">
                                            <Home className="w-4 h-4 mr-2" />
                                            Go to User Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href="/signin" className="w-full">
                                        <Button className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white">
                                            <LogIn className="w-4 h-4 mr-2" />
                                            Sign In as Admin
                                        </Button>
                                    </Link>
                                )
                            }
                            <Link href="/" className="w-full">
                                <Button variant="outline" className="w-full">
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Need admin access? Contact your system administrator at{" "}
                                <Link href="mailto:admin@vyaparsetu.com" className="text-red-600 dark:text-red-400 hover:underline">
                                    admin@vyaparsetu.com
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
} 