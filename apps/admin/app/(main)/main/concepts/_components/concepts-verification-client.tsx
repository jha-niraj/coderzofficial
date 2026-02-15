"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
    Eye, Shield, XCircle, Clock, BookOpen, Coins, CheckCircle2
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
    DialogFooter
} from "@repo/ui/components/ui/dialog";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { 
    Alert, AlertDescription 
} from "@repo/ui/components/ui/alert";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@repo/ui/components/ui/table";
import toast from "@repo/ui/components/ui/sonner";
import { verifyConcept, rejectConcept } from "@/actions/main/concept.action";

interface Concept {
    id: string;
    slug: string;
    title: string;
    description: string;
    iconEmoji: string | null;
    pricingType: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    creator: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
        email: string | null;
    };
    _count: {
        steps: number;
    };
}

interface ConceptsVerificationClientProps {
    concepts: Concept[];
}

export default function ConceptsVerificationClient({
    concepts: initialConcepts,
}: ConceptsVerificationClientProps) {
    const [concepts, setConcepts] = useState(initialConcepts);
    const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleVerify = async () => {
        if (!selectedConcept) return;
        setIsVerifying(true);
        try {
            const result = await verifyConcept(selectedConcept.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Concept verified and published!");
                setConcepts(concepts.filter(c => c.id !== selectedConcept.id));
                setVerifyDialogOpen(false);
                setSelectedConcept(null);
            }
        } catch {
            toast.error("Failed to verify concept");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleReject = async () => {
        if (!selectedConcept) return;
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        setIsRejecting(true);
        try {
            const result = await rejectConcept(selectedConcept.id, rejectReason);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Concept rejected");
                setConcepts(concepts.filter(c => c.id !== selectedConcept.id));
                setRejectDialogOpen(false);
                setSelectedConcept(null);
                setRejectReason("");
            }
        } catch {
            toast.error("Failed to reject concept");
        } finally {
            setIsRejecting(false);
        }
    };

    if (concepts.length === 0) {
        return (
            <Card className="border-neutral-200 dark:border-neutral-800">
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                    <p className="text-muted-foreground text-center">
                        No concepts pending verification at the moment.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="border-neutral-200 dark:border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        Pending Verification ({concepts.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concept</TableHead>
                                <TableHead>Creator</TableHead>
                                <TableHead>Pricing</TableHead>
                                <TableHead>Steps</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                concepts.map((concept) => (
                                    <TableRow key={concept.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{concept.iconEmoji || "📚"}</span>
                                                <div>
                                                    <p className="font-medium">{concept.title}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                                                        {concept.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarImage src={concept.creator.image || undefined} />
                                                    <AvatarFallback className="text-xs">
                                                        {concept.creator.name?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {concept.creator.name || concept.creator.username}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {concept.creator.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {
                                                concept.pricingType === "PAID" ? (
                                                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                        <Coins className="w-3 h-3 mr-1" />
                                                        {concept.price} credits
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Free
                                                    </Badge>
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <BookOpen className="w-3.5 h-3.5" />
                                                {concept._count.steps}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(concept.updatedAt), { addSuffix: true })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`https://thecoderz.org/concepts/${concept.slug}`} target="_blank">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                    onClick={() => {
                                                        setSelectedConcept(concept);
                                                        setRejectDialogOpen(true);
                                                    }}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => {
                                                        setSelectedConcept(concept);
                                                        setVerifyDialogOpen(true);
                                                    }}
                                                >
                                                    <Shield className="w-4 h-4 mr-1" />
                                                    Verify
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-500" />
                            Verify Concept
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to verify and publish &ldquo;{selectedConcept?.title}&rdquo;?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <AlertDescription className="text-sm text-green-700 dark:text-green-300">
                                Once verified, this concept will be visible to all users
                                {selectedConcept?.pricingType === "PAID" && " and available for purchase"}.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleVerify}
                            disabled={isVerifying}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isVerifying ? "Verifying..." : "Verify & Publish"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            Reject Concept
                        </DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting &ldquo;{selectedConcept?.title}&rdquo;.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Enter the reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={isRejecting || !rejectReason.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isRejecting ? "Rejecting..." : "Reject Concept"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}