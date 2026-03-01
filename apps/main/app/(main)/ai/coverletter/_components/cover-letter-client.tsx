"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
    extractJobDescription, generateCoverLetterQuestions, generateAndSaveCoverLetter, 
    getCoverLetter, deleteCoverLetter 
} from "@/actions/(main)/ai/cover-letter.action"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@repo/ui/components/ui/select"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { 
    RadioGroup, RadioGroupItem 
} from "@repo/ui/components/ui/radio-group"
import { 
    Loader2, ArrowRight, Download, Copy, RefreshCcw, Mic, Square, Trash2, 
    ArrowLeft 
} from "lucide-react"
import toast from "@repo/ui/components/ui/sonner"
import { transcribeAndPolishWorkExperience } from "@/actions/(main)/ai/resume-ai.action"
import { usePDF } from "react-to-pdf"
import { MarkdownRenderer } from "@/components/common/markdown-renderer"
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@repo/ui/components/ui/card"
import { CoverLetterHistoryItem, CoverLetterQuestion } from "@/types/aitools/cover-letter"

export function CoverLetterClient({ initialCoverLetters, selectedId }: { initialCoverLetters: CoverLetterHistoryItem[], selectedId: string | undefined }) {
    const router = useRouter()

    // Steps: 1: Enter link, 2: Answer Questions, 3: View Letter
    const [step, setStep] = useState(selectedId ? 3 : 1)

    // Step 1 state
    const [jobUrl, setJobUrl] = useState("")
    const [jobDescription, setJobDescription] = useState("")
    const [jobTitle, setJobTitle] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [tone, setTone] = useState("Professional")
    const [isExtracting, setIsExtracting] = useState(false)
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)

    // Step 2 state
    const [questions, setQuestions] = useState<CoverLetterQuestion[]>([])
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
    const [isGeneratingLetter, setIsGeneratingLetter] = useState(false)

    // Step 3 state
    const [generatedContent, setGeneratedContent] = useState("")
    const { toPDF, targetRef } = usePDF({ filename: 'cover_letter.pdf' })

    // History state
    const [history, setHistory] = useState<CoverLetterHistoryItem[]>(initialCoverLetters)

    useEffect(() => {
        if (selectedId) {
            fetchLetter(selectedId)
        }
    }, [selectedId])

    const fetchLetter = async (id: string) => {
        const res = await getCoverLetter(id)
        if (res.success && res.coverLetter) {
            setGeneratedContent(res.coverLetter.generatedContent || "")
            setStep(3)
        } else {
            toast.error("Cover letter not found")
            router.push("/ai/coverletter")
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const res = await deleteCoverLetter(id);
        if (res.success) {
            setHistory(h => h.filter(x => x.id !== id))
            if (selectedId === id) {
                resetFlow()
            }
            toast.success("Deleted")
        } else {
            toast.error("Failed to delete")
        }
    }

    const resetFlow = () => {
        router.push("/ai/coverletter")
        setStep(1)
        setJobUrl("")
        setJobDescription("")
        setJobTitle("")
        setCompanyName("")
        setQuestions([])
        setAnswers({})
        setGeneratedContent("")
    }

    const handleExtract = async () => {
        if (!jobUrl) return toast.error("Please enter a job URL")
        setIsExtracting(true)
        const res = await extractJobDescription(jobUrl)
        setIsExtracting(false)

        if (!res.success) {
            return toast.error(res.error)
        }

        setJobDescription(res.description || "")
        setJobTitle(res.title || "")
        handleGenerateQuestions(res.description || "")
    }

    const handleGenerateQuestions = async (jd: string) => {
        setIsGeneratingQuestions(true)
        const res = await generateCoverLetterQuestions(jd)
        setIsGeneratingQuestions(false)

        if (!res.success) {
            return toast.error(res.error)
        }

        setQuestions(res.questions as CoverLetterQuestion[])
        setStep(2)
    }

    const handleGenerateLetter = async () => {
        setIsGeneratingLetter(true)
        const res = await generateAndSaveCoverLetter({
            jobUrl,
            companyName: companyName || "The Company",
            jobTitle: jobTitle || "The Position",
            jobDescription,
            tone,
            questions,
            answers
        })
        setIsGeneratingLetter(false)

        if (!res.success) {
            return toast.error(res.error)
        }

        setGeneratedContent(res.content || "")
        setStep(3)

        // Refresh history
        setHistory(prev => [{
            id: res.coverLetterId!,
            companyName: companyName || "The Company",
            jobTitle: jobTitle || "The Position",
            createdAt: new Date()
        }, ...prev])

        router.push(`/ai/coverletter?id=${res.coverLetterId}`)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">

                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Job Details</CardTitle>
                            <CardDescription>Paste the job link to automatically extract what the employer is looking for.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Job Link</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://company.com/careers/..."
                                        value={jobUrl}
                                        onChange={e => setJobUrl(e.target.value)}
                                        disabled={isExtracting || isGeneratingQuestions}
                                    />
                                    <Button onClick={handleExtract} disabled={isExtracting || isGeneratingQuestions || !jobUrl}>
                                        {(isExtracting || isGeneratingQuestions) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Start Magic
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company Name (Optional)</Label>
                                    <Input
                                        placeholder="E.g. Apple"
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Job Title Override (Optional)</Label>
                                    <Input
                                        placeholder="E.g. Senior Frontend Engineer"
                                        value={jobTitle}
                                        onChange={e => setJobTitle(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Cover Letter Tone</Label>
                                <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Professional">Professional & Direct</SelectItem>
                                        <SelectItem value="Enthusiastic">Highly Enthusiastic</SelectItem>
                                        <SelectItem value="Creative">Creative & Bold</SelectItem>
                                        <SelectItem value="Academic">Academic & Methodical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 border-t border-dashed">
                                <p className="text-sm text-muted-foreground mb-2">Fallback: If extraction fails, paste JD manually.</p>
                                <Textarea
                                    className="text-xs h-32"
                                    placeholder="Paste job description here..."
                                    value={jobDescription}
                                    onChange={e => setJobDescription(e.target.value)}
                                />
                                <div className="mt-2 flex justify-end">
                                    <Button variant="outline" onClick={() => handleGenerateQuestions(jobDescription)} disabled={!jobDescription || isGeneratingQuestions}>
                                        {isGeneratingQuestions ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Use Manual JD"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>2. Tailoring Your Letter</CardTitle>
                            <CardDescription>Answer a few questions about your experience specific to this role.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {questions.map((q, idx) => (
                                <QuestionRenderer
                                    key={q.id}
                                    question={q}
                                    index={idx}
                                    value={answers[q.id]}
                                    onChange={(val: string | string[]) => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                                />
                            ))}

                            <div className="flex gap-4 justify-between pt-4 border-t">
                                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={handleGenerateLetter} disabled={isGeneratingLetter}>
                                    {isGeneratingLetter && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Generate Cover Letter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={resetFlow}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Start New Letter
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                    navigator.clipboard.writeText(generatedContent)
                                    toast.success("Copied to clipboard")
                                }}>
                                    <Copy className="w-4 h-4 mr-2" /> Copy
                                </Button>
                                <Button size="sm" onClick={() => toPDF()}>
                                    <Download className="w-4 h-4 mr-2" /> Download PDF
                                </Button>
                            </div>
                        </div>

                        <Card className="print:shadow-none print:border-none">
                            <CardContent className="pt-6" id="cover-letter-content">
                                <div ref={targetRef} className="prose prose-sm dark:prose-invert max-w-none p-4 bg-background">
                                    <MarkdownRenderer content={generatedContent} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* History Sidebar */}
            <div className="md:col-span-1 space-y-4">
                <div className="font-semibold text-lg flex items-center justify-between">
                    <span>Recent Letters</span>
                </div>
                {history.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg border-dashed">
                        No cover letters generated yet.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {history.map((h: CoverLetterHistoryItem) => (
                            <div
                                key={h.id}
                                onClick={() => router.push(`/ai/coverletter?id=${h.id}`)}
                                className={`p-3 border rounded-lg cursor-pointer transition flex justify-between items-start ${selectedId === h.id ? 'bg-primary/5 border-primary' : 'hover:bg-accent'}`}
                            >
                                <div className="space-y-1 overflow-hidden">
                                    <p className="font-medium text-sm truncate">{h.jobTitle}</p>
                                    <p className="text-xs text-muted-foreground truncate">{h.companyName}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={(e) => handleDelete(h.id, e)}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function QuestionRenderer({ question, index, value, onChange }: { question: CoverLetterQuestion, index: number, value: string | string[] | undefined, onChange: (val: string | string[]) => void }) {

    const [voiceRecording, setVoiceRecording] = useState(false)
    const [voiceLoading, setVoiceLoading] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)

    const handleVoiceToggle = async () => {
        if (voiceRecording) {
            mediaRecorderRef.current?.stop()
            setVoiceRecording(false)
            return
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            const chunks: Blob[] = []
            recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop())
                if (chunks.length === 0) {
                    setVoiceLoading(false)
                    toast.error("No audio recorded")
                    return
                }
                const blob = new Blob(chunks, { type: "audio/webm" })
                const reader = new FileReader()
                reader.onloadend = async () => {
                    const base64 = (reader.result as string).split(",")[1]
                    if (!base64) {
                        setVoiceLoading(false)
                        toast.error("Failed to encode audio")
                        return
                    }
                    const res = await transcribeAndPolishWorkExperience(base64, "audio/webm")
                    setVoiceLoading(false)
                    if (res.success && res.bullets) {
                        onChange((value || "") + "\\n" + res.bullets)
                        toast.success("Added voice response")
                    } else {
                        toast.error(res.error || "Voice processing failed")
                    }
                }
                reader.readAsDataURL(blob)
            }
            recorder.start()
            mediaRecorderRef.current = recorder
            setVoiceRecording(true)
            setVoiceLoading(true)
        } catch {
            toast.error("Microphone access denied")
            setVoiceLoading(false)
        }
    }

    if (question.type === "SINGLE") {
        return (
            <div className="space-y-3">
                <Label className="text-base font-medium">{index + 1}. {question.text}</Label>
                <RadioGroup value={value as string | undefined} onValueChange={onChange}>
                    {question.options?.map((opt: string) => (
                        <div key={opt} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt} id={`${question.id}-${opt}`} />
                            <Label htmlFor={`${question.id}-${opt}`}>{opt}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        )
    }

    if (question.type === "MULTIPLE") {
        const toggleMulti = (opt: string, checked: boolean) => {
            const current = (value as string[]) || []
            if (checked) {
                onChange([...current, opt])
            } else {
                onChange(current.filter((x: string) => x !== opt))
            }
        }

        return (
            <div className="space-y-3">
                <Label className="text-base font-medium">{index + 1}. {question.text}</Label>
                <div className="space-y-2">
                    {question.options?.map((opt: string) => (
                        <div key={opt} className="flex items-center space-x-2">
                            <Checkbox
                                id={`${question.id}-${opt}`}
                                checked={(value || []).includes(opt)}
                                onCheckedChange={(checked) => toggleMulti(opt, checked as boolean)}
                            />
                            <Label htmlFor={`${question.id}-${opt}`}>{opt}</Label>
                        </div>
                    ))}
                </div>
            </div >
        )
    }

    // Default TEXTAREA
    return (
        <div className="space-y-3">
            <div className="flex items-start justify-between">
                <Label className="text-base font-medium">{index + 1}. {question.text}</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs shrink-0 ml-2"
                    disabled={voiceLoading}
                    onClick={handleVoiceToggle}
                >
                    {voiceRecording ? <Square className="w-3 h-3" /> : voiceLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mic className="w-3 h-3" />}
                    {voiceRecording ? "Stop" : "Voice Answer"}
                </Button>
            </div>
            <Textarea
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                placeholder="Type or record your answer here..."
            />
        </div>
    )
}
