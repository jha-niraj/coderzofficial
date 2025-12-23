export interface InterviewRound {
  id: string
  name: string
  type: "call" | "coding" | "dsa" | "system-design" | "hr"
  duration: number // in minutes
  description: string
  tips: string[]
}

export interface Role {
  id: string
  name: string
  level: "junior" | "mid" | "senior"
  description: string
  rounds: InterviewRound[]
  totalDuration: number
}

export interface Company {
  id: string
  name: string
  logo: string
  description: string
  roles: Role[]
}

export interface PublicInterview {
  id: string
  companyId: string
  roleId: string
  userId: string
  userName: string
  userSchool: string
  scores: {
    [roundId: string]: number
  }
  overallScore: number
  feedback: string
  createdAt: Date
  isPublic: boolean
}

export interface UserInterview {
  id: string
  companyId: string
  roleId: string
  userId: string
  type: "private" | "public"
  completedRounds: string[]
  currentRound: string | null
  scores: {
    [roundId: string]: number
  }
  overallScore: number | null
  startedAt: Date
  completedAt: Date | null
  status: "in-progress" | "completed"
}