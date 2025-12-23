"use client";

import { useState, useEffect } from "react";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    Check, X, ArrowLeft, Flag, Download, Share2, AlertCircle
} from "lucide-react";
import type { QuizQuestion } from "./quiz";
import {
    Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { motion } from "framer-motion";

type QuizResultsProps = {
    quizId: string;
    questions: QuizQuestion[];
    userAnswers: Record<string, string[]>;
    quizTitle: string;
    onRetake?: () => void;
};

export default function QuizResults({ quizId, questions, userAnswers, quizTitle, onRetake }: QuizResultsProps) {
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
    const [activeTab, setActiveTab] = useState("overall");
    const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load flagged questions from localStorage
    useEffect(() => {
        if (!quizId) {
            setError("Invalid quiz ID");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const savedData = localStorage.getItem(`quiz-${quizId}`);
        if (savedData) {
            try {
                const { flagged } = JSON.parse(savedData);
                setFlaggedQuestions(flagged || []);
            } catch (err) {
                console.error("Failed to load flagged questions:", err);
            }
        }
        setIsLoading(false);
    }, [quizId]);

    // Validate props
    useEffect(() => {
        if (!questions.length) {
            setError("No questions available");
        } else if (!userAnswers) {
            setError("No answers provided");
        } else {
            setError(null);
        }
    }, [questions, userAnswers]);

    // Calculate score
    const results = questions.map((question) => {
        const userSelectedIds = userAnswers[question.id] || [];
        const correctOptionIds = question.options.filter((option) => option.isCorrect).map((option) => option.id);

        let isCorrect = false;

        if (question.type === "single") {
            isCorrect = userSelectedIds.length === 1 && correctOptionIds.includes(userSelectedIds[0]);
        } else {
            const allCorrectSelected = correctOptionIds.every((id) => userSelectedIds.includes(id));
            const noIncorrectSelected = userSelectedIds.every((id) => correctOptionIds.includes(id));
            isCorrect = allCorrectSelected && noIncorrectSelected;
        }

        return {
            question,
            isCorrect,
            userSelectedIds,
        };
    });

    const correctCount = results.filter((result) => result.isCorrect).length;
    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    const categories = questions
        .map((q) => q.category || "Uncategorized")
        .filter((value, index, self) => self.indexOf(value) === index);

    const categoryData = categories.map((category) => {
        const categoryQuestions = results.filter(
            (r) => r.question.category === category || (!r.question.category && category === "Uncategorized")
        );
        const categoryCorrect = categoryQuestions.filter((r) => r.isCorrect).length;

        return {
            name: category,
            percentage: Math.round((categoryCorrect / categoryQuestions.length) * 100),
            correct: categoryCorrect,
            total: categoryQuestions.length,
        };
    });

    const selectedQuestion = questions[selectedQuestionIndex];
    const selectedResult = results[selectedQuestionIndex];

    const handleExport = () => {
        alert("Exporting results as PDF (placeholder)");
        // Implement PDF generation using a library like jsPDF
    };

    const handleShare = () => {
        alert("Sharing results (placeholder)");
        // Implement sharing via Web Share API or social media links
    };

    const handleMobileQuestionSelect = (value: string) => {
        setSelectedQuestionIndex(parseInt(value));
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row w-full max-w-7xl mx-auto p-4"
        >
            {
                activeTab === "questions" && (
                    <div className="hidden md:block w-64 mr-6 border-r border-gray-200 pr-4">
                        <div className="sticky top-4">
                            <h3 className="text-lg font-semibold mb-4">
                                Score: {correctCount}/{questions.length}
                            </h3>
                            <Separator className="my-4" />
                            <div className="space-y-2">
                                {
                                    questions.map((question, index) => (
                                        <Button
                                            key={question.id}
                                            variant="outline"
                                            size="sm"
                                            className={`w-full justify-start text-left h-auto py-2 relative ${selectedQuestionIndex === index ? "bg-blue-100 border-blue-500" : ""
                                                } ${results[index].isCorrect ? "border-green-400 text-green-700" : "border-red-400 text-red-700"}`}
                                            onClick={() => setSelectedQuestionIndex(index)}
                                            aria-label={`Question ${index + 1}: ${results[index].isCorrect ? "Correct" : "Incorrect"}`}
                                        >
                                            <span className="truncate">
                                                {index + 1}. {question.text.substring(0, 20)}
                                                {question.text.length > 20 ? "..." : ""}
                                            </span>
                                            {
                                                flaggedQuestions.includes(question.id) && (
                                                    <Flag className="h-4 w-4 absolute top-2 right-2 text-red-500" />
                                                )
                                            }
                                        </Button>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )
            }
            <div className={`flex-1 ${activeTab === "questions" ? "" : "w-full"}`}>
                <Card className="shadow-lg">
                    <CardHeader className="border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-bold text-gray-800">{quizTitle} - Results</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleExport}>
                                    <Download className="h-4 w-4 mr-2" /> Export
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleShare}>
                                    <Share2 className="h-4 w-4 mr-2" /> Share
                                </Button>
                                {
                                    onRetake && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onRetake}
                                            className="flex items-center gap-1"
                                            aria-label="Retake quiz"
                                        >
                                            <ArrowLeft className="h-4 w-4" /> Retake Quiz
                                        </Button>
                                    )
                                }
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 pb-6 px-6">
                        <Tabs defaultValue="overall" onValueChange={setActiveTab}>
                            <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg">
                                <TabsTrigger value="overall" className="px-4 py-2">
                                    Overall
                                </TabsTrigger>
                                <TabsTrigger value="detailed" className="px-4 py-2">
                                    Detailed
                                </TabsTrigger>
                                <TabsTrigger value="questions" className="px-4 py-2">
                                    Questions
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="overall" className="space-y-6">
                                <div className="text-center py-8">
                                    <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                                        <Progress
                                            value={scorePercentage}
                                            className="w-32 h-32 text-blue-600 rounded-full bg-gray-100"
                                        />
                                        <span className="absolute text-3xl font-bold text-gray-800">{scorePercentage}%</span>
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-3">
                                        {
                                            scorePercentage >= 80
                                                ? "Excellent Work!"
                                                : scorePercentage >= 60
                                                    ? "Good Job!"
                                                    : "Keep Practicing!"
                                        }
                                    </h3>
                                    <p className="text-gray-600 text-lg">
                                        You answered {correctCount} out of {questions.length} questions correctly.
                                    </p>
                                    <p className="text-gray-500 text-sm mt-2">This quiz cost you 5 credits.</p>
                                </div>
                                <div className="h-[350px] mt-8">
                                    <ChartContainer
                                        config={{
                                            percentage: {
                                                label: "Percentage Correct",
                                                color: "hsl(var(--chart-1))",
                                            },
                                        }}
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsBarChart data={categoryData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                                                <Tooltip content={<ChartTooltipContent />} />
                                                <Legend />
                                                <Bar
                                                    dataKey="percentage"
                                                    fill="hsl(var(--chart-1))"
                                                    name="Percentage Correct"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </RechartsBarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                            </TabsContent>
                            <TabsContent value="detailed">
                                <Table role="grid">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Question</TableHead>
                                            <TableHead>Result</TableHead>
                                            <TableHead className="hidden md:table-cell">Explanation</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {
                                            results.map((result, index) => (
                                                <TableRow key={result.question.id}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            {
                                                                result.isCorrect ? (
                                                                    <Check className="h-5 w-5 text-green-500 mr-2" />
                                                                ) : (
                                                                    <X className="h-5 w-5 text-red-500 mr-2" />
                                                                )
                                                            }
                                                            <span>{result.isCorrect ? "Correct" : "Incorrect"}</span>
                                                            {
                                                                flaggedQuestions.includes(result.question.id) && (
                                                                    <Flag className="h-4 w-4 text-red-500 ml-2" />
                                                                )
                                                            }
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {result.question.explanation || "No explanation available"}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </TabsContent>
                            <TabsContent value="questions">
                                <div className="md:hidden mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <Select
                                            value={selectedQuestionIndex.toString()}
                                            onValueChange={handleMobileQuestionSelect}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Select question" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    questions.map((_, index) => (
                                                        <SelectItem key={index} value={index.toString()}>
                                                            Question {index + 1}
                                                            {flaggedQuestions.includes(questions[index].id) && " (Flagged)"}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        <span className="text-sm font-medium bg-blue-600 text-white px-3 py-1 rounded-md">
                                            {selectedQuestionIndex + 1} / {questions.length}
                                        </span>
                                    </div>
                                </div>
                                <motion.div
                                    key={selectedQuestionIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <span
                                            className={`flex items-center justify-center w-10 h-10 rounded-full ${selectedResult.isCorrect ? "bg-green-500" : "bg-red-500"
                                                } text-white font-medium text-sm`}
                                        >
                                            {selectedQuestionIndex + 1}
                                        </span>
                                        <h3 className="text-xl font-semibold text-gray-800">{selectedQuestion.text}</h3>
                                        {
                                            flaggedQuestions.includes(selectedQuestion.id) && (
                                                <Flag className="h-5 w-5 text-red-500" />
                                            )
                                        }
                                    </div>
                                    <div className="space-y-3">
                                        {
                                            selectedQuestion.options.map((option) => {
                                                const isSelected = selectedResult.userSelectedIds.includes(option.id);
                                                const isCorrect = option.isCorrect;

                                                let className = "p-4 rounded-lg border ";

                                                if (isSelected && isCorrect) {
                                                    className += "bg-green-100 border-green-400";
                                                } else if (isSelected && !isCorrect) {
                                                    className += "bg-red-100 border-red-400";
                                                } else if (!isSelected && isCorrect) {
                                                    className += "bg-green-50 border-green-300";
                                                } else {
                                                    className += "bg-gray-50 border-gray-300";
                                                }

                                                return (
                                                    <div key={option.id} className={className}>
                                                        <div className="flex items-start">
                                                            <div className="flex-1 text-gray-800">{option.text}</div>
                                                            {isCorrect && <Check className="h-5 w-5 text-green-500 ml-3 flex-shrink-0" />}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                    {
                                        selectedQuestion.explanation && (
                                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                                                <p className="text-gray-700">{selectedQuestion.explanation}</p>
                                            </div>
                                        )
                                    }
                                </motion.div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}