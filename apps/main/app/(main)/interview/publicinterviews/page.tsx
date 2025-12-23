"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { publicInterviews, companies } from "@/app/(main)/interview/_components/mockdata"
import type { Company, Role } from "@/types/interview"

export default function PublicInterviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInterview, setSelectedInterview] = useState<any>(null)
  const [showPracticeDialog, setShowPracticeDialog] = useState(false)

  const filteredInterviews = useMemo(() => {
    if (!searchQuery) return publicInterviews

    return publicInterviews.filter((interview) => {
      const company = companies.find((c) => c.id === interview.companyId)
      return company?.name.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [searchQuery])

  const topCompanies = Array.from(new Set(publicInterviews.map((i) => i.companyId)))
    .map((companyId) => companies.find((c) => c.id === companyId))
    .filter(Boolean)
    .slice(0, 5)

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || "Unknown"
  }

  const getCompanyLogo = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.logo || "🏢"
  }

  const getRoleName = (companyId: string, roleId: string) => {
    const company = companies.find((c: Company) => c.id === companyId)
    return company?.roles.find((r: Role) => r.id === roleId)?.name || "Unknown Role"
  }

  const handlePracticeClick = (interview: any) => {
    setSelectedInterview(interview)
    setShowPracticeDialog(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold hover:opacity-80 transition-opacity">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
              C
            </div>
            <span>CodeEdge</span>
          </Link>
          <nav className="flex gap-6 items-center">
            <Link
              href="/interview/companies"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Companies
            </Link>
            <Link href="/interview/public" className="text-sm font-medium text-foreground">
              Public Interviews
            </Link>
            <Link
              href="/interview/google/myinterviews"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Interviews
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-16 border-b border-border">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Public Interview Experiences</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Learn from real interview experiences shared by the community. Practice with proven strategies and get
                inspired.
              </p>

              {/* Company Access Section */}
              <div className="bg-muted/50 border border-border rounded-lg p-6 mb-8">
                <h3 className="font-semibold mb-4">Want to see all public interviews for a specific company?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Visit the company page to see all public interview experiences, leaderboards, and role-specific
                  details.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {topCompanies.map((company) => (
                    <Link key={company?.id} href={`/interview/${company?.id}`}>
                      <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                        {company?.name}
                        <ArrowRight className="ml-2 size-3" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by company name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full h-12 text-base"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Public Interviews Grid */}
        <section className="w-full py-12 md:py-16">
          <div className="container px-4 md:px-6">
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No interviews found for "{searchQuery}"</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredInterviews.map((interview, index) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-lg hover:border-primary/50 hover:scale-105">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Header with Company and Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{getCompanyLogo(interview.companyId)}</div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {getCompanyName(interview.companyId)}
                              </p>
                              <p className="text-sm font-semibold text-foreground">
                                {getRoleName(interview.companyId, interview.roleId)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="rounded-full whitespace-nowrap">
                            Public
                          </Badge>
                        </div>

                        {/* Creator Info */}
                        <div className="mb-4 pb-4 border-b border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">Created by</p>
                          <p className="font-semibold text-foreground">{interview.userName}</p>
                          <p className="text-xs text-muted-foreground">{interview.userSchool}</p>
                        </div>

                        {/* Feedback */}
                        <p className="text-sm text-muted-foreground mb-6 flex-grow italic">"{interview.feedback}"</p>

                        {/* Date */}
                        <p className="text-xs text-muted-foreground mb-4">
                          {new Date(interview.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>

                        {/* Practice Button */}
                        <Button
                          onClick={() => handlePracticeClick(interview)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Zap className="size-4 mr-2" />
                          Practice This
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Practice Dialog */}
      <AlertDialog open={showPracticeDialog} onOpenChange={setShowPracticeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Practicing</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <div>
                <p className="font-semibold text-foreground mb-2">
                  {selectedInterview && getCompanyName(selectedInterview.companyId)} -{" "}
                  {selectedInterview && getRoleName(selectedInterview.companyId, selectedInterview.roleId)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Created by <span className="font-medium text-foreground">{selectedInterview?.userName}</span>
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Interview Type</p>
                <p className="text-sm text-muted-foreground">Public Interview Experience</p>
              </div>

              <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Zap className="size-4 text-primary" />
                  Cost: 25 Credits
                </p>
                <p className="text-xs text-muted-foreground">
                  Access this public interview experience and learn from the creator's approach
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/purchase">
                <Button className="w-full">Get Credits & Practice</Button>
              </Link>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
};