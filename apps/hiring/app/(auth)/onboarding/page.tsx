'use client'

import { useState } from 'react'
import { useSession, signOut } from '@repo/auth/client';
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from "@repo/ui/components/ui/textarea"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle
} from '@repo/ui/components/ui/dialog'
import {
    Loader2, CheckCircle2, ArrowRight, ArrowLeft,
    Building2, Briefcase, LogOut, AlertCircle
} from 'lucide-react'
import toast from '@repo/ui/components/ui/sonner'
import { cn } from '@repo/ui/lib/utils'
import { completeOnboarding } from '@/actions/auth/onboarding.action'

const COMPANY_SIZES = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees"
]

const INDUSTRIES = [
    "Technology",
    "Finance & Banking",
    "Healthcare",
    "E-commerce",
    "Education",
    "Manufacturing",
    "Consulting",
    "Other"
]

const HIRING_GOALS = [
    { id: 'frontend', label: 'Frontend Engineers' },
    { id: 'backend', label: 'Backend Engineers' },
    { id: 'fullstack', label: 'Full Stack Engineers' },
    { id: 'mobile', label: 'Mobile Developers' },
    { id: 'devops', label: 'DevOps Engineers' },
    { id: 'data', label: 'Data Scientists/Engineers' },
    { id: 'ml', label: 'ML/AI Engineers' },
    { id: 'qa', label: 'QA/Test Engineers' },
]

const ROLE_OPTIONS = [
    { value: 'CEO', label: 'CEO / Chief Executive Officer', isHead: true },
    { value: 'CTO', label: 'CTO / Chief Technology Officer', isHead: true },
    { value: 'COFOUNDER', label: 'Co-Founder', isHead: true },
    { value: 'VP_ENGINEERING', label: 'VP Engineering', isHead: true },
    { value: 'HR_HEAD', label: 'HR Head / Director', isHead: true },
    { value: 'HR_MANAGER', label: 'HR Manager', isHead: false },
    { value: 'RECRUITER', label: 'Recruiter / Talent Acquisition', isHead: false },
    { value: 'HIRING_MANAGER', label: 'Hiring Manager', isHead: false },
]

export default function OnboardingPage() {
    const { update, data: session } = useSession()
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const [showExitDialog, setShowExitDialog] = useState(false)

    // Company Info
    const [companyName, setCompanyName] = useState('')
    const [companyWebsite, setCompanyWebsite] = useState('')
    const [industry, setIndustry] = useState('')
    const [companySize, setCompanySize] = useState('')
    const [description, setDescription] = useState('')

    // User Role
    const [userRole, setUserRole] = useState('')

    // Hiring Goals  
    const [hiringRoles, setHiringRoles] = useState<string[]>([])

    // Team Info
    const [teamMembers, setTeamMembers] = useState('')
    const [location, setLocation] = useState('')

    const toggleHiringRole = (roleId: string) => {
        setHiringRoles(prev =>
            prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
        )
    }

    const canProceed = () => {
        if (currentStep === 0) {
            return companyName.length >= 2 && industry && userRole
        }
        return true
    }

    const handleComplete = async () => {
        if (!canProceed()) return

        setLoading(true)
        try {
            const result = await completeOnboarding({
                companyName,
                website: companyWebsite || undefined,
                industry: industry || undefined,
                companySize: companySize || undefined,
                description: description || undefined,
                userRole,
                hiringGoals: hiringRoles,
            })

            if (!result.success) {
                throw new Error(result.error || 'Failed to complete onboarding')
            }

            toast.success('Workspace initialized successfully! 🚀')
            await update()
            window.location.href = '/home'
        } catch (error) {
            console.error('Onboarding error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to complete setup')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            await signOut({ callbackUrl: '/signin' })
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout')
            setLoggingOut(false)
        }
    }

    const steps = [
        { title: 'Company Info', description: 'Basic details & your role' },
        { title: 'Hiring Goals', description: 'What roles you need' },
        { title: 'Team Setup', description: 'Invite your team' },
    ]

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col">
            {/* Grid Background */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

            <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <DialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-neutral-900 dark:text-white">
                            <AlertCircle className="w-5 h-5" />
                            Complete Setup First
                        </DialogTitle>
                        <DialogDescription className="text-neutral-500">
                            You need to complete your workspace setup to access the platform.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowExitDialog(false)} className="border-neutral-200 dark:border-neutral-800">
                            Continue Setup
                        </Button>
                        <Button onClick={handleLogout} disabled={loggingOut} className="bg-neutral-900 dark:bg-white text-white dark:text-black">
                            {loggingOut ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Logging out...
                                </>
                            ) : (
                                <>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <nav className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl relative z-10">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setShowExitDialog(true)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white dark:text-black" />
                        </div>
                        <span className="text-lg font-bold text-neutral-900 dark:text-white">
                            CODER&apos;Z <span className="text-neutral-500 font-mono font-normal text-sm">HIRING</span>
                        </span>
                    </button>

                    <div className="flex items-center gap-4">
                        {session?.user?.email && (
                            <span className="text-sm text-neutral-500 hidden sm:block font-mono">
                                {session.user.email}
                            </span>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                        >
                            {loggingOut ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <LogOut className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex items-center justify-center p-4 w-full overflow-hidden relative z-10">
                <div className="w-full max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="text-center mb-8">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                                Workspace Initialization
                            </span>
                            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                                Configure Your Hiring Infrastructure
                            </h1>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex justify-center gap-4 mb-8">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all border",
                                        idx < currentStep
                                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-transparent'
                                            : idx === currentStep
                                                ? 'bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white border-neutral-900 dark:border-white'
                                                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 border-neutral-200 dark:border-neutral-800'
                                    )}>
                                        {idx < currentStep ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <div className="hidden md:block">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            idx <= currentStep ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
                                        )}>
                                            {step.title}
                                        </p>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={cn(
                                            "w-8 h-px",
                                            idx < currentStep ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-800'
                                        )} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <Card className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-3xl">
                        <CardContent className="p-8">
                            <AnimatePresence mode="wait">
                                {currentStep === 0 && (
                                    <motion.div
                                        key="step-0"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="companyName" className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                                                    Company Name *
                                                </Label>
                                                <Input
                                                    id="companyName"
                                                    placeholder="Acme Inc."
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    className="h-12 rounded-xl bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="website" className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                                                    Company Website
                                                </Label>
                                                <Input
                                                    id="website"
                                                    placeholder="https://company.com"
                                                    value={companyWebsite}
                                                    onChange={(e) => setCompanyWebsite(e.target.value)}
                                                    className="h-12 rounded-xl bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Industry *</Label>
                                                <Select value={industry} onValueChange={setIndustry}>
                                                    <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                                                        <SelectValue placeholder="Select industry" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                                        {INDUSTRIES.map((ind) => (
                                                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Company Size</Label>
                                                <Select value={companySize} onValueChange={setCompanySize}>
                                                    <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                                                        <SelectValue placeholder="Select size" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                                        {COMPANY_SIZES.map((size) => (
                                                            <SelectItem key={size} value={size}>{size}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Your Role Selection */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Your Role *</Label>
                                            <Select value={userRole} onValueChange={setUserRole}>
                                                <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                                                    <SelectValue placeholder="What's your role?" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                                    {ROLE_OPTIONS.map((role) => (
                                                        <SelectItem key={role.value} value={role.value}>
                                                            <div className="flex items-center gap-2">
                                                                <span>{role.label}</span>
                                                                {role.isHead && (
                                                                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                                                        Admin
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-neutral-500 font-mono mt-1">
                                                Leadership roles (CEO, CTO, Co-founder, etc.) get full admin access
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                                                Company Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Brief description for candidates..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="min-h-[100px] rounded-xl bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === 1 && (
                                    <motion.div
                                        key="step-1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="text-center mb-8">
                                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                                What roles are you hiring for?
                                            </h2>
                                            <p className="text-neutral-500 text-sm mt-2">
                                                Select all that apply — we&apos;ll help you find matching candidates
                                            </p>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {HIRING_GOALS.map((role) => {
                                                const isSelected = hiringRoles.includes(role.id)
                                                return (
                                                    <motion.button
                                                        key={role.id}
                                                        onClick={() => toggleHiringRole(role.id)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={cn(
                                                            "p-4 rounded-xl border-2 transition-all text-left",
                                                            isSelected
                                                                ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-black'
                                                                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-neutral-400 dark:hover:border-neutral-700'
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "p-2 rounded-lg",
                                                                isSelected ? 'bg-white/20 dark:bg-black/20' : 'bg-neutral-100 dark:bg-neutral-900'
                                                            )}>
                                                                <Briefcase className="w-4 h-4" />
                                                            </div>
                                                            <span className="font-medium">{role.label}</span>
                                                            {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                                                        </div>
                                                    </motion.button>
                                                )
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === 2 && (
                                    <motion.div
                                        key="step-2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="text-center mb-8">
                                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                                Team & Location
                                            </h2>
                                            <p className="text-neutral-500 text-sm mt-2">
                                                Invite team members to collaborate on hiring
                                            </p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="teamMembers" className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                                                    Invite Team Members (Optional)
                                                </Label>
                                                <Textarea
                                                    id="teamMembers"
                                                    placeholder="Enter email addresses, one per line"
                                                    value={teamMembers}
                                                    onChange={(e) => setTeamMembers(e.target.value)}
                                                    className="min-h-[120px] rounded-xl bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                                                />
                                                <p className="text-[10px] text-neutral-500 font-mono">
                                                    Invitees will receive Recruiter access to your workspace
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="location" className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                                                    Primary Hiring Location
                                                </Label>
                                                <Input
                                                    id="location"
                                                    placeholder="e.g., Bangalore, India"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    className="h-12 rounded-xl bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                    disabled={currentStep === 0}
                                    className="h-12 px-6 rounded-xl border-neutral-200 dark:border-neutral-800"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Previous
                                </Button>
                                {currentStep < steps.length - 1 ? (
                                    <Button
                                        onClick={() => setCurrentStep(prev => prev + 1)}
                                        disabled={!canProceed()}
                                        className="h-12 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                                    >
                                        Next
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleComplete}
                                        disabled={loading || !canProceed()}
                                        className="h-12 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Initializing...
                                            </>
                                        ) : (
                                            <>
                                                Launch Workspace
                                                <CheckCircle2 className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
