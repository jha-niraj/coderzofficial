"use client";

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ReactFlow, ReactFlowProvider, Node, Edge, Controls, Background, BackgroundVariant,
    useNodesState, useEdgesState, Position, MarkerType, Handle
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    CheckCircle2, Lock, Play, BookOpen, Rocket, FileText,
    Brain, Layers, Video, Link as LinkIcon, Heart, MessageSquare,
    Loader2, Clock
} from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { Badge } from '@repo/ui/components/ui/badge';
import { cn } from '@repo/ui/lib/utils';
import { useSpaceStore } from '@/app/store/spaceStore';
import { toggleStepLike } from '@/actions/(main)/space/social.action';
import toast from '@repo/ui/components/ui/sonner';

// ============================================================================
// Types
// ============================================================================

interface TimelineStep {
    id: string;
    order: number;
    title: string;
    description?: string | null;
    contentType: string;
    contentId?: string | null;
    contentData?: Record<string, unknown>;
    isRequired: boolean;
    estimatedTime?: number | null;
    status: string;
    completionCount: number;
    averageTimeSpent?: number | null;
    isOptimistic?: boolean;
    isLoading?: boolean;
    error?: string | null;
}

interface ActiveMember {
    id: string;
    name?: string | null;
    image?: string | null;
    currentStepId?: string | null;
}

interface SpaceFlowTimelineProps {
    steps: TimelineStep[];
    spaceId: string;
    spaceSlug: string;
    userProgress?: {
        currentStepId?: string;
        completedSteps: string[];
    };
    activeMembers?: ActiveMember[];
    onStepClick?: (step: TimelineStep) => void;
    onCommentClick?: (stepId: string) => void;
}

// ============================================================================
// Content Type Configuration
// ============================================================================

const contentTypeIcons: Record<string, typeof Rocket> = {
    PROJECT: Rocket,
    STUDIO: FileText,
    QUIZ: Brain,
    FLASHCARD: Layers,
    VIDEO: Video,
    LINK: LinkIcon,
    learn: BookOpen,
};

const contentTypeColors: Record<string, string> = {
    PROJECT: 'from-blue-500 to-cyan-500',
    STUDIO: 'from-purple-500 to-pink-500',
    QUIZ: 'from-emerald-500 to-teal-500',
    FLASHCARD: 'from-amber-500 to-orange-500',
    VIDEO: 'from-red-500 to-rose-500',
    LINK: 'from-slate-500 to-gray-500',
    learn: 'from-rose-500 to-red-500',
};

// ============================================================================
// Simple Step Node Component
// ============================================================================

interface StepNodeData {
    step: TimelineStep;
    status: string;
    spaceId: string;
}

function StepNode({ data }: { data: StepNodeData }) {
    const { step, status, spaceId } = data;
    const router = useRouter();
    const { openSidebar } = useSpaceStore();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const Icon = contentTypeIcons[step.contentType] || BookOpen;
    const color = contentTypeColors[step.contentType] || 'from-gray-500 to-slate-500';

    const handleClick = () => {
        const contentType = step.contentType;

        if (contentType === 'QUIZ') {
            openSidebar('quiz', {
                title: step.title,
                contentData: step.contentData,
            });
            return;
        }

        if (contentType === 'FLASHCARD') {
            openSidebar('flashcard', {
                title: step.title,
                contentData: step.contentData,
            });
            return;
        }

        if (contentType === 'LINK' && step.contentData?.url && typeof step.contentData.url === 'string') {
            window.open(step.contentData.url, '_blank', 'noopener,noreferrer');
            return;
        }

        if (contentType === 'VIDEO' && step.contentData?.url && typeof step.contentData.url === 'string') {
            window.open(step.contentData.url, '_blank', 'noopener,noreferrer');
            return;
        }

        if (contentType === 'PROJECT' && step.contentId) {
            router.push(`/projects/${step.contentId}`);
            return;
        }

        if (contentType === 'STUDIO' && step.contentId) {
            router.push(`/studio/${step.contentId}`);
            return;
        }
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            await toggleStepLike(spaceId, step.id);
        } catch {
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
            toast.error('Failed to like');
        }
    };

    const getStatusStyle = () => {
        switch (status) {
            case 'completed':
                return 'border-green-400 dark:border-green-600';
            case 'current':
                return 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20';
            case 'locked':
                return 'border-neutral-300 dark:border-neutral-700 opacity-60';
            case 'loading':
                return 'border-neutral-300 dark:border-neutral-700 animate-pulse';
            case 'error':
                return 'border-red-400 dark:border-red-600';
            default:
                return 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300';
        }
    };

    return (
        <div className="relative">
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-neutral-400 !w-2.5 !h-2.5 !border-2 !border-white dark:!border-neutral-900"
            />

            <div
                className={cn(
                    "w-[190px] p-2.5 rounded-xl border-2 bg-white dark:bg-neutral-900 transition-all cursor-pointer",
                    getStatusStyle()
                )}
                onClick={handleClick}
            >
                {/* Header */}
                <div className="flex items-start gap-2 mb-1.5">
                    <div className={cn("p-1 rounded-lg bg-gradient-to-br shrink-0", color)}>
                        {status === 'completed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        ) : status === 'locked' ? (
                            <Lock className="w-3.5 h-3.5 text-white/70" />
                        ) : status === 'loading' ? (
                            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                        ) : (
                            <Icon className="w-3.5 h-3.5 text-white" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs leading-tight line-clamp-2 text-neutral-900 dark:text-white">
                            {step.title}
                        </h4>
                    </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-[9px] text-neutral-500">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                        {step.contentType}
                    </Badge>
                    <div className="flex items-center gap-2">
                        {step.estimatedTime && (
                            <span className="flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {step.estimatedTime}m
                            </span>
                        )}
                        <span>#{step.order}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-neutral-100 dark:border-neutral-800">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={cn("h-5 px-1.5 gap-0.5 text-[9px]", isLiked && "text-red-500")}
                    >
                        <Heart className={cn("w-2.5 h-2.5", isLiked && "fill-current")} />
                        {likeCount > 0 && <span>{likeCount}</span>}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[9px]"
                    >
                        <MessageSquare className="w-2.5 h-2.5" />
                    </Button>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-neutral-400 !w-2.5 !h-2.5 !border-2 !border-white dark:!border-neutral-900"
            />
        </div>
    );
}

// ============================================================================
// Start Node
// ============================================================================

function StartNode({ data }: { data: { progress: number; totalSteps: number } }) {
    return (
        <div className="relative">
            <div className="w-[160px] p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                    <Play className="w-4 h-4" />
                    <div>
                        <h4 className="font-bold text-xs">Start</h4>
                        <p className="text-[9px] opacity-80">{data.totalSteps} steps</p>
                    </div>
                </div>
                <div className="bg-white/20 rounded-full h-1 overflow-hidden">
                    <div
                        className="bg-white rounded-full h-full transition-all"
                        style={{ width: `${data.progress}%` }}
                    />
                </div>
                <p className="text-[9px] text-center mt-1 opacity-80">{Math.round(data.progress)}%</p>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-white !w-2.5 !h-2.5 !border-2 !border-green-500"
            />
        </div>
    );
}

// ============================================================================
// End Node
// ============================================================================

function EndNode() {
    return (
        <div className="relative">
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-white !w-2.5 !h-2.5 !border-2 !border-amber-500"
            />
            <div className="w-[140px] p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <div>
                        <h4 className="font-bold text-xs">Complete!</h4>
                        <p className="text-[9px] opacity-80">Well done</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Node Types
// ============================================================================

const nodeTypes = {
    step: StepNode,
    start: StartNode,
    end: EndNode,
};

// ============================================================================
// Flow Content (Inside Provider)
// ============================================================================

function FlowContent({
    steps,
    spaceId,
    userProgress,
}: {
    steps: TimelineStep[];
    spaceId: string;
    userProgress?: { currentStepId?: string; completedSteps: string[] };
}) {
    // Calculate progress
    const progress = useMemo(() => {
        if (steps.length === 0) return 0;
        const completed = userProgress?.completedSteps.length || 0;
        return (completed / steps.length) * 100;
    }, [steps.length, userProgress?.completedSteps]);

    // Get step status
    const getStepStatus = useCallback((step: TimelineStep): string => {
        if (step.isOptimistic && step.isLoading) return 'loading';
        if (step.error) return 'error';
        if (userProgress?.completedSteps.includes(step.id)) return 'completed';
        if (userProgress?.currentStepId === step.id) return 'current';
        const stepIndex = steps.findIndex(s => s.id === step.id);
        const currentIndex = steps.findIndex(s => s.id === userProgress?.currentStepId);
        if (currentIndex >= 0 && stepIndex > currentIndex) return 'locked';
        return 'available';
    }, [steps, userProgress]);

    // Generate nodes and edges
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
        const totalSteps = sortedSteps.length;

        // Layout
        const startX = 40;
        const startY = 30;
        const nodeHeight = 160;

        // Start node
        nodes.push({
            id: 'start',
            type: 'start',
            position: { x: startX, y: startY },
            data: { progress, totalSteps },
        });

        // Step nodes
        sortedSteps.forEach((step, index) => {
            nodes.push({
                id: step.id,
                type: 'step',
                position: {
                    x: startX,
                    y: startY + 100 + (index * nodeHeight)
                },
                data: {
                    step,
                    status: getStepStatus(step),
                    spaceId,
                },
            });
        });

        // End node
        if (totalSteps > 0) {
            nodes.push({
                id: 'end',
                type: 'end',
                position: {
                    x: startX + 10,
                    y: startY + 100 + (totalSteps * nodeHeight) + 20
                },
                data: {},
            });
        }

        // Edges
        if (sortedSteps.length > 0) {
            edges.push({
                id: 'start-to-first',
                source: 'start',
                target: sortedSteps[0]?.id ?? '',
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#22c55e', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
            });
        }

        for (let i = 0; i < sortedSteps.length - 1; i++) {
            const current = sortedSteps[i];
            const next = sortedSteps[i + 1];
            const isCompleted = userProgress?.completedSteps.includes(current?.id ?? '');

            edges.push({
                id: `${current?.id}-to-${next?.id}`,
                source: current?.id ?? '',
                target: next?.id ?? '',
                type: 'smoothstep',
                animated: !isCompleted,
                style: {
                    stroke: isCompleted ? '#22c55e' : '#6366f1',
                    strokeWidth: 2,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isCompleted ? '#22c55e' : '#6366f1'
                },
            });
        }

        if (sortedSteps.length > 0) {
            const lastStep = sortedSteps[sortedSteps.length - 1];
            edges.push({
                id: 'last-to-end',
                source: lastStep?.id ?? '',
                target: 'end',
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#f59e0b', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
            });
        }

        return { nodes, edges };
    }, [steps, progress, userProgress, getStepStatus, spaceId]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Sync nodes/edges when they change
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const canvasHeight = Math.max(500, 130 + steps.length * 160 + 80);

    return (
        <div
            className="w-full rounded-xl overflow-hidden bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900"
            style={{ height: canvasHeight }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
                minZoom={0.3}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
                className="bg-transparent"
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnScroll
                zoomOnScroll
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="#e5e5e5"
                    className="dark:opacity-20"
                />
                <Controls
                    className="!bg-white dark:!bg-neutral-800 !border-neutral-200 dark:!border-neutral-700 !rounded-lg !shadow-md"
                    showInteractive={false}
                    position="bottom-right"
                />
            </ReactFlow>
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function SpaceFlowTimeline({
    steps,
    spaceId,
    userProgress,
}: SpaceFlowTimelineProps) {
    if (steps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                    <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    No Steps Yet
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400">
                    Add content to build your timeline
                </p>
            </div>
        );
    }

    return (
        <ReactFlowProvider>
            <FlowContent
                steps={steps}
                spaceId={spaceId}
                userProgress={userProgress}
            />
        </ReactFlowProvider>
    );
}
