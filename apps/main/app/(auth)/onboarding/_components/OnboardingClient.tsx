'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from '@repo/auth/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Button } from '@repo/ui/components/ui/button'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle
} from '@repo/ui/components/ui/dialog'
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem
} from '@repo/ui/components/ui/command'
import {
    Popover, PopoverContent, PopoverTrigger
} from '@repo/ui/components/ui/popover'
import {
    Loader2, CheckCircle2, XCircle, Upload, ArrowRight, ArrowLeft,
    Sparkles, Code, Briefcase, Target, TrendingUp, LogOut, ChevronsUpDown,
    Check, AlertCircle, Cloud, ShieldCheck, Database,
    Gamepad2, Palette, Server, Smartphone, Globe, Cpu, Blocks, TestTube2,
    Layers, BrainCircuit, FileText, X
} from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import toast from '@repo/ui/components/ui/sonner'
import { cn } from '@repo/ui/lib/utils'
import { getColleges } from '@/actions/(main)/user/college.action'
import { checkUsernameAvailability, completeOnboarding } from '@/actions/(main)/user/onboarding.action'
import { uploadResume } from '@/actions/(main)/user/resume.action'
import { validateResumeFile } from '@/lib/resume-extractor.client'

const SEMESTERS = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
    "5th Semester", "6th Semester", "7th Semester", "8th Semester",
    "Graduate", "Post-Graduate", "Other"
]

const LEARNING_GOALS = [
    { id: 'web-dev', label: 'Web Development', icon: Globe },
    { id: 'mobile-dev', label: 'Mobile Development', icon: Smartphone },
    { id: 'backend', label: 'Backend Engineering', icon: Server },
    { id: 'fullstack', label: 'Full Stack', icon: Layers },
    { id: 'dsa', label: 'Data Structures & Algorithms', icon: Target },
    { id: 'system-design', label: 'System Design', icon: TrendingUp },
    { id: 'os-db', label: 'OS & Databases', icon: Database },
    { id: 'ai-ml', label: 'AI & Machine Learning', icon: Sparkles },
    { id: 'cloud', label: 'Cloud Computing', icon: Cloud },
    { id: 'devops', label: 'DevOps & CI/CD', icon: Briefcase },
    { id: 'cybersecurity', label: 'Cybersecurity', icon: ShieldCheck },
    { id: 'blockchain', label: 'Blockchain & Web3', icon: Blocks },
    { id: 'game-dev', label: 'Game Development', icon: Gamepad2 },
    { id: 'iot', label: 'Internet of Things', icon: Cpu },
    { id: 'qa-testing', label: 'QA & Automation', icon: TestTube2 },
    { id: 'ui-ux', label: 'UI/UX Design', icon: Palette },
    { id: 'product-mgmt', label: 'Product Management', icon: BrainCircuit },
    { id: 'technical-writing', label: 'Technical Writing', icon: Code },
]

export default function OnboardingPage() {
    const { refetch, data: session } = useSession()
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const [showExitDialog, setShowExitDialog] = useState(false)

    const [username, setUsername] = useState('')
    const [university, setUniversity] = useState('')
    const [semester, setSemester] = useState('')
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [colleges, setColleges] = useState<string[]>([])
    const [openCollegePicker, setOpenCollegePicker] = useState(false)
    const [learningGoals, setLearningGoals] = useState<string[]>([])

    const [usernameCheck, setUsernameCheck] = useState<{
        checking: boolean; available: boolean | null; message: string
    }>({ checking: false, available: null, message: '' })

    const debouncedUsername = useDebounce(username, 500)

    useEffect(() => {
        getColleges().then(result => {
            if (result.success) setColleges(result.colleges)
        })
    }, [])

    useEffect(() => {
        if (debouncedUsername.length >= 3) {
            setUsernameCheck({ checking: true, available: null, message: '' })
            checkUsernameAvailability(debouncedUsername)
                .then(result => setUsernameCheck({ checking: false, available: result.available, message: result.message }))
                .catch(() => setUsernameCheck({ checking: false, available: false, message: 'Error checking username' }))
        } else if (debouncedUsername.length > 0) {
            setUsernameCheck({ checking: false, available: false, message: 'Username must be at least 3 characters' })
        } else {
            setUsernameCheck({ checking: false, available: null, message: '' })
        }
    }, [debouncedUsername])

    const toggleLearningGoal = useCallback((goalId: string) => {
        setLearningGoals(prev =>
            prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
        )
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const validation = validateResumeFile(file)
        if (!validation.valid) { toast.error(validation.error); return }
        setResumeFile(file)
    }

    const canProceed = () => currentStep === 0 ? username.length >= 3 && usernameCheck.available === true : true

    const handleComplete = async () => {
        if (!canProceed()) return
        setLoading(true)
        try {
            let resumeUrl: string | undefined
            if (resumeFile) {
                try {
                    const result = await uploadResume(resumeFile)
                    resumeUrl = result.url
                    if (result.message) toast.info(result.message)
                } catch {
                    toast.warning('Resume upload failed. You can upload later from your profile.')
                }
            }
            await completeOnboarding({
                username,
                university: university || undefined,
                semester: semester || undefined,
                resume: resumeUrl,
                learningPreferences: learningGoals,
            })
            toast.success('Welcome to BuildrHQ!')
            await refetch()
            window.location.href = '/home'
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to complete onboarding')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            await signOut()
            window.location.href = '/signin'
        } catch {
            toast.error('Failed to logout')
            setLoggingOut(false)
        }
    }

    const steps = [
        { id: 0, label: 'Your Profile' },
        { id: 1, label: 'Learning Goals' },
    ]

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            Complete onboarding first
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            You need to log out to leave this page. Your onboarding progress will be saved.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setShowExitDialog(false)} className="text-neutral-400 hover:text-white">
                            Stay
                        </Button>
                        <Button onClick={handleLogout} disabled={loggingOut} variant="destructive">
                            {loggingOut ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Logging out...</> : 'Log out'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <header className="border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => setShowExitDialog(true)} className="flex items-center gap-2.5 group">
                        <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center">
                            <Code className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-white group-hover:text-neutral-300 transition-colors">
                            BuildrHQ
                        </span>
                    </button>
                    <div className="flex items-center gap-4">
                        {session?.user?.email && (
                            <span className="text-sm text-neutral-500 hidden sm:block">{session.user.email}</span>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="text-neutral-400 hover:text-white h-8 px-3"
                        >
                            {loggingOut
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <><LogOut className="w-3.5 h-3.5 mr-1.5" />Log out</>
                            }
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-start justify-center px-4 py-10 sm:py-16">
                <div className="w-full max-w-2xl">
                    {/* Step progress */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center gap-2">
                                {steps.map((step, i) => (
                                    <div key={step.id} className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                                            i < currentStep ? "bg-orange-500 text-white" :
                                            i === currentStep ? "bg-white text-neutral-900" :
                                            "bg-neutral-800 text-neutral-500"
                                        )}>
                                            {i < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
                                        </div>
                                        <span className={cn(
                                            "text-sm hidden sm:block",
                                            i === currentStep ? "text-white font-medium" : "text-neutral-500"
                                        )}>
                                            {step.label}
                                        </span>
                                        {i < steps.length - 1 && (
                                            <div className={cn(
                                                "w-12 h-px mx-1",
                                                i < currentStep ? "bg-orange-500" : "bg-neutral-800"
                                            )} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <span className="ml-auto text-xs text-neutral-500">
                                {currentStep + 1} of {steps.length}
                            </span>
                        </div>
                        <div className="h-px bg-neutral-800 relative overflow-hidden">
                            <motion.div
                                className="absolute h-full bg-orange-500"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Step content */}
                    <AnimatePresence mode="wait">
                        {currentStep === 0 && (
                            <motion.div
                                key="step-0"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h1 className="text-2xl font-semibold text-white mb-1">Set up your profile</h1>
                                    <p className="text-neutral-400 text-sm">This takes less than a minute.</p>
                                </div>

                                {/* Username */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="username" className="text-sm text-neutral-300">
                                        Username <span className="text-orange-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="username"
                                            placeholder="e.g., johndoe_dev"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            className="bg-neutral-900 border-neutral-700 text-white pr-10 focus:border-neutral-500 focus:ring-0"
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center">
                                            {usernameCheck.checking && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                                            {!usernameCheck.checking && usernameCheck.available === true && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                            {!usernameCheck.checking && usernameCheck.available === false && <XCircle className="h-4 w-4 text-red-500" />}
                                        </div>
                                    </div>
                                    {usernameCheck.message && (
                                        <p className={cn("text-xs", usernameCheck.available ? "text-emerald-500" : "text-red-400")}>
                                            {usernameCheck.message}
                                        </p>
                                    )}
                                </div>

                                {/* College + Semester */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-neutral-300">
                                            College / University <span className="text-neutral-600 font-normal">(optional)</span>
                                        </Label>
                                        <Popover open={openCollegePicker} onOpenChange={setOpenCollegePicker}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full justify-between bg-neutral-900 border-neutral-700 text-left font-normal text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                                >
                                                    <span className="truncate">{university || "Select college"}</span>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[min(380px,calc(100vw-2rem))] p-0 bg-neutral-900 border-neutral-700">
                                                <Command className="bg-neutral-900">
                                                    <CommandInput
                                                        placeholder="Search or type college..."
                                                        className="text-white border-b border-neutral-700"
                                                        value={university}
                                                        onValueChange={setUniversity}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const hasMatch = colleges.some(c =>
                                                                    c.toLowerCase().includes(university.toLowerCase())
                                                                )
                                                                if (!hasMatch && university.trim()) {
                                                                    setOpenCollegePicker(false)
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <CommandEmpty className="py-4 px-3 text-sm text-neutral-500">
                                                        Press Enter to add &quot;{university}&quot;
                                                    </CommandEmpty>
                                                    <CommandGroup className="max-h-56 overflow-auto">
                                                        {colleges.map(college => (
                                                            <CommandItem
                                                                key={college}
                                                                value={college}
                                                                onSelect={val => { setUniversity(val === university ? "" : val); setOpenCollegePicker(false) }}
                                                                className="text-neutral-300 aria-selected:text-white"
                                                            >
                                                                <Check className={cn("mr-2 h-3.5 w-3.5", university === college ? "opacity-100 text-orange-500" : "opacity-0")} />
                                                                {college}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-neutral-300">
                                            Current Semester <span className="text-neutral-600 font-normal">(optional)</span>
                                        </Label>
                                        <Select value={semester} onValueChange={setSemester}>
                                            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                                                <SelectValue placeholder="Select semester" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-neutral-900 border-neutral-700">
                                                {SEMESTERS.map(sem => (
                                                    <SelectItem key={sem} value={sem} className="text-neutral-300 focus:bg-neutral-800 focus:text-white">
                                                        {sem}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Resume upload */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-neutral-300">
                                        Resume <span className="text-neutral-600 font-normal">(optional · PDF, DOC, DOCX)</span>
                                    </Label>
                                    <div className="relative">
                                        <input
                                            id="resume-upload"
                                            type="file"
                                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        {resumeFile ? (
                                            <div className="flex items-center gap-3 p-3.5 rounded-lg border border-neutral-700 bg-neutral-900">
                                                <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0">
                                                    <FileText className="w-4 h-4 text-orange-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white truncate">{resumeFile.name}</p>
                                                    <p className="text-xs text-neutral-500 mt-0.5">
                                                        {(resumeFile.size / 1024 / 1024).toFixed(1)} MB · Ready to upload
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setResumeFile(null)}
                                                    className="text-neutral-500 hover:text-white transition-colors shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label
                                                htmlFor="resume-upload"
                                                className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border border-dashed border-neutral-700 bg-neutral-900 cursor-pointer hover:border-neutral-500 hover:bg-neutral-800/50 transition-all"
                                            >
                                                <Upload className="w-5 h-5 text-neutral-500" />
                                                <span className="text-sm text-neutral-400">
                                                    Click to upload your resume
                                                </span>
                                                <span className="text-xs text-neutral-600">Max 5 MB</span>
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-xs text-neutral-600">
                                        Your resume helps us personalise AI features like cover letter generation.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h1 className="text-2xl font-semibold text-white mb-1">What do you want to learn?</h1>
                                    <p className="text-neutral-400 text-sm">
                                        Select any that apply — you can update these any time.
                                        {learningGoals.length > 0 && (
                                            <span className="ml-2 text-orange-400">{learningGoals.length} selected</span>
                                        )}
                                    </p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-2.5">
                                    {LEARNING_GOALS.map(goal => {
                                        const Icon = goal.icon
                                        const isSelected = learningGoals.includes(goal.id)
                                        return (
                                            <button
                                                key={goal.id}
                                                onClick={() => toggleLearningGoal(goal.id)}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all",
                                                    isSelected
                                                        ? "border-orange-500/60 bg-orange-500/10 text-white"
                                                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                                                )}
                                            >
                                                <Icon className={cn("w-4 h-4 shrink-0", isSelected ? "text-orange-400" : "text-neutral-600")} />
                                                <span className="text-sm">{goal.label}</span>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-orange-400 ml-auto shrink-0" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-neutral-800">
                        <Button
                            variant="ghost"
                            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                            disabled={currentStep === 0 || loading}
                            className="text-neutral-400 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        {currentStep < steps.length - 1 ? (
                            <Button
                                onClick={() => setCurrentStep(s => s + 1)}
                                disabled={!canProceed() || loading}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
                            >
                                Continue
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={loading}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-medium min-w-28"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting up...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4 mr-2" />Get started</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
