"use client"

import {
    Terminal, Cpu, Network, ShieldCheck, Zap
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { useSession } from '@repo/auth/client'
import { useRouter } from "next/navigation"
import { cn } from "@repo/ui/lib/utils"

export default function HeroSection() {
    const { data: session } = useSession()
    const router = useRouter()

    const handleAuthenticatedAction = (targetUrl: string) => {
        if (session) {
            router.push(targetUrl);
        } else {
            router.push('/signin');
        }
    }

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-black selection:bg-orange-100 dark:selection:bg-orange-900/30 flex items-center justify-center transition-colors duration-500">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div
                    className={cn(
                        "absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full blur-[100px]",
                        "bg-[radial-gradient(circle,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0)_70%)]",
                        "dark:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0)_70%)]"
                    )}
                />
                <div
                    className={cn(
                        "absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-[1400px] h-[900px] rounded-full blur-[150px]",
                        "bg-[radial-gradient(closest-side,rgba(255,200,150,0.25)_0%,rgba(255,240,230,0.1)_40%,rgba(0,0,0,0)_100%)]",
                        "dark:bg-[radial-gradient(closest-side,rgba(255,100,50,0.18)_0%,rgba(200,80,40,0.05)_40%,rgba(0,0,0,0)_100%)]"
                    )}
                />
                <div className="absolute top-[25%] left-[5%] w-96 h-96 rounded-full blur-[120px] animate-pulse-slow bg-orange-100/30 dark:bg-orange-900/10" />
                <div className="absolute top-[20%] right-[10%] w-96 h-96 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000 bg-neutral-100/40 dark:bg-neutral-800/20" />
                <div
                    className={cn(
                        "absolute inset-0 bg-[size:32px_32px]",
                        "bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]",
                        "dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]",
                        "[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
                    )}
                />
            </div>
            <div className="relative z-10 w-full px-6 pt-24 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <div className={cn(
                        "mb-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-mono uppercase tracking-wider shadow-sm",
                        "bg-white/60 dark:bg-white/5 backdrop-blur-md",
                        "border border-orange-200/50 dark:border-white/10",
                        "text-orange-900 dark:text-white/90"
                    )}>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        System Operational
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 drop-shadow-sm text-neutral-900 dark:text-white">
                        The Engineering <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-white dark:to-neutral-400">
                            Intelligence Suite.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-6 font-light text-neutral-700 dark:text-neutral-300">
                        Master system design, open source contribution, and full-stack architecture with a suite of specialized AI agents designed for serious developers.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10">
                        <Button
                            onClick={() => handleAuthenticatedAction("/home")}
                            className={cn(
                                "cursor-pointer h-14 px-8 text-base rounded-2xl font-bold transition-all hover:scale-105 duration-300",
                                "bg-neutral-900 text-white hover:bg-neutral-800 shadow-xl shadow-neutral-900/10",
                                "dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:shadow-[0_0_40px_-10px_rgba(255,150,100,0.2)]"
                            )}
                        >
                            <Terminal className="mr-2 h-5 w-5" />
                            Initialize Environment
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => scrollToSection("pricing")}
                            className={cn(
                                "cursor-pointer h-14 px-8 text-base rounded-2xl backdrop-blur-md transition-all duration-300",
                                "border-neutral-300 bg-white/50 text-neutral-900 hover:bg-white/80",
                                "dark:border-neutral-700 dark:bg-black/50 dark:text-white dark:hover:bg-white/10 dark:hover:border-neutral-500"
                            )}
                        >
                            View Compute Pricing
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                        {
                            [
                                { label: "Active Nodes", value: "2.4k", icon: Network },
                                { label: "Code Reviews", value: "15k+", icon: ShieldCheck },
                                { label: "Latency", value: "<50ms", icon: Zap },
                                { label: "Uptime", value: "99.9%", icon: Cpu },
                            ].map((stat, i) => (
                                <div key={i} className={cn(
                                    "group flex flex-col items-center p-6 rounded-2xl transition-all duration-300",
                                    "bg-white/60 border border-orange-100/50 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50",
                                    "dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10 dark:hover:border-white/10 dark:hover:shadow-none"
                                )}>
                                    <div className="p-3 rounded-full mb-3 group-hover:scale-110 transition-transform bg-orange-50 dark:bg-white/5">
                                        <stat.icon className="w-5 h-5 text-orange-800/70 dark:text-neutral-300" />
                                    </div>
                                    <div className="text-3xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs uppercase tracking-widest mt-2 font-medium text-neutral-600 dark:text-neutral-500">
                                        {stat.label}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-24 z-20 pointer-events-none bg-gradient-to-t from-white to-transparent dark:from-black dark:to-transparent" />

            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    )
}