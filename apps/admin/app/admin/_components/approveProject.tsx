"use client"

import { Button } from "@/components/ui/button";

interface ApproveButtonProps {
    projectId: string
}
export default function ApproveProject({ projectId } : ApproveButtonProps) {
    const handleProjectApprove = async() => {
        try {
            // const response = await approveProject(projectId);

             
        } catch(err: any) {
            console.log("Failed to approve the project");
        }
    }

    return (
        <Button onClick={handleProjectApprove}>
            Approve
        </Button>
    )
}