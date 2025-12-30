"use client"

import { useState } from "react"
import {
    GraduationCap, CheckCircle, XCircle, Clock, Eye, ExternalLink,
    Globe, Mail, Users, MapPin, Calendar, ArrowLeft, Building2
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@repo/ui/components/ui/dialog"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { toast } from "@repo/ui/components/ui/sonner"

interface PendingUniversity {
    id: string
    name: string
    website: string
    emailDomain: string
    universityType: string
    city: string
    state: string
    submittedAt: string
    adminName: string
    adminEmail: string
    adminRole: string
    departments: string[]
    estimatedStudents: string
}

const mockPendingUniversities: PendingUniversity[] = [
    {
        id: "1",
        name: "Delhi Technical University",
        website: "https://dtu.ac.in",
        emailDomain: "dtu.ac.in",
        universityType: "Public University",
        city: "Delhi",
        state: "Delhi",
        submittedAt: "2024-12-28T10:30:00Z",
        adminName: "Dr. Rajesh Sharma",
        adminEmail: "dr.sharma@dtu.ac.in",
        adminRole: "Dean",
        departments: ["Computer Science", "Information Technology", "Electronics"],
        estimatedStudents: "5,000-10,000"
    },
    {
        id: "2",
        name: "Birla Institute of Technology",
        website: "https://bitmesra.ac.in",
        emailDomain: "bitmesra.ac.in",
        universityType: "Deemed University",
        city: "Ranchi",
        state: "Jharkhand",
        submittedAt: "2024-12-29T14:20:00Z",
        adminName: "Prof. Suman Das",
        adminEmail: "suman.das@bitmesra.ac.in",
        adminRole: "HOD",
        departments: ["Computer Science", "Software Engineering"],
        estimatedStudents: "1,000-5,000"
    },
    {
        id: "3",
        name: "Symbiosis International University",
        website: "https://siu.edu.in",
        emailDomain: "siu.edu.in",
        universityType: "Private University",
        city: "Pune",
        state: "Maharashtra",
        submittedAt: "2024-12-30T09:15:00Z",
        adminName: "Dr. Priya Kulkarni",
        adminEmail: "priya.kulkarni@siu.edu.in",
        adminRole: "Placement Head / TPO",
        departments: ["Computer Science", "Data Science", "Artificial Intelligence"],
        estimatedStudents: "10,000+"
    },
]

interface UniversityCardProps {
    university: PendingUniversity
    onApprove: (id: string) => void
    onReject: (id: string, reason: string) => void
}

function UniversityCard({ university, onApprove, onReject }: UniversityCardProps) {
    const [showDetails, setShowDetails] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [rejectReason, setRejectReason] = useState("")

    const handleReject = () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a rejection reason")
            return
        }
        onReject(university.id, rejectReason)
        setShowRejectDialog(false)
        setRejectReason("")
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white">{university.name}</h3>
                            <p className="text-sm text-neutral-500">{university.universityType}</p>
                        </div>
                    </div>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Globe className="w-4 h-4" />
                        <a href={university.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                            {university.website.replace("https://", "")}
                        </a>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">@{university.emailDomain}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Users className="w-4 h-4" />
                        <span>{university.estimatedStudents} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{university.city}, {university.state}</span>
                    </div>
                </div>

                {/* Departments */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {university.departments.map((dept, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-xs">
                            {dept}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Calendar className="w-3 h-3" />
                        <span>Submitted {new Date(university.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDetails(true)}
                            className="text-xs"
                        >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRejectDialog(true)}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onApprove(university.id)}
                            className="text-xs bg-violet-600 hover:bg-violet-700"
                        >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Details Dialog */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-violet-600" />
                            {university.name}
                        </DialogTitle>
                        <DialogDescription>University verification details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Website</p>
                                <a href={university.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    {university.website} <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Type</p>
                                <p className="text-sm text-neutral-900 dark:text-white">{university.universityType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Email Domain</p>
                                <p className="text-sm text-neutral-900 dark:text-white font-mono">@{university.emailDomain}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Location</p>
                                <p className="text-sm text-neutral-900 dark:text-white">{university.city}, {university.state}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Est. Students</p>
                                <p className="text-sm text-neutral-900 dark:text-white">{university.estimatedStudents}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Departments</p>
                            <div className="flex flex-wrap gap-2">
                                {university.departments.map((dept, idx) => (
                                    <span key={idx} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-xs">
                                        <Building2 className="w-3 h-3" />
                                        {dept}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Admin Contact</p>
                            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                                <p className="font-medium text-neutral-900 dark:text-white">{university.adminName}</p>
                                <p className="text-sm text-neutral-500">{university.adminEmail}</p>
                                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs">
                                    {university.adminRole}
                                </span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Reject University</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting {university.name}. This will be sent to the university admin.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Enter rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
                        <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default function UniversityVerificationPage() {
    const [universities, setUniversities] = useState(mockPendingUniversities)

    const handleApprove = (id: string) => {
        setUniversities(prev => prev.filter(u => u.id !== id))
        toast.success("University approved successfully")
    }

    const handleReject = (id: string, reason: string) => {
        setUniversities(prev => prev.filter(u => u.id !== id))
        toast.success("University rejected", { description: `Reason: ${reason}` })
    }

    return (
        <div className="p-6 lg:p-8 w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link href="/uni" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to University Platform
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-8 rounded-full bg-violet-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            University Verification
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Review and verify pending university registrations
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <Clock className="w-5 h-5" />
                        <span className="text-2xl font-bold">{universities.length}</span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Pending Review</p>
                </div>
                <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800">
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-2xl font-bold">22</span>
                    </div>
                    <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">Approved</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <XCircle className="w-5 h-5" />
                        <span className="text-2xl font-bold">2</span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">Rejected</p>
                </div>
            </div>

            {/* Pending Universities List */}
            {universities.length > 0 ? (
                <div className="space-y-4">
                    {universities.map(university => (
                        <UniversityCard
                            key={university.id}
                            university={university}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <CheckCircle className="w-12 h-12 text-violet-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                        All caught up!
                    </h3>
                    <p className="text-neutral-500">
                        No pending university verifications at the moment.
                    </p>
                </div>
            )}
        </div>
    )
}
