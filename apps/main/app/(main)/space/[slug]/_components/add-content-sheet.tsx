"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from '@repo/ui/components/ui/sheet';
import { Button } from '@repo/ui/components/ui/button';
import {
    Plus, Rocket, FileText, Brain, BookOpen, Layers, Mic, Link as LinkIcon,
    ArrowRight, Video, Code, X
} from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import ProjectGenerateSheet from '@/components/projects/project-generate-sheet';
import CreateStudioSheet from '../../../studio/_components/create-studio-sheet';

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
    spaceSlug,
    trigger,
    onContentAdded
}: AddContentSheetProps) {
    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<ContentType | null>(null);

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
    };

    return (
        <Sheet open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setSelectedType(null);
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
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
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
                                        <Button variant="ghost" size="sm" onClick={handleBack}>
                                            <X className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                    </div>
                                    {/* Content type specific forms */}
                                    {
                                        selectedType === 'project' && (
                                            <ProjectGenerateSheet
                                                trigger={
                                                    <div className="text-center py-8">
                                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                                                            <Rocket className="w-8 h-8 text-white" />
                                                        </div>
                                                        <h3 className="text-xl font-bold mb-2">Generate Project</h3>
                                                        <p className="text-neutral-500 mb-4">
                                                            Create a complete project with tasks and concepts
                                                        </p>
                                                        <Button>
                                                            Start Generating
                                                            <ArrowRight className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </div>
                                                }
                                                returnToSpace={{ spaceId, stepOrder: undefined }}
                                                onSuccess={handleSuccess}
                                            />
                                        )
                                    }
                                    {
                                        selectedType === 'studio' && (
                                            <CreateStudioSheet
                                                trigger={
                                                    <div className="text-center py-8">
                                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                                                            <FileText className="w-8 h-8 text-white" />
                                                        </div>
                                                        <h3 className="text-xl font-bold mb-2">Create Studio</h3>
                                                        <p className="text-neutral-500 mb-4">
                                                            Create notes and learning materials
                                                        </p>
                                                        <Button>
                                                            Create Studio
                                                            <ArrowRight className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </div>
                                                }
                                                returnToSpace={{ spaceId, stepOrder: undefined }}
                                                onSuccess={handleSuccess}
                                            />
                                        )
                                    }
                                    {
                                        selectedType === 'quiz' && (
                                            <QuizCreator spaceId={spaceId} onSuccess={handleSuccess} />
                                        )
                                    }
                                    {
                                        selectedType === 'flashcard' && (
                                            <FlashcardCreator spaceId={spaceId} onSuccess={handleSuccess} />
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
                                                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                                                    {selectedType === 'concept' ? <BookOpen className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                                                </div>
                                                <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
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

// Simple Quiz Creator
function QuizCreator({ spaceId, onSuccess }: { spaceId: string; onSuccess: () => void }) {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        // TODO: Implement quiz creation
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSuccess();
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Create Quiz</h3>
                <p className="text-neutral-500">Generate AI-powered quiz questions</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
                <input
                    type="text"
                    placeholder="Quiz Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <textarea
                    placeholder="Topic or content to generate questions from..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <Button onClick={handleCreate} disabled={!title || loading} className="w-full">
                    {loading ? 'Generating...' : 'Generate Quiz'}
                </Button>
            </div>
        </div>
    );
}

// Simple Flashcard Creator
function FlashcardCreator({ spaceId, onSuccess }: { spaceId: string; onSuccess: () => void }) {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        // TODO: Implement flashcard creation
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSuccess();
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Create Flashcards</h3>
                <p className="text-neutral-500">Generate flashcard deck for learning</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
                <input
                    type="text"
                    placeholder="Deck Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <textarea
                    placeholder="Topic to create flashcards for..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <Button onClick={handleCreate} disabled={!title || loading} className="w-full">
                    {loading ? 'Generating...' : 'Generate Flashcards'}
                </Button>
            </div>
        </div>
    );
}

// Link Adder
function LinkAdder({ spaceId, onSuccess }: { spaceId: string; onSuccess: () => void }) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        // TODO: Implement link addition
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSuccess();
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Add External Link</h3>
                <p className="text-neutral-500">Add documentation, articles, or tutorials</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
                <input
                    type="text"
                    placeholder="Link Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <input
                    type="url"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <Button onClick={handleAdd} disabled={!title || !url || loading} className="w-full">
                    {loading ? 'Adding...' : 'Add Link'}
                </Button>
            </div>
        </div>
    );
}

// Video Adder
function VideoAdder({ spaceId, onSuccess }: { spaceId: string; onSuccess: () => void }) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        // TODO: Implement video addition
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSuccess();
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Add Video</h3>
                <p className="text-neutral-500">Embed YouTube or other video content</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
                <input
                    type="text"
                    placeholder="Video Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <input
                    type="url"
                    placeholder="YouTube URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <Button onClick={handleAdd} disabled={!title || !url || loading} className="w-full">
                    {loading ? 'Adding...' : 'Add Video'}
                </Button>
            </div>
        </div>
    );
}


