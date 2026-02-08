"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight, BookOpen, School } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { useState } from "react"

export default function UniSchedulePage() {
    const [currentWeek, setCurrentWeek] = useState(0)

    // Placeholder schedule data
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const timeSlots = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

    const getWeekDates = () => {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay() + 1 + currentWeek * 7)
        
        return weekDays.map((_, index) => {
            const date = new Date(startOfWeek)
            date.setDate(startOfWeek.getDate() + index)
            return date
        })
    }

    const weekDates = getWeekDates()

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                                Schedule
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            Class Schedule
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            View your weekly class schedule
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl"
                            onClick={() => setCurrentWeek(currentWeek - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setCurrentWeek(0)}
                        >
                            Today
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl"
                            onClick={() => setCurrentWeek(currentWeek + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Week Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
            >
                {/* Days Header */}
                <div className="grid grid-cols-8 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="p-4 text-center border-r border-neutral-200 dark:border-neutral-800">
                        <span className="text-xs text-neutral-500">Time</span>
                    </div>
                    {weekDates.map((date, index) => {
                        const isToday = date.toDateString() === new Date().toDateString()
                        return (
                            <div
                                key={index}
                                className={`p-4 text-center border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 ${
                                    isToday ? "bg-violet-50 dark:bg-violet-900/20" : ""
                                }`}
                            >
                                <p className={`text-xs font-medium ${isToday ? "text-violet-600" : "text-neutral-500"}`}>
                                    {weekDays[index]}
                                </p>
                                <p className={`text-lg font-bold ${isToday ? "text-violet-600" : "text-neutral-900 dark:text-white"}`}>
                                    {date.getDate()}
                                </p>
                            </div>
                        )
                    })}
                </div>

                {/* Time Slots */}
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {timeSlots.map((time, timeIndex) => (
                        <div key={timeIndex} className="grid grid-cols-8">
                            <div className="p-4 text-center border-r border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                                <span className="text-xs text-neutral-500">{time}</span>
                            </div>
                            {weekDays.map((_, dayIndex) => {
                                const isToday = weekDates[dayIndex].toDateString() === new Date().toDateString()
                                return (
                                    <div
                                        key={dayIndex}
                                        className={`min-h-[60px] p-2 border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 ${
                                            isToday ? "bg-violet-50/50 dark:bg-violet-900/10" : ""
                                        }`}
                                    >
                                        {/* Placeholder for schedule items */}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* No Classes Message */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-12 mt-8"
            >
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                    <School className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">No Classes Scheduled</h3>
                <p className="text-sm text-neutral-500 max-w-md mx-auto">
                    Your class schedule will appear here once your university sets up the timetable.
                </p>
            </motion.div>

            {/* Legend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mt-8"
            >
                <h3 className="font-bold text-neutral-900 dark:text-white mb-4">Schedule Legend</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-violet-500" />
                        <span className="text-sm text-neutral-500">Lecture</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500" />
                        <span className="text-sm text-neutral-500">Lab</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500" />
                        <span className="text-sm text-neutral-500">Tutorial</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-amber-500" />
                        <span className="text-sm text-neutral-500">Workshop</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
