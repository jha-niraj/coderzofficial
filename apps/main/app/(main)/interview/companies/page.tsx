"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { companies } from "@/app/(main)/interview/_components/mockdata"

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // const filteredCompanies = companies.filter((company) =>
  //   company.name.toLowerCase().includes(searchQuery.toLowerCase()),
  // )

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
              C
            </div>
            <span>CodeEdge</span>
          </Link>
          <Link href="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </header>

      <main className="container px-4 py-12 md:px-6 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">All Companies</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Choose a company and explore their interview process. Pick a role and start preparing.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto w-full mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full h-12 text-base"
            />
          </div>
        </motion.div>

        {/* Companies Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {filteredCompanies.map((company) => (
            <motion.div key={company.id} variants={item}>
              <Link href={`/interview/${company.id}`}>
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group">
                  <CardContent className="p-6 flex flex-col h-full gap-4">
                    <div className="text-5xl">{company.logo}</div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg mb-2">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                      <span className="text-sm font-medium">
                        {company.roles.length} role{company.roles.length !== 1 ? "s" : ""}
                      </span>
                      <ArrowRight className="size-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No companies found.</p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        )}
      </main>
    </div>
  )
};