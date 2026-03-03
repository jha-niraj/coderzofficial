"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

interface EducationTabProps {
    user: {
        university?: string | null
        educations?: Array<{
            id: string
            degree?: string | null
            institution: string
            startDate: Date
            endDate?: Date | null
            bulletPoints?: string[]
        }>
    }
    isOwnProfile: boolean
}

export function EducationTab({ user, isOwnProfile }: EducationTabProps) {
    const educations = user.educations ?? []

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-purple-500" />
                                Education
                            </CardTitle>
                            {isOwnProfile && (
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/ai/resume/create">Edit in Resume Creator</Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {educations.length > 0 ? (
                            <div className="space-y-6">
                                {educations.map((edu) => (
                                    <div key={edu.id} className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                            <GraduationCap className="w-6 h-6 text-purple-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">
                                                {edu.degree ? `${edu.degree}, ` : ""}
                                                {edu.institution}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(edu.startDate)} -{" "}
                                                {edu.endDate ? formatDate(edu.endDate) : "Present"}
                                            </p>
                                            {edu.bulletPoints && edu.bulletPoints.length > 0 && (
                                                <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
                                                    {edu.bulletPoints.map((point, i) => (
                                                        <li key={i}>{point}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No education added yet</p>
                                {user.university && (
                                    <p className="text-sm mt-2">Legacy: {user.university}</p>
                                )}
                                {isOwnProfile && (
                                    <Button variant="outline" size="sm" className="mt-3" asChild>
                                        <Link href="/ai/resume/create">Add education in Resume Creator</Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
