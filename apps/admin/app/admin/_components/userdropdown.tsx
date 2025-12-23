"use client"

import Link from "next/link";
import { useState } from "react";
import { 
    DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent 
} from "@/components/ui/dropdown-menu";
import { 
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash, Eye, Menu } from "lucide-react";
import { deleteUserById } from "@/actions/(admin)/admin/admin.action";

interface MenteeDropdownProps {
    id: string
}

export default function UserDropdownColumn({ id }: MenteeDropdownProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: any) => {
        e.preventDefault();
        setIsDialogOpen(true);
    }
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteUserById(id);
            if (result.success) {
                setIsDialogOpen(false);
            } else {
                throw new Error("Failed to delete user");
            }
        } catch (err: any) {
            console.log("Error deleting user: " + err);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">User actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem>
                    <Link href={`/admin/users/${id}`} className="flex items-center gap-2 w-full" prefetch={false}>
                        <Eye className="h-4 w-4" />
                        <p>View Details</p>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                    <div className="flex items-center gap-2 w-full" onClick={handleDeleteClick}>
                        <Trash className="h-4 w-4" />
                        <span>Delete</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Are you sure you want to delete?</DialogTitle>
                        <DialogDescription>This action is irreversible</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-between">
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>No</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Yes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </DropdownMenu>
    )
}