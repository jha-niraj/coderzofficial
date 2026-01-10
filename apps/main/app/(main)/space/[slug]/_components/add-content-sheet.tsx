"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from '@repo/ui/components/ui/sheet';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Progress } from '@repo/ui/components/ui/progress';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select';
import {
    Plus, Rocket, FileText, Brain, BookOpen, Layers, Mic, Link as LinkIcon,
    ArrowRight, Video, ArrowLeft, Loader2, Sparkles, Check
} from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import toast from '@repo/ui/components/ui/sonner';
import ProjectGenerateSheet from '@/components/projects/project-generate-sheet';
import CreateStudioSheet from '../../../studio/_components/create-studio-sheet';
import {
    generateSpaceQuiz, generateSpaceFlashcards, addSpaceLink, addSpaceVideo,
    addProjectToSpace, addStudioToSpace
} from '@/actions/(main)/space/content.action';
import { useSpaceStore, type OptimisticStep } from '@/app/store/spaceStore';

interface AddContentSheetProps {
    spaceId: string;
    spaceSlug: string;
    trigger?: React.ReactNode;
    onContentAdded?: () => void;
}

type ContentType = 'project' | 'studio' | 'quiz' | 'flashcard' | 'concept' | 'mock' | 'link' | 'video';

const contentOptions: { type: ContentType; icon: typeof Rocket; label: string; description: string; color: string }[] = [
    {
        type: 'project',
        icon: Rocket,
        label: 'Project',
        description: 'Generate an AI-powered project with tasks and concepts',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        type: 'studio',
        icon: FileText,
        label: 'Studio',
        description: 'Create notes, documentation, or learning materials',
        color: 'from-purple-500 to-pink-500'
    },
    {
        type: 'quiz',
        icon: Brain,
        label: 'Quiz',
        description: 'Test knowledge with AI-generated questions',
        color: 'from-emerald-500 to-teal-500'
    },
    {
        type: 'flashcard',
        icon: Layers,
        label: 'Flashcards',
        description: 'Create flashcard decks for spaced repetition learning',
        color: 'from-amber-500 to-orange-500'
    },
    {
        type: 'concept',
        icon: BookOpen,
        label: 'Concept',
        description: 'Add a concept card from the concepts library',
        color: 'from-rose-500 to-red-500'
    },
    {
        type: 'mock',
        icon: Mic,
        label: 'Mock Interview',
        description: 'Practice with AI-powered interview simulation',
        color: 'from-indigo-500 to-violet-500'
    },
    {
        type: 'link',
        icon: LinkIcon,
        label: 'External Link',
        description: 'Add documentation, articles, or tutorials',
        color: 'from-slate-500 to-gray-500'
    },
    {
        type: 'video',
        icon: Video,
        label: 'Video',
        description: 'Embed YouTube or other video content',
        color: 'from-red-500 to-rose-500'
    },
];

export default function AddContentSheet({
    spaceId,
    trigger,
    onContentAdded
}: AddContentSheetProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<ContentType | null>(null);
    const [generating, setGenerating] = useState(false);

    const handleTypeSelect = (type: ContentType) => {
        setSelectedType(type);
    };

    const handleBack = () => {
        setSelectedType(null);
    };

    const handleSuccess = () => {
        setOpen(false);
        setSelectedType(null);
        onContentAdded?.();
        router.refresh();
    };

    const handleProjectSuccess = async (projectSlug: string) => {
        // Add the project to space timeline
        const result = await addProjectToSpace(spaceId, '', projectSlug, `Project: ${projectSlug}`);
        if (result.success) {
            handleSuccess();
        }
    };

    const handleStudioSuccess = async (studioSlug: string) => {
        // Add the studio to space timeline
        const result = await addStudioToSpace(spaceId, '', studioSlug, `Studio: ${studioSlug}`);
        if (result.success) {
            handleSuccess();
        }
    };

    return (
        <Sheet open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                setSelectedType(null);
                setGenerating(false);
            }
        }}>
            <SheetTrigger asChild>
                {
                trigger || (
                    <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Content
                    </Button>
                )
                }
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">
                        {
                        !selectedType ? (
                            <motion.div
                                key="selector"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <SheetHeader className="mb-8">
                                    <SheetTitle className="text-2xl flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                            <Plus className="w-6 h-6 text-white" />
                                        </div>
                                        Add Content to Timeline
                                    </SheetTitle>
                                    <SheetDescription>
                                        Choose what type of content you want to add to this Space
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {
                                    contentOptions.map((option, index) => {
                                        const Icon = option.icon;
                                        return (
                                            <motion.button
                                                key={option.type}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => handleTypeSelect(option.type)}
                                                className="group relative p-5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all text-left bg-white dark:bg-neutral-900"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "p-3 rounded-xl bg-gradient-to-br text-white shrink-0",
                                                        option.color
                                                    )}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {option.label}
                                                        </h3>
                                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                </div>
                                            </motion.button>
                                        );
                                    })
                                    }
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={selectedType}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <Button variant="ghost" size="sm" onClick={handleBack} disabled={generating}>
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                </div>
                                
                                {
                                selectedType === 'project' && (
                                    <ProjectGenerateSheet
                                        trigger={
                                            <div className="text-center py-8">
                                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                                                    <Rocket className="w-10 h-10 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold mb-2">Generate Project</h3>
                                                <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                                                    Create a complete project with tasks and concepts. The project will be added to your timeline.
                                                </p>
                                                <Button size="lg" className="gap-2">
                                                    <Sparkles className="w-5 h-5" />
                                                    Start Generating
                                                </Button>
                                            </div>
                                        }
                                        spaceId={spaceId}
                                        onSuccess={handleProjectSuccess}
                                    />
                                )
                                }
                                {
                                selectedType === 'studio' && (
                                    <CreateStudioSheet
                                        trigger={
                                            <div className="text-center py-8">
                                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                                                    <FileText className="w-10 h-10 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold mb-2">Create Studio</h3>
                                                <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                                                    Create notes and learning materials. The studio will be added to your timeline.
                                                </p>
                                                <Button size="lg" className="gap-2">
                                                    <Plus className="w-5 h-5" />
                                                    Create Studio
                                                </Button>
                                            </div>
                                        }
                                        spaceId={spaceId}
                                        onSuccess={handleStudioSuccess}
                                    />
                                )
                                }
                                {
                                selectedType === 'quiz' && (
                                    <QuizCreator
                                        spaceId={spaceId}
                                        onSuccess={handleSuccess}
                                        generating={generating}
                                        setGenerating={setGenerating}
                                    />
                                )
                                }
                                {
                                selectedType === 'flashcard' && (
                                    <FlashcardCreator
                                        spaceId={spaceId}
                                        onSuccess={handleSuccess}
                                        generating={generating}
                                        setGenerating={setGenerating}
                                    />
                                )
                                }
                                {
                                selectedType === 'link' && (
                                    <LinkAdder spaceId={spaceId} onSuccess={handleSuccess} />
                                )
                                }
                                {
                                selectedType === 'video' && (
                                    <VideoAdder spaceId={spaceId} onSuccess={handleSuccess} />
                                )
                                }
                                {
                                (selectedType === 'concept' || selectedType === 'mock') && (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                                            {selectedType === 'concept' ? <BookOpen className="w-10 h-10 text-neutral-400" /> : <Mic className="w-10 h-10 text-neutral-400" />}
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
                                        <p className="text-neutral-500">
                                            This feature is under development
                                        </p>
                                    </div>
                                )
                                }
                            </motion.div>
                        )
                        }
                    </AnimatePresence>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Quiz Creator with optimistic updates
function QuizCreator({
    spaceId,
    onSuccess,
    generating,
    setGenerating
}: {
    spaceId: string;
    onSuccess: () => void;
    generating: boolean;
    setGenerating: (v: boolean) => void;
}) {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [questionCount, setQuestionCount] = useState('5');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [progress, setProgress] = useState(0);
    const { addStep, updateStep, setStepError, steps } = useSpaceStore();

    const handleCreate = async () => {
        if (!title.trim() || !topic.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setGenerating(true);
        setProgress(10);

        // Create optimistic step
        const tempId = `temp-quiz-${Date.now()}`;
        const optimisticStep: OptimisticStep = {
            id: tempId,
            order: steps.length + 1,
            title: title.trim(),
            description: `Quiz about ${topic} (${questionCount} questions, ${difficulty} difficulty)`,
            contentType: 'QUIZ',
            contentId: null,
            contentData: { type: 'quiz', topic, difficulty, generating: true },
            isRequired: false,
            estimatedTime: parseInt(questionCount) * 2,
            status: 'ACTIVE',
            completionCount: 0,
            averageTimeSpent: null,
            isOptimistic: true,
            isLoading: true,
            error: null,
        };
        
        // Add to store immediately (optimistic)
        addStep(optimisticStep);
        onSuccess(); // Close sheet immediately

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(p => Math.min(p + 15, 85));
        }, 1000);

        try {
            const result = await generateSpaceQuiz(
                spaceId,
                title,
                topic,
                parseInt(questionCount),
                difficulty
            );

            clearInterval(progressInterval);
            setProgress(100);

            if (result.success && result.data) {
                // Update with real data
                updateStep(tempId, {
                    id: result.data.stepId,
                    contentData: { type: 'quiz', topic, difficulty, questions: result.data.questions },
                    isOptimistic: false,
                    isLoading: false,
                });
                toast.success('Quiz created and added to timeline!');
            } else {
                // Mark as error
                setStepError(tempId, result.error || 'Failed to create quiz', async () => {
                    updateStep(tempId, { isLoading: true, error: null });
                    const retryResult = await generateSpaceQuiz(spaceId, title, topic, parseInt(questionCount), difficulty);
                    if (retryResult.success && retryResult.data) {
                        updateStep(tempId, {
                            id: retryResult.data.stepId,
                            contentData: { type: 'quiz', topic, difficulty, questions: retryResult.data.questions },
                            isOptimistic: false,
                            isLoading: false,
                            error: null,
                        });
                        toast.success('Quiz created successfully!');
                    }
                });
                toast.error(result.error || 'Failed to create quiz');
            }
        } catch {
            clearInterval(progressInterval);
            setStepError(tempId, 'Failed to create quiz');
            toast.error('Failed to create quiz');
        }
        setGenerating(false);
    };

    if (generating) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16"
            >
                <div className="relative mb-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-neutral-950 flex items-center justify-center">
                            {
                            progress === 100 ? (
                                <Check className="w-10 h-10 text-green-500" />
                            ) : (
                                <Brain className="w-10 h-10 text-emerald-500" />
                            )
                            }
                        </div>
                    </motion.div>
                </div>
                <h3 className="text-xl font-bold mb-2">
                    {progress === 100 ? 'Quiz Created!' : 'Generating Quiz...'}
                </h3>
                <p className="text-neutral-500 mb-6">
                    {progress === 100 ? 'Adding to your timeline' : 'Creating AI-powered questions'}
                </p>
                <div className="w-full max-w-xs">
                    <Progress value={progress} className="h-2" />
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Create Quiz</h3>
                <p className="text-neutral-500">Generate AI-powered quiz questions</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                    <Label>Quiz Title *</Label>
                    <Input
                        placeholder="e.g., JavaScript Basics Quiz"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Topic *</Label>
                    <Textarea
                        placeholder="Topic or content to generate questions from..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        rows={3}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Questions</Label>
                        <Select value={questionCount} onValueChange={setQuestionCount}>
                            <SelectTrigger className="h-12">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">3 questions</SelectItem>
                                <SelectItem value="5">5 questions</SelectItem>
                                <SelectItem value="10">10 questions</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select value={difficulty} onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}>
                            <SelectTrigger className="h-12">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button
                    onClick={handleCreate}
                    disabled={!title.trim() || !topic.trim()}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Quiz
                </Button>
            </div>
        </div>
    );
}

// Flashcard Creator with optimistic updates
function FlashcardCreator({
    spaceId,
    onSuccess,
    generating,
    setGenerating
}: {
    spaceId: string;
    onSuccess: () => void;
    generating: boolean;
    setGenerating: (v: boolean) => void;
}) {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [cardCount, setCardCount] = useState('10');
    const [progress, setProgress] = useState(0);
    const { addStep, updateStep, setStepError, steps } = useSpaceStore();

    const handleCreate = async () => {
        if (!title.trim() || !topic.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setGenerating(true);
        setProgress(10);

        // Create optimistic step
        const tempId = `temp-flashcard-${Date.now()}`;
        const optimisticStep: OptimisticStep = {
            id: tempId,
            order: steps.length + 1,
            title: title.trim(),
            description: `${cardCount} flashcards about ${topic}`,
            contentType: 'FLASHCARD',
            contentId: null,
            contentData: { type: 'flashcard', topic, generating: true },
            isRequired: false,
            estimatedTime: Math.ceil(parseInt(cardCount) * 0.5),
            status: 'ACTIVE',
            completionCount: 0,
            averageTimeSpent: null,
            isOptimistic: true,
            isLoading: true,
            error: null,
        };
        
        // Add to store immediately (optimistic)
        addStep(optimisticStep);
        onSuccess(); // Close sheet immediately

        const progressInterval = setInterval(() => {
            setProgress(p => Math.min(p + 15, 85));
        }, 1000);

        try {
            const result = await generateSpaceFlashcards(
                spaceId,
                title,
                topic,
                parseInt(cardCount)
            );

            clearInterval(progressInterval);
            setProgress(100);

            if (result.success && result.data) {
                // Update with real data
                updateStep(tempId, {
                    id: result.data.stepId,
                    contentData: { type: 'flashcard', topic, cards: result.data.cards },
                    isOptimistic: false,
                    isLoading: false,
                });
                toast.success('Flashcards created and added to timeline!');
            } else {
                // Mark as error
                setStepError(tempId, result.error || 'Failed to create flashcards', async () => {
                    updateStep(tempId, { isLoading: true, error: null });
                    const retryResult = await generateSpaceFlashcards(spaceId, title, topic, parseInt(cardCount));
                    if (retryResult.success && retryResult.data) {
                        updateStep(tempId, {
                            id: retryResult.data.stepId,
                            contentData: { type: 'flashcard', topic, cards: retryResult.data.cards },
                            isOptimistic: false,
                            isLoading: false,
                            error: null,
                        });
                        toast.success('Flashcards created successfully!');
                    }
                });
                toast.error(result.error || 'Failed to create flashcards');
            }
        } catch {
            clearInterval(progressInterval);
            setStepError(tempId, 'Failed to create flashcards');
            toast.error('Failed to create flashcards');
        }
        setGenerating(false);
    };

    if (generating) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16"
            >
                <div className="relative mb-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-neutral-950 flex items-center justify-center">
                            {
                            progress === 100 ? (
                                <Check className="w-10 h-10 text-green-500" />
                            ) : (
                                <Layers className="w-10 h-10 text-amber-500" />
                            )
                            }
                        </div>
                    </motion.div>
                </div>
                <h3 className="text-xl font-bold mb-2">
                    {progress === 100 ? 'Flashcards Created!' : 'Generating Flashcards...'}
                </h3>
                <p className="text-neutral-500 mb-6">
                    {progress === 100 ? 'Adding to your timeline' : 'Creating study cards'}
                </p>
                <div className="w-full max-w-xs">
                    <Progress value={progress} className="h-2" />
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Create Flashcards</h3>
                <p className="text-neutral-500">Generate flashcard deck for learning</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                    <Label>Deck Title *</Label>
                    <Input
                        placeholder="e.g., React Hooks Flashcards"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Topic *</Label>
                    <Textarea
                        placeholder="Topic to create flashcards for..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        rows={3}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Number of Cards</Label>
                    <Select value={cardCount} onValueChange={setCardCount}>
                        <SelectTrigger className="h-12">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 cards</SelectItem>
                            <SelectItem value="10">10 cards</SelectItem>
                            <SelectItem value="15">15 cards</SelectItem>
                            <SelectItem value="20">20 cards</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    onClick={handleCreate}
                    disabled={!title.trim() || !topic.trim()}
                    className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Flashcards
                </Button>
            </div>
        </div>
    );
}

// Link Adder with optimistic updates
function LinkAdder({ spaceId, onSuccess }: { spaceId: string; onSuccess: () => void }) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const { addStep, updateStep, setStepError, steps } = useSpaceStore();

    const handleAdd = async () => {
        if (!title.trim() || !url.trim()) {
            toast.error('Please fill in title and URL');
            return;
        }

        setLoading(true);
        
        // Create optimistic step
        const tempId = `temp-link-${Date.now()}`;
        const optimisticStep: OptimisticStep = {
            id: tempId,
            order: steps.length + 1,
            title: title.trim(),
            description: description || null,
            contentType: 'LINK',
            contentId: null,
            contentData: { url, type: 'link' },
            isRequired: false,
            estimatedTime: null,
            status: 'ACTIVE',
            completionCount: 0,
            averageTimeSpent: null,
            isOptimistic: true,
            isLoading: true,
            error: null,
        };
        
        // Add to store immediately (optimistic)
        addStep(optimisticStep);
        onSuccess(); // Close sheet immediately

        // Make server call
        const result = await addSpaceLink(spaceId, title, url, description || undefined);

        if (result.success && result.data) {
            // Update with real data
            updateStep(tempId, {
                id: result.data.stepId,
                isOptimistic: false,
                isLoading: false,
            });
            toast.success('Link added to timeline!');
        } else {
            // Mark as error
            setStepError(tempId, result.error || 'Failed to add link', async () => {
                const retryResult = await addSpaceLink(spaceId, title, url, description || undefined);
                if (retryResult.success && retryResult.data) {
                    updateStep(tempId, {
                        id: retryResult.data.stepId,
                        isOptimistic: false,
                        isLoading: false,
                        error: null,
                    });
                    toast.success('Link added successfully!');
                }
            });
            toast.error(result.error || 'Failed to add link');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Add External Link</h3>
                <p className="text-neutral-500">Add documentation, articles, or tutorials</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                    <Label>Link Title *</Label>
                    <Input
                        placeholder="e.g., React Documentation"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12"
                    />
                </div>
                <div className="space-y-2">
                    <Label>URL *</Label>
                    <Input
                        type="url"
                        placeholder="https://..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                        placeholder="Brief description of the resource..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                    />
                </div>
                <Button
                    onClick={handleAdd}
                    disabled={!title.trim() || !url.trim() || loading}
                    className="w-full h-12"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                    ) : (
                     
                        <><Plus className="w-4 h-4 mr-2" /> Add Link</>
                    )}
                </Button>
            </div>
        </div>
    );
}

// Video Adder with optimistic updates
function VideoAdder({ spaceId, onSuccess }: { spaceId: string; onSuccess: () => void }) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const { addStep, updateStep, setStepError, steps } = useSpaceStore();

    const handleAdd = async () => {
        if (!title.trim() || !url.trim()) {
            toast.error('Please fill in title and URL');
            return;
        }

        setLoading(true);
        
        // Create optimistic step
        const tempId = `temp-video-${Date.now()}`;
        const optimisticStep: OptimisticStep = {
            id: tempId,
            order: steps.length + 1,
            title: title.trim(),
            description: description || null,
            contentType: 'VIDEO',
            contentId: null,
            contentData: { url, type: 'video' },
            isRequired: false,
            estimatedTime: null,
            status: 'ACTIVE',
            completionCount: 0,
            averageTimeSpent: null,
            isOptimistic: true,
            isLoading: true,
            error: null,
        };
        
        // Add to store immediately (optimistic)
        addStep(optimisticStep);
        onSuccess(); // Close sheet immediately

        // Make server call
        const result = await addSpaceVideo(spaceId, title, url, description || undefined);

        if (result.success && result.data) {
            // Update with real data
            updateStep(tempId, {
                id: result.data.stepId,
                isOptimistic: false,
                isLoading: false,
            });
            toast.success('Video added to timeline!');
        } else {
            // Mark as error
            setStepError(tempId, result.error || 'Failed to add video', async () => {
                const retryResult = await addSpaceVideo(spaceId, title, url, description || undefined);
                if (retryResult.success && retryResult.data) {
                    updateStep(tempId, {
                        id: retryResult.data.stepId,
                        isOptimistic: false,
                        isLoading: false,
                        error: null,
                    });
                    toast.success('Video added successfully!');
                }
            });
            toast.error(result.error || 'Failed to add video');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
                    <Video className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Add Video</h3>
                <p className="text-neutral-500">Embed YouTube or other video content</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                    <Label>Video Title *</Label>
                    <Input
                        placeholder="e.g., Introduction to React"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12"
                    />
                </div>
                <div className="space-y-2">
                    <Label>YouTube URL *</Label>
                    <Input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                        placeholder="Brief description of the video..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                    />
                </div>
                <Button
                    onClick={handleAdd}
                    disabled={!title.trim() || !url.trim() || loading}
                    className="w-full h-12 bg-gradient-to-r from-red-600 to-rose-600 text-white"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                    ) : (
                        <><Plus className="w-4 h-4 mr-2" /> Add Video</>
                    )}
                </Button>
            </div>
        </div>
    );
}
