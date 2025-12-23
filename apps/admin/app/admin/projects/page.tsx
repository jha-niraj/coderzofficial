import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, ExternalLink, Github } from 'lucide-react'
import Link from "next/link"
import ApproveProject from "../_components/approveProject"

// Dummy data for 5 project submissions
const projects = [
    {
        id: "proj1",
        userId: "user1",
        projectId: "webApp1",
        githubUrl: "https://github.com/user1/webApp1",
        liveUrl: "https://webapp1.example.com",
        isSubmitted: true,
        isApproved: false,
        submissionDate: new Date("2023-05-15T10:30:00"),
        createdAt: new Date("2023-05-01T09:00:00"),
        updatedAt: new Date("2023-05-15T10:30:00"),
        user: { name: "Alice Johnson" }
    },
    {
        id: "proj2",
        userId: "user2",
        projectId: "mobileApp1",
        githubUrl: "https://github.com/user2/mobileApp1",
        liveUrl: null,
        isSubmitted: true,
        isApproved: false,
        submissionDate: new Date("2023-05-16T14:45:00"),
        createdAt: new Date("2023-05-02T11:00:00"),
        updatedAt: new Date("2023-05-16T14:45:00"),
        user: { name: "Bob Smith" }
    },
    {
        id: "proj3",
        userId: "user3",
        projectId: "dataViz1",
        githubUrl: "https://github.com/user3/dataViz1",
        liveUrl: "https://dataviz1.example.com",
        isSubmitted: true,
        isApproved: true,
        submissionDate: new Date("2023-05-14T09:15:00"),
        createdAt: new Date("2023-04-30T10:30:00"),
        updatedAt: new Date("2023-05-17T11:00:00"),
        user: { name: "Charlie Davis" }
    },
    {
        id: "proj4",
        userId: "user4",
        projectId: "aiModel1",
        githubUrl: "https://github.com/user4/aiModel1",
        liveUrl: "https://aimodel1.example.com",
        isSubmitted: true,
        isApproved: false,
        submissionDate: new Date("2023-05-17T16:20:00"),
        createdAt: new Date("2023-05-05T13:45:00"),
        updatedAt: new Date("2023-05-17T16:20:00"),
        user: { name: "Diana Wilson" }
    },
    {
        id: "proj5",
        userId: "user5",
        projectId: "gameEngine1",
        githubUrl: "https://github.com/user5/gameEngine1",
        liveUrl: null,
        isSubmitted: true,
        isApproved: false,
        submissionDate: new Date("2023-05-18T11:10:00"),
        createdAt: new Date("2023-05-07T15:30:00"),
        updatedAt: new Date("2023-05-18T11:10:00"),
        user: { name: "Ethan Brown" }
    }
]

export default async function AdminProjectsPage() {

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Project Submissions</h1>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S.N.</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Submitted By</TableHead>
                            <TableHead>Submission Date</TableHead>
                            <TableHead>GitHub</TableHead>
                            <TableHead>Live URL</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            projects && projects.map((project, index: number) => (
                                <TableRow key={project.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-medium">{project.projectId}</TableCell>
                                    <TableCell>{project.user.name}</TableCell>
                                    <TableCell>{project?.submissionDate?.toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {
                                            project.githubUrl && (
                                                <Link
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-blue-500 hover:underline"
                                                >
                                                    <Github className="w-4 h-4 mr-1" />
                                                    View
                                                </Link>
                                            )
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {
                                            project.liveUrl ? (
                                                <Link
                                                    href={project.liveUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-blue-500 hover:underline"
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-1" />
                                                    View
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {
                                            project.isApproved ? (
                                                <Badge variant="secondary" className="flex items-center w-fit">
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Approved
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="flex items-center w-fit">
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Pending
                                                </Badge>
                                            )
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {
                                            !project.isApproved && (
                                                <ApproveProject projectId={project?.id} />
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

