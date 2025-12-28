'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from '@repo/auth/client';
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Button } from '@repo/ui/components/ui/button'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@repo/ui/components/ui/dialog'
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem
} from '@repo/ui/components/ui/command'
import {
    Popover, PopoverContent, PopoverTrigger
} from '@repo/ui/components/ui/popover'
import {
    Loader2, CheckCircle2, XCircle, Upload, ArrowRight, ArrowLeft, Sparkles,
    Code, Briefcase, Target, TrendingUp, LogOut, ChevronsUpDown, Check,
    AlertCircle, Plus, X as XIcon
} from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import toast from '@repo/ui/components/ui/sonner'
import { Badge } from '@repo/ui/components/ui/badge'
import { cn } from '@repo/ui/lib/utils'
import { getColleges, getCompanies } from '@/actions/(main)/user/college.action'
import { checkUsernameAvailability, completeOnboarding } from '@/actions/(main)/user/onboarding.action'
import { uploadResume } from '@/actions/(main)/user/resume.action'

const SEMESTERS = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
    "5th Semester", "6th Semester", "7th Semester", "8th Semester",
    "Graduate", "Post-Graduate", "Other"
]

const LEARNING_GOALS = [
    { id: 'web-dev', label: 'Web Development', icon: Code },
    { id: 'mobile-dev', label: 'Mobile Development', icon: Code },
    { id: 'ai-ml', label: 'AI & Machine Learning', icon: Sparkles },
    { id: 'dsa', label: 'Data Structures & Algorithms', icon: Target },
    { id: 'system-design', label: 'System Design', icon: TrendingUp },
    { id: 'devops', label: 'DevOps', icon: Briefcase },
]

const JOB_PREFERENCES = [
    { id: 'frontend', label: 'Frontend Developer' },
    { id: 'backend', label: 'Backend Developer' },
    { id: 'fullstack', label: 'Full Stack Developer' },
    { id: 'mobile', label: 'Mobile Developer' },
    { id: 'data-science', label: 'Data Scientist' },
    { id: 'ml-engineer', label: 'ML Engineer' },
    { id: 'devops', label: 'DevOps Engineer' },
    { id: 'other', label: 'Other' },
]

const WORK_EXPERIENCE = [
    "Fresher (0 years)",
    "0-1 years",
    "1-2 years",
    "2-3 years",
    "3-5 years",
    "5+ years"
]

const NOTICE_PERIODS = [
    "Immediate",
    "15 days",
    "1 month",
    "2 months",
    "3 months",
    "Serving Notice"
]

export default function OnboardingPage() {
    // const _router = useRouter() // Removed unused
    const { update, data: session } = useSession()
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const [showExitDialog, setShowExitDialog] = useState(false)

    // Basic Info
    const [username, setUsername] = useState('')
    const [university, setUniversity] = useState('')
    const [semester, setSemester] = useState('')
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [resumeText, setResumeText] = useState<string | null>(null)
    const [extractingResume, setExtractingResume] = useState(false)
    const [colleges, setColleges] = useState<string[]>([])
    const [openCollegePicker, setOpenCollegePicker] = useState(false)

    // Preferences  
    const [learningGoals, setLearningGoals] = useState<string[]>([])
    const [jobPreference, setJobPreference] = useState('')

    // Career Details
    const [targetCompanies, setTargetCompanies] = useState<string[]>([])
    const [companyInput, setCompanyInput] = useState('')
    const [companies, setCompanies] = useState<string[]>([])
    const [openCompanyPicker, setOpenCompanyPicker] = useState(false)
    const [expectedSalary, setExpectedSalary] = useState('')
    const [noticePeriod, setNoticePeriod] = useState('')
    const [workExperience, setWorkExperience] = useState('')
    const [location, setLocation] = useState('')

    // Username validation
    const [usernameCheck, setUsernameCheck] = useState<{
        checking: boolean
        available: boolean | null
        message: string
    }>({
        checking: false,
        available: null,
        message: ''
    })

    const debouncedUsername = useDebounce(username, 500)

    // Fetch colleges on mount
    useEffect(() => {
        getColleges().then(result => {
            if (result.success) {
                setColleges(result.colleges)
            }
        })
        getCompanies().then(result => {
            if (result.success) {
                setCompanies(result.companies)
            }
        })
    }, [])

    useEffect(() => {
        if (debouncedUsername.length >= 3) {
            setUsernameCheck({ checking: true, available: null, message: '' })
            checkUsernameAvailability(debouncedUsername)
                .then((result) => {
                    setUsernameCheck({
                        checking: false,
                        available: result.available,
                        message: result.message
                    })
                })
                .catch(() => {
                    setUsernameCheck({
                        checking: false,
                        available: false,
                        message: 'Error checking username'
                    })
                })
        } else if (debouncedUsername.length > 0) {
            setUsernameCheck({
                checking: false,
                available: false,
                message: 'Username must be at least 3 characters'
            })
        } else {
            setUsernameCheck({
                checking: false,
                available: null,
                message: ''
            })
        }
    }, [debouncedUsername])

    const toggleLearningGoal = (goalId: string) => {
        setLearningGoals(prev =>
            prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
        )
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Check file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload a PDF, DOC, or DOCX file')
                return
            }

            setResumeFile(file)

            // Extract text from resume (dynamic import to avoid SSR issues)
            setExtractingResume(true)
            try {
                const { extractTextFromResume } = await import('@/lib/resume-extractor.client')
                const result = await extractTextFromResume(file)

                if (result.success && result.text) {
                    setResumeText(result.text)
                    toast.success('Resume text extracted successfully!')
                } else {
                    toast.warning(`${result.error || 'Could not extract text'}. File will still be uploaded.`)
                    setResumeText(null)
                }
            } catch (error) {
                console.error('Text extraction error:', error)
                toast.warning('Could not extract text from resume. File will still be uploaded.')
                setResumeText(null)
            } finally {
                setExtractingResume(false)
            }
        }
    }

    const addCompany = (company: string) => {
        if (company && !targetCompanies.includes(company)) {
            setTargetCompanies([...targetCompanies, company])
            setCompanyInput('')
        }
    }

    const removeCompany = (company: string) => {
        setTargetCompanies(targetCompanies.filter(c => c !== company))
    }

    const canProceed = () => {
        if (currentStep === 0) {
            return username.length >= 3 && usernameCheck.available
        }
        return true
    }

    const handleComplete = async () => {
        if (!canProceed()) return

        setLoading(true)
        try {
            let resumeUrl: string | undefined = undefined

            // Upload resume if provided
            if (resumeFile) {
                const uploadResult = await uploadResume(resumeFile, resumeText || undefined)
                resumeUrl = uploadResult.url
            }

            // Complete onboarding with all collected data
            await completeOnboarding({
                username,
                university: university || undefined,
                semester: semester || undefined,
                resume: resumeUrl,
                resumeText: resumeText || undefined,
                learningPreferences: learningGoals,
                careerGoals: jobPreference ? [jobPreference] : [],
                targetCompanies,
                expectedSalary: expectedSalary || undefined,
                noticePeriod: noticePeriod || undefined,
                workExperience: workExperience || undefined,
                location: location || undefined,
            })

            toast.success('Welcome to TheCoderz! 🎉')

            // Force session update to refresh JWT token with new onboardingCompleted status
            await update()

            // Redirect to explore page - middleware will now allow access
            window.location.href = '/explore'
        } catch (error) {
            console.error('Onboarding error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to complete onboarding')
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
        { title: 'Basic Info', description: 'Tell us about yourself' },
        { title: 'Learning Goals', description: 'What do you want to learn?' },
        { title: 'Career Goals', description: 'Where do you see yourself?' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex flex-col"
        >
            <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                            Complete Onboarding First
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            You need to logout before you can exit this page. Your onboarding progress will be saved.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowExitDialog(false)} className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700">
                            Continue Onboarding
                        </Button>
                        <Button onClick={handleLogout} disabled={loggingOut} className="bg-red-600 hover:bg-red-700">
                            {
                                loggingOut ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Logging out...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </>
                                )
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <nav className="w-full border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowExitDialog(true)}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                            <Code className="w-6 h-6 text-blue-500" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                                TheCoderz
                            </span>
                        </button>
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                            Onboarding
                        </Badge>
                    </div>

                    <div className="flex items-center gap-4">
                        {
                            session?.user?.email && (
                                <span className="text-sm text-neutral-400 hidden sm:block">
                                    {session.user.email}
                                </span>
                            )
                        }
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                        >
                            {
                                loggingOut ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Logging out...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </>
                                )
                            }
                        </Button>
                    </div>
                </div>
            </nav>
            <div className="flex-1 flex items-center justify-center p-4 w-full overflow-hidden">
                <div className="w-full max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    Welcome to TheCoderz! 👋
                                </h1>
                                <p className="text-neutral-400">Almost there... just a few quick questions</p>
                            </div>
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                Step {currentStep + 1} of {steps.length}
                            </Badge>
                        </div>
                        <div className="relative h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute h-full bg-gradient-to-r from-blue-600 to-purple-600"
                                initial={{ width: '0%' }}
                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <div className="flex justify-between mt-4">
                            {
                                steps.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${idx <= currentStep
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                            : 'bg-neutral-800 text-neutral-500'
                                            }`}>
                                            {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                        </div>
                                        <div className="hidden md:block">
                                            <p className={`text-sm font-medium ${idx <= currentStep ? 'text-white' : 'text-neutral-500'}`}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-neutral-500">{step.description}</p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </motion.div>
                    <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-xl">
                        <CardContent className="p-8">
                            <AnimatePresence mode="wait">
                                {
                                    currentStep === 0 && (
                                        <motion.div
                                            key="step-0"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="username" className="text-white text-base">
                                                    Username * <span className="text-neutral-500 text-sm font-normal">Your unique identity</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="username"
                                                        placeholder="e.g., johndoe_dev"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        className="bg-neutral-800 border-neutral-700 text-white pr-10"
                                                    />
                                                    <div className="absolute inset-y-0 right-3 flex items-center">
                                                        {usernameCheck.checking && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                                                        {!usernameCheck.checking && usernameCheck.available === true && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                                        {!usernameCheck.checking && usernameCheck.available === false && <XCircle className="h-4 w-4 text-red-500" />}
                                                    </div>
                                                </div>
                                                {
                                                    usernameCheck.message && (
                                                        <p className={`text-sm ${usernameCheck.available ? 'text-green-500' : 'text-red-500'}`}>
                                                            {usernameCheck.message}
                                                        </p>
                                                    )
                                                }
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="university" className="text-white text-base">
                                                        College/University <span className="text-neutral-500 text-sm font-normal">(Optional)</span>
                                                    </Label>
                                                    <Popover open={openCollegePicker} onOpenChange={
                                                        setOpenCollegePicker}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={openCollegePicker}
                                                                className="w-full justify-between bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 hover:text-white"
                                                            >
                                                                {university || "Select or type your college"}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[min(400px,calc(100vw-2rem))] p-0 bg-neutral-900 border-neutral-700">
                                                            <Command className="bg-neutral-900">
                                                                <CommandInput
                                                                    placeholder="Search or type college name..."
                                                                    className="text-white"
                                                                    value={university}
                                                                    onValueChange={setUniversity}
                                                                />
                                                                <CommandEmpty className="text-neutral-400 p-4">
                                                                    <p className="text-sm">No college found. Press Enter to add &quot;{university}&quot;</p>
                                                                </CommandEmpty>
                                                                <CommandGroup className="max-h-64 overflow-auto">
                                                                    {
                                                                        colleges.map((college) => (
                                                                            <CommandItem
                                                                                key={college}
                                                                                value={college}
                                                                                onSelect={(currentValue) => {
                                                                                    setUniversity(currentValue === university ? "" : currentValue)
                                                                                    setOpenCollegePicker(false)
                                                                                }}
                                                                                className="text-white"
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
                                                                                        university === college ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                {college}
                                                                            </CommandItem>
                                                                        ))
                                                                    }
                                                                </CommandGroup>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="semester" className="text-white text-base">
                                                        Current Semester <span className="text-neutral-500 text-sm font-normal">(Optional)</span>
                                                    </Label>
                                                    <Select value={semester} onValueChange={setSemester}>
                                                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                                                            <SelectValue placeholder="Select semester" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-neutral-900 border-neutral-700">
                                                            {
                                                                SEMESTERS.map((sem) => (
                                                                    <SelectItem key={sem} value={sem} className="text-white focus:bg-neutral-800 focus:text-white">{sem}</SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="resume" className="text-white text-base">
                                                    Resume (PDF, DOC, DOCX) <span className="text-neutral-500 text-sm font-normal">(Optional)</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="resume"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        disabled={extractingResume}
                                                    />
                                                    <label
                                                        htmlFor="resume"
                                                        className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-neutral-600 transition-colors bg-neutral-800/50 ${extractingResume ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {
                                                            extractingResume ? (
                                                                <>
                                                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                                                    <span className="text-blue-400">Extracting text from resume...</span>
                                                                </>
                                                            ) : resumeFile ? (
                                                                <>
                                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                                    <span className="text-white">{resumeFile.name}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload className="w-5 h-5 text-neutral-400" />
                                                                    <span className="text-neutral-400">Click to upload your resume</span>
                                                                </>
                                                            )
                                                        }
                                                    </label>
                                                    {
                                                        resumeText && !extractingResume && (
                                                            <p className="text-sm text-green-500 mt-2">
                                                                ✓ Resume text extracted ({resumeText.length} characters)
                                                            </p>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                }

                                {
                                    currentStep === 1 && (
                                        <motion.div
                                            key="step-1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div>
                                                <h2 className="text-2xl font-bold text-white mb-2">What do you want to learn?</h2>
                                                <p className="text-neutral-400">Select all that apply - you can always change these later</p>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                {
                                                    LEARNING_GOALS.map((goal) => {
                                                        const Icon = goal.icon
                                                        const isSelected = learningGoals.includes(goal.id)
                                                        return (
                                                            <motion.button
                                                                key={goal.id}
                                                                onClick={() => toggleLearningGoal(goal.id)}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                                    ? 'border-blue-500 bg-blue-500/10'
                                                                    : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500' : 'bg-neutral-700'}`}>
                                                                        <Icon className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <span className="text-white font-medium">{goal.label}</span>
                                                                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-500 ml-auto" />}
                                                                </div>
                                                            </motion.button>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </motion.div>
                                    )
                                }
                                {
                                    currentStep === 2 && (
                                        <motion.div
                                            key="step-2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div>
                                                <h2 className="text-2xl font-bold text-white mb-2">What&apos;s your dream job?</h2>
                                                <p className="text-neutral-400">Help us personalize your learning journey</p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-white text-base">Preferred Job Role</Label>
                                                    <Select value={jobPreference} onValueChange={setJobPreference}>
                                                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                                                            <SelectValue placeholder="Select your target role" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-neutral-900 border-neutral-700">
                                                            {
                                                                JOB_PREFERENCES.map((job) => (
                                                                    <SelectItem key={job.id} value={job.id} className="text-white focus:bg-neutral-800 focus:text-white">{job.label}</SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-white text-base">
                                                        Work Experience <span className="text-neutral-500 text-sm font-normal">(Optional)</span>
                                                    </Label>
                                                    <Select value={workExperience} onValueChange={setWorkExperience}>
                                                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                                                            <SelectValue placeholder="Select experience" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-neutral-900 border-neutral-700">
                                                            {
                                                                WORK_EXPERIENCE.map((exp) => (
                                                                    <SelectItem key={exp} value={exp} className="text-white focus:bg-neutral-800 focus:text-white">{exp}</SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="location" className="text-white text-base">
                                                        Preferred Location <span className="text-neutral-500 text-sm font-normal">(Optional)</span>
                                                    </Label>
                                                    <Input
                                                        id="location"
                                                        placeholder="e.g., Bangalore, Remote"
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        className="bg-neutral-800 border-neutral-700 text-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="salary" className="text-white text-base">
                                                        Expected Salary (LPA) <span className="text-neutral-500 text-sm font-normal">(Optional)</span>
                                                    </Label>
                                                    <Input
                                                        id="salary"
                                                        placeholder="e.g., 8-12 LPA"
                                                        value={expectedSalary}
                                                        onChange={(e) => setExpectedSalary(e.target.value)}
                                                        className="bg-neutral-800 border-neutral-700 text-white"
                                                    />
                                                </div>

                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="text-white text-base">
                                                        Notice Period <span className="text-neutral-500 text-sm font-normal">(Optional)</span>
                                                    </Label>
                                                    <Select value={noticePeriod} onValueChange={setNoticePeriod}>
                                                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                                                            <SelectValue placeholder="Select notice period" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-neutral-900 border-neutral-700">
                                                            {NOTICE_PERIODS.map((period) => (
                                                                <SelectItem key={period} value={period} className="text-white focus:bg-neutral-800 focus:text-white">{period}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-white text-base">
                                                    Target Companies <span className="text-neutral-500 text-sm font-normal">(Optional)</span>
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Popover open={openCompanyPicker} onOpenChange={setOpenCompanyPicker}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className="flex-1 justify-between bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 hover:text-white"
                                                            >
                                                                {companyInput || "Select or type company name"}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[min(400px,calc(100vw-2rem))] p-0 bg-neutral-900 border-neutral-700">
                                                            <Command className="bg-neutral-900">
                                                                <CommandInput
                                                                    placeholder="Search or type company..."
                                                                    className="text-white"
                                                                    value={companyInput}
                                                                    onValueChange={setCompanyInput}
                                                                />
                                                                <CommandEmpty className="text-neutral-400 p-4">
                                                                    <button
                                                                        onClick={() => {
                                                                            addCompany(companyInput)
                                                                            setOpenCompanyPicker(false)
                                                                        }}
                                                                        className="text-sm text-blue-400 hover:underline"
                                                                    >
                                                                        Add &quot;{companyInput}&quot;
                                                                    </button>
                                                                </CommandEmpty>
                                                                <CommandGroup className="max-h-64 overflow-auto">
                                                                    {
                                                                        companies.map((company) => (
                                                                            <CommandItem
                                                                                key={company}
                                                                                value={company}
                                                                                onSelect={(currentValue) => {
                                                                                    addCompany(currentValue)
                                                                                    setOpenCompanyPicker(false)
                                                                                }}
                                                                                className="text-white"
                                                                            >
                                                                                {company}
                                                                            </CommandItem>
                                                                        ))
                                                                    }
                                                                </CommandGroup>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            addCompany(companyInput)
                                                        }}
                                                        disabled={!companyInput}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {
                                                    targetCompanies.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {
                                                                targetCompanies.map((company) => (
                                                                    <Badge
                                                                        key={company}
                                                                        variant="secondary"
                                                                        className="bg-blue-500/20 text-blue-400 border-blue-500/30 pr-1"
                                                                    >
                                                                        {company}
                                                                        <button
                                                                            onClick={() => removeCompany(company)}
                                                                            className="ml-2 hover:bg-blue-500/30 rounded-full p-0.5"
                                                                        >
                                                                            <XIcon className="w-3 h-3" />
                                                                        </button>
                                                                    </Badge>
                                                                ))
                                                            }
                                                        </div>
                                                    )
                                                }
                                                <p className="text-xs text-neutral-500">Select from existing or add your own</p>
                                            </div>
                                            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                                <p className="text-blue-400 text-sm text-center">
                                                    🎉 You&apos;re all set! Click finish to start your learning journey
                                                </p>
                                            </div>
                                        </motion.div>
                                    )
                                }
                            </AnimatePresence>
                            <div className="flex justify-between mt-8 pt-6 border-t border-neutral-800">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                    disabled={currentStep === 0 || loading}
                                    className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                {
                                    currentStep < steps.length - 1 ? (
                                        <Button
                                            onClick={() => setCurrentStep(currentStep + 1)}
                                            disabled={!canProceed() || loading}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            Next
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleComplete}
                                            disabled={!canProceed() || loading}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        >
                                            {
                                                loading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Finishing...
                                                    </>
                                                ) : (
                                                    <>
                                                        Finish
                                                        <Sparkles className="w-4 h-4 ml-2" />
                                                    </>
                                                )
                                            }
                                        </Button>
                                    )
                                }
                            </div>
                        </CardContent>
                    </Card>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-neutral-500 mt-6 text-sm"
                    >
                        Don&apos;t worry, this will only take a minute! 🚀
                    </motion.p>
                </div>
            </div>
        </div>
    )
}