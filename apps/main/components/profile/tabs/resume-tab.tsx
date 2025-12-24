"use client";

import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    FileText, Download, Briefcase, GraduationCap, Award, Calendar,
    ExternalLink, Building, Eye
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ResumeTabProps {
    user: {
        id: string;
        resume: string | null;
        hasResume: boolean;
        university: string | null;
        experiences: Array<{
            id: string;
            companyName: string;
            companyLogo: string | null;
            roleTitle: string;
            description: string | null;
            startDate: Date;
            endDate: Date | null;
            isCurrentlyWorking: boolean;
            companyWebsite: string | null;
        }>;
        certifications: Array<{
            id: string;
            name: string;
            issuer: string;
            issuedDate: Date;
            link: string;
        }>;
    };
    isOwnProfile: boolean;
    onUploadResume?: () => void;
}

// Format date range
function formatDateRange(
    startDate: Date,
    endDate: Date | null,
    isCurrentlyWorking: boolean
): string {
    const start = new Date(startDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });

    if (isCurrentlyWorking) {
        return `${start} - Present`;
    }

    if (endDate) {
        const end = new Date(endDate).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });
        return `${start} - ${end}`;
    }

    return start;
}

// Calculate duration
function calculateDuration(
    startDate: Date,
    endDate: Date | null,
    isCurrentlyWorking: boolean
): string {
    const start = new Date(startDate);
    const end = isCurrentlyWorking || !endDate ? new Date() : new Date(endDate);

    const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
        return `${remainingMonths} mo${remainingMonths !== 1 ? "s" : ""}`;
    }

    if (remainingMonths === 0) {
        return `${years} yr${years !== 1 ? "s" : ""}`;
    }

    return `${years} yr${years !== 1 ? "s" : ""} ${remainingMonths} mo${remainingMonths !== 1 ? "s" : ""
        }`;
}

export function ResumeTab({
    user,
    isOwnProfile,
    onUploadResume,
}: ResumeTabProps) {
    const experiences = user.experiences || [];
    const certifications = user.certifications || [];

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                                    <FileText className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Resume</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {
                                            user.hasResume && user.resume
                                                ? "PDF document available"
                                                : "No resume uploaded yet"
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {
                                    user.hasResume && user.resume ? (
                                        <>
                                            <a href={user.resume} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </Button>
                                            </a>
                                            <a href={user.resume} download>
                                                <Button size="sm" className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600">
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </Button>
                                            </a>
                                        </>
                                    ) : isOwnProfile ? (
                                        <Button
                                            onClick={onUploadResume}
                                            className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Upload Resume
                                        </Button>
                                    ) : null
                                }
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-blue-500" />
                                Work Experience
                            </CardTitle>
                            {
                                isOwnProfile && (
                                    <Button variant="ghost" size="sm">
                                        Add Experience
                                    </Button>
                                )
                            }
                        </div>
                    </CardHeader>
                    <CardContent>
                        {
                            experiences.length > 0 ? (
                                <div className="relative">
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                                    <div className="space-y-6">
                                        {
                                            experiences.map((exp, index) => (
                                                <motion.div
                                                    key={exp.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="relative pl-14"
                                                >
                                                    <div className="absolute left-3 w-7 h-7 rounded-full bg-background border-2 border-border flex items-center justify-center overflow-hidden">
                                                        {
                                                            exp.companyLogo ? (
                                                                <Image
                                                                    src={exp.companyLogo}
                                                                    alt={exp.companyName}
                                                                    className="w-full h-full object-cover"
                                                                    height={28}
                                                                    width={28}
                                                                />
                                                            ) : (
                                                                <Building className="w-4 h-4 text-muted-foreground" />
                                                            )
                                                        }
                                                    </div>
                                                    <div className="pb-6 border-b last:border-0 last:pb-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold">{exp.roleTitle}</h4>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                                    <span className="font-medium text-foreground">
                                                                        {exp.companyName}
                                                                    </span>
                                                                    {
                                                                        exp.companyWebsite && (
                                                                            <Link
                                                                                href={exp.companyWebsite}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="hover:text-primary"
                                                                            >
                                                                                <ExternalLink className="w-3 h-3" />
                                                                            </Link>
                                                                        )
                                                                    }
                                                                </div>
                                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {
                                                                            formatDateRange(
                                                                                exp.startDate,
                                                                                exp.endDate,
                                                                                exp.isCurrentlyWorking
                                                                            )
                                                                        }
                                                                    </span>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {
                                                                            calculateDuration(
                                                                                exp.startDate,
                                                                                exp.endDate,
                                                                                exp.isCurrentlyWorking
                                                                            )
                                                                        }
                                                                    </Badge>
                                                                    {
                                                                        exp.isCurrentlyWorking && (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                                                                            >
                                                                                Current
                                                                            </Badge>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {
                                                            exp.description && (
                                                                <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line">
                                                                    {exp.description}
                                                                </p>
                                                            )
                                                        }
                                                    </div>
                                                </motion.div>
                                            ))
                                        }
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No work experience added yet</p>
                                    {
                                        isOwnProfile && (
                                            <Button variant="outline" size="sm" className="mt-3">
                                                Add your first experience
                                            </Button>
                                        )
                                    }
                                </div>
                            )
                        }
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-500" />
                            Education
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {
                            user.university ? (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{user.university}</h4>
                                        <p className="text-sm text-muted-foreground">University</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No education information added</p>
                                </div>
                            )
                        }
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Award className="w-5 h-5 text-yellow-500" />
                                Certifications
                            </CardTitle>
                            {
                                certifications.length > 0 && (
                                    <Badge variant="secondary">{certifications.length} total</Badge>
                                )
                            }
                        </div>
                    </CardHeader>
                    <CardContent>
                        {
                            certifications.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {
                                        certifications.map((cert, index) => (
                                            <motion.a
                                                key={cert.id}
                                                href={cert.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-sm transition-shadow group"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                    <Award className="w-6 h-6 text-yellow-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                                        {cert.name}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {cert.issuer} •{" "}
                                                        {
                                                            new Date(cert.issuedDate).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                year: "numeric",
                                                            })
                                                        }
                                                    </p>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </motion.a>
                                        ))
                                    }
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No certifications added yet</p>
                                    {
                                        isOwnProfile && (
                                            <Button variant="outline" size="sm" className="mt-3">
                                                Add certification
                                            </Button>
                                        )
                                    }
                                </div>
                            )
                        }
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}