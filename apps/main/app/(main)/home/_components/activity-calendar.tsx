"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { CalendarDays, Flame } from "lucide-react";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@repo/ui/components/ui/tooltip";

interface ActivityData {
    date: Date;
    totalXp: number;
    activitiesCount: number;
}

interface ActivityCalendarProps {
    data: ActivityData[];
}

export default function ActivityCalendar({ data }: ActivityCalendarProps) {
    // Generate last 365 days
    const calendarData = useMemo(() => {
        const days: { date: Date; xp: number; count: number }[] = [];
        const today = new Date();
        const dataMap = new Map(
            data.map((d) => [new Date(d.date).toDateString(), d])
        );

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const activity = dataMap.get(date.toDateString());
            days.push({
                date,
                xp: activity?.totalXp || 0,
                count: activity?.activitiesCount || 0,
            });
        }

        return days;
    }, [data]);

    // Calculate contribution level (0-4)
    const getLevel = (xp: number): number => {
        if (xp === 0) return 0;
        if (xp < 50) return 1;
        if (xp < 100) return 2;
        if (xp < 200) return 3;
        return 4;
    };

    const getLevelColor = (level: number): string => {
        switch (level) {
            case 0:
                return "bg-muted";
            case 1:
                return "bg-green-200 dark:bg-green-900";
            case 2:
                return "bg-green-400 dark:bg-green-700";
            case 3:
                return "bg-green-500 dark:bg-green-500";
            case 4:
                return "bg-green-600 dark:bg-green-400";
            default:
                return "bg-muted";
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Calculate streak
    const currentStreak = useMemo(() => {
        let streak = 0;
        for (let i = calendarData.length - 1; i >= 0; i--) {
            const day = calendarData[i];
            if (day && day.xp > 0) {
                streak++;
            } else if (i < calendarData.length - 1) {
                // Allow today to be empty, break on past empty days
                break;
            }
        }
        return streak;
    }, [calendarData]);

    // Group by weeks (52-53 weeks)
    const weeks = useMemo(() => {
        const result: typeof calendarData[] = [];
        let currentWeek: typeof calendarData = [];

        // Pad the beginning to align with week start
        const firstDayData = calendarData[0];
        const firstDay = firstDayData ? firstDayData.date.getDay() : 0;
        for (let i = 0; i < firstDay; i++) {
            currentWeek.push({ date: new Date(0), xp: -1, count: 0 });
        }

        calendarData.forEach((day) => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                result.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            result.push(currentWeek);
        }

        return result;
    }, [calendarData]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <Card className="border-primary/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <CalendarDays className="h-4 w-4 text-green-500" />
                        </div>
                        <CardTitle className="text-lg">Activity</CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">{currentStreak}</span>
                        <span className="text-muted-foreground">day streak</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <TooltipProvider delayDuration={100}>
                    <div className="overflow-x-auto pb-2">
                        <div className="flex gap-[3px] mb-1 ml-4 text-[10px] text-muted-foreground">
                            {
                                weeks.map((week, weekIndex) => {
                                    const firstValidDay = week.find((d) => d.xp !== -1);
                                    if (
                                        firstValidDay &&
                                        firstValidDay.date.getDate() <= 7 &&
                                        weekIndex % 4 === 0
                                    ) {
                                        return (
                                            <span key={weekIndex} className="w-[10px]">
                                                {months[firstValidDay.date.getMonth()]}
                                            </span>
                                        );
                                    }
                                    return <span key={weekIndex} className="w-[10px]" />;
                                })
                            }
                        </div>
                        <div className="flex gap-[3px]">
                            <div className="flex flex-col gap-[3px] text-[10px] text-muted-foreground pr-1">
                                <span className="h-[10px]"></span>
                                <span className="h-[10px] leading-[10px]">Mon</span>
                                <span className="h-[10px]"></span>
                                <span className="h-[10px] leading-[10px]">Wed</span>
                                <span className="h-[10px]"></span>
                                <span className="h-[10px] leading-[10px]">Fri</span>
                                <span className="h-[10px]"></span>
                            </div>
                            {
                                weeks.map((week, weekIndex) => (
                                    <div key={weekIndex} className="flex flex-col gap-[3px]">
                                        {
                                            week.map((day, dayIndex) => {
                                                if (day.xp === -1) {
                                                    return (
                                                        <div
                                                            key={dayIndex}
                                                            className="w-[10px] h-[10px]"
                                                        />
                                                    );
                                                }

                                                const level = getLevel(day.xp);
                                                return (
                                                    <Tooltip key={dayIndex}>
                                                        <TooltipTrigger asChild>
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{
                                                                    delay:
                                                                        (weekIndex * 7 + dayIndex) * 0.001,
                                                                }}
                                                                className={`w-[10px] h-[10px] rounded-sm ${getLevelColor(
                                                                    level
                                                                )} cursor-pointer transition-transform hover:scale-125`}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs">
                                                            <p className="font-medium">
                                                                {formatDate(day.date)}
                                                            </p>
                                                            <p className="text-muted-foreground">
                                                                {day.xp > 0
                                                                    ? `${day.xp} XP • ${day.count} activities`
                                                                    : "No activity"}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })
                                        }
                                    </div>
                                ))
                            }
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-muted-foreground">
                            <span>Less</span>
                            {
                                [0, 1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={`w-[10px] h-[10px] rounded-sm ${getLevelColor(
                                            level
                                        )}`}
                                    />
                                ))
                            }
                            <span>More</span>
                        </div>
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}