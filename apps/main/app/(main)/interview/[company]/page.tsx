"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Star, TrendingUp } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent } from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@repo/ui/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { companies, publicInterviews } from "@/app/(main)/interview/_components/mockdata"
import type { Company, Role } from "@/types/interview"

export default function CompanyPage() {
  const params = useParams()
  const companyId = params.company as string
  const company = companies.find((c) => c.id === companyId) as Company | undefined
  const [selectedRole, setSelectedRole] = useState<Role | null>(company?.roles[0] || null)
  const [showRoleSheet, setShowRoleSheet] = useState(false)
  const [selectedRoleForSheet, setSelectedRoleForSheet] = useState<Role | null>(null)

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Company not found</h1>
          <Link href="/interview/companies">
            <Button>Back to Companies</Button>
          </Link>
        </div>
      </div>
    )
  }

  const companyPublicInterviews = publicInterviews.filter((interview) => interview.companyId === companyId)

  const handleRoleSelect = (role: Role) => {
    setSelectedRoleForSheet(role)
    setShowRoleSheet(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/interview/companies" className="flex items-center gap-2">
            <ArrowLeft className="size-5" />
            <span className="font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2 font-bold">
            <span className="text-2xl">{company.logo}</span>
            <span>{company.name}</span>
          </div>
          <Link href={`/interview/${company.id}/myinterviews`}>
            <Button variant="outline">My Interviews</Button>
          </Link>
        </div>
      </header>

      <main className="container px-4 py-12 md:px-6 md:py-20">
        {/* Company Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{company.name} Interview Prep</h1>
          <p className="text-lg text-muted-foreground mb-8">{company.description}</p>

          {/* Role Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <span className="text-sm font-medium">Filter by role:</span>
            <Select
              value={selectedRole?.id || ""}
              onValueChange={(roleId) => {
                const role = company.roles.find((r) => r.id === roleId)
                if (role) setSelectedRole(role)
              }}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {company.roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Public Interviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Public Interview Experiences</h2>
            <p className="text-muted-foreground">See how others performed on this role. Learn from their experience.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companyPublicInterviews
              .filter((interview) => selectedRole && interview.roleId === selectedRole.id)
              .map((interview) => (
                <motion.div key={interview.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur hover:shadow-md transition-all">
                    <CardContent className="p-6 flex flex-col h-full gap-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{interview.userName}</h3>
                          <p className="text-sm text-muted-foreground">{interview.userSchool}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary">{interview.overallScore.toFixed(1)}</div>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              className={`size-4 ${i < Math.round(interview.overallScore / 20)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-muted-foreground"
                                }`}
                            />
                          ))}
                      </div>

                      <p className="text-sm text-muted-foreground flex-grow">{interview.feedback}</p>

                      <Link href={`/interview/${company.id}/${selectedRole?.id}`}>
                        <Button className="w-full bg-transparent" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>

          {companyPublicInterviews.filter((interview) => selectedRole && interview.roleId === selectedRole.id)
            .length === 0 && (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No public interviews yet for this role.</p>
                <p className="text-sm text-muted-foreground">Be the first to share your experience!</p>
              </div>
            )}
        </motion.div>

        {/* Available Roles Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Available Roles</h2>
            <p className="text-muted-foreground">Click on a role to see the interview process and start preparing.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {company.roles.map((role) => (
              <motion.div key={role.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card
                  className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => handleRoleSelect(role)}
                >
                  <CardContent className="p-6 flex flex-col h-full gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-2">{role.name}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <Badge variant="secondary">{role.level}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="size-4" />
                      <span className="text-sm">
                        {role.rounds.length} rounds • {role.totalDuration} min
                      </span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {role.rounds.map((round) => (
                        <Badge key={round.id} variant="outline" className="text-xs">
                          {round.type}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full mt-auto group-hover:bg-primary/90">View & Prepare</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Role Details Sheet */}
      <Sheet open={showRoleSheet} onOpenChange={setShowRoleSheet}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedRoleForSheet?.name}</SheetTitle>
            <SheetDescription>{selectedRoleForSheet?.description}</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Role Overview */}
            <div className="space-y-2">
              <h3 className="font-bold">Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="font-semibold capitalize">{selectedRoleForSheet?.level}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Duration</p>
                  <p className="font-semibold">{selectedRoleForSheet?.totalDuration} minutes</p>
                </div>
              </div>
            </div>

            {/* Rounds */}
            <div className="space-y-3">
              <h3 className="font-bold">Interview Rounds</h3>
              {selectedRoleForSheet?.rounds.map((round, index) => (
                <div key={round.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">
                        Round {index + 1}: {round.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {round.duration} minutes • {round.type}
                      </p>
                    </div>
                    <Badge variant="outline">{round.type}</Badge>
                  </div>
                  <p className="text-sm">{round.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Tips:</p>
                    <ul className="text-sm space-y-1">
                      {round.tips.map((tip, i) => (
                        <li key={i} className="text-muted-foreground">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Link href={`/interview/${company.id}/${selectedRoleForSheet?.id}`} className="flex-1">
                <Button className="w-full">View Full Details</Button>
              </Link>
              <Button variant="outline" className="flex-1 bg-transparent">
                Start Preparing
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}