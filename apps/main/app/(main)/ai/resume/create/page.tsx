import { redirect } from "next/navigation"

// The old resume creator page is now replaced by /ai/resume
// Users create resumes from the hub which auto-populates from their profile
export default function ResumeCreatePage() {
    redirect("/ai/resume")
}
