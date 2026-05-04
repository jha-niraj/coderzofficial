import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@repo/ui/components/ui/sheet";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { useState, FormEvent, ReactNode } from "react";
import { toast } from "@repo/ui/components/ui/sonner";
import { createStudio } from "@/actions/(main)/studios/studio.actions";

type Studio = Awaited<ReturnType<typeof createStudio>>['studio'];
import { Loader2 } from "lucide-react";

interface CreateStudioSheetProps {
    spaceId?: string; // kept for API compatibility but no longer used
    // Controlled state (optional)
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    // Callback
    onSuccess?: (studio: Studio) => void;
    // Trigger
    trigger?: ReactNode;
}

export default function CreateStudioSheet({
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    onSuccess,
    trigger,
}: CreateStudioSheetProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    // Determine if component is controlled or uncontrolled
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = (newOpen: boolean) => {
        if (isControlled) {
            setControlledOpen?.(newOpen);
        } else {
            setUncontrolledOpen(newOpen);
        }
    };

    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        try {
            const result = await createStudio({ title, source: "manual" });
            if (result.error) {
                toast.error(result.error);
            } else if (result.studio) {
                toast.success("Studio created successfully");
                setOpen(false);
                setTitle("");
                onSuccess?.(result.studio);
            }
        } catch {
            toast.error("Failed to create studio");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Create Studio</SheetTitle>
                    <SheetDescription>
                        Create a new learning workspace in this space.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. React Fundamentals"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !title.trim()}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
