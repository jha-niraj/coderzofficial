"use client"

import { useState } from "react"
import {
    Building2, CheckCircle, XCircle, Clock, Eye, ExternalLink,
    Globe, Mail, Users, MapPin, Calendar, ArrowLeft
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, 
    DialogFooter
} from "@repo/ui/components/ui/dialog"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { toast } from "@repo/ui/components/ui/sonner"

interface PendingCompany {
    id: string
    name: string
    website: string
    email: string
    industry: string
    size: string
    location: string
    submittedAt: string
    adminName: string
    adminEmail: string
}

const mockPendingCompanies: PendingCompany[] = [
    {
        id: "1",
        name: "TechCorp Solutions",
        website: "https://techcorp.io",
        email: "hr@techcorp.io",
        industry: "Software Development",
        size: "51-200",
        location: "Bangalore, India",
        submittedAt: "2024-12-28T10:30:00Z",
        adminName: "Rajesh Kumar",
        adminEmail: "rajesh@techcorp.io"
    },
    {
        id: "2",
        name: "DataFlow Analytics",
        website: "https://dataflow.com",
        email: "careers@dataflow.com",
        industry: "Data Analytics",
        size: "11-50",
        location: "Mumbai, India",
        submittedAt: "2024-12-29T14:20:00Z",
        adminName: "Priya Sharma",
        adminEmail: "priya@dataflow.com"
    },
    {
        id: "3",
        name: "CloudNest Technologies",
        website: "https://cloudnest.tech",
        email: "jobs@cloudnest.tech",
        industry: "Cloud Services",
        size: "201-500",
        location: "Hyderabad, India",
        submittedAt: "2024-12-30T09:15:00Z",
        adminName: "Amit Patel",
        adminEmail: "amit@cloudnest.tech"
    },
]

interface CompanyCardProps {
    company: PendingCompany
    onApprove: (id: string) => void
    onReject: (id: string, reason: string) => void
}

function CompanyCard({ company, onApprove, onReject }: CompanyCardProps) {
    const [showDetails, setShowDetails] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [rejectReason, setRejectReason] = useState("")

    const handleReject = () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a rejection reason")
            return
        }
        onReject(company.id, rejectReason)
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
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white">{company.name}</h3>
                            <p className="text-sm text-neutral-500">{company.industry}</p>
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
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                            {company.website.replace("https://", "")}
                        </a>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{company.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Users className="w-4 h-4" />
                        <span>{company.size} employees</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{company.location}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Calendar className="w-3 h-3" />
                        <span>Submitted {new Date(company.submittedAt).toLocaleDateString()}</span>
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
                            onClick={() => onApprove(company.id)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700"
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
                            <Building2 className="w-5 h-5 text-emerald-600" />
                            {company.name}
                        </DialogTitle>
                        <DialogDescription>Company verification details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Website</p>
                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    {company.website} <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Industry</p>
                                <p className="text-sm text-neutral-900 dark:text-white">{company.industry}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Company Size</p>
                                <p className="text-sm text-neutral-900 dark:text-white">{company.size} employees</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Location</p>
                                <p className="text-sm text-neutral-900 dark:text-white">{company.location}</p>
                            </div>
                        </div>
                        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Admin Contact</p>
                            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                                <p className="font-medium text-neutral-900 dark:text-white">{company.adminName}</p>
                                <p className="text-sm text-neutral-500">{company.adminEmail}</p>
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
                        <DialogTitle className="text-red-600">Reject Company</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting {company.name}. This will be sent to the company admin.
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

export default function CompanyVerificationPage() {
    const [companies, setCompanies] = useState(mockPendingCompanies)

    const handleApprove = (id: string) => {
        setCompanies(prev => prev.filter(c => c.id !== id))
        toast.success("Company approved successfully")
    }

    const handleReject = (id: string, reason: string) => {
        setCompanies(prev => prev.filter(c => c.id !== id))
        toast.success("Company rejected", { description: `Reason: ${reason}` })
    }

    return (
        <div className="p-6 lg:p-8 w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link href="/hiring" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Hiring Platform
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-8 rounded-full bg-emerald-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Company Verification
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Review and verify pending company registrations
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <Clock className="w-5 h-5" />
                        <span className="text-2xl font-bold">{companies.length}</span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Pending Review</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-2xl font-bold">142</span>
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">Approved</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <XCircle className="w-5 h-5" />
                        <span className="text-2xl font-bold">8</span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">Rejected</p>
                </div>
            </div>

            {/* Pending Companies List */}
            {companies.length > 0 ? (
                <div className="space-y-4">
                    {companies.map(company => (
                        <CompanyCard
                            key={company.id}
                            company={company}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                        All caught up!
                    </h3>
                    <p className="text-neutral-500">
                        No pending company verifications at the moment.
                    </p>
                </div>
            )}
        </div>
    )
}
