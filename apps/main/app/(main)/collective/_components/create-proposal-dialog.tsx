"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Badge } from "@repo/ui/components/ui/badge";
import { X, Plus, Lightbulb, Users, Calendar } from "lucide-react";
import { createProposal } from "@/actions/(main)/collective/proposal.actions";
import { toast } from "sonner";

interface CreateProposalDialogProps {
  children: React.ReactNode;
}

export function CreateProposalDialog({ children }: CreateProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // Add tags to form data
      formData.set("tags", tags.join(","));
      
      await createProposal(formData);
      toast.success("Proposal created successfully! Redirecting to voting page...");
      setOpen(false);
      
      // Reset form
      setTags([]);
      setTagInput("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Propose a New Challenge
          </DialogTitle>
          <DialogDescription>
            Share your learning challenge idea with the community. If it gets enough votes, 
            we'll turn it into an official challenge!
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Challenge Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., React in 30 Days, Master Python Fundamentals"
              required
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Make it catchy and descriptive!
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what participants will learn, the goals, and why this challenge would be valuable..."
              required
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Playlist URL */}
          <div className="space-y-2">
            <Label htmlFor="playlistUrl">Learning Resource URL</Label>
            <Input
              id="playlistUrl"
              name="playlistUrl"
              type="url"
              placeholder="https://youtube.com/playlist?list=... or course URL"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Link to YouTube playlist, course, or learning resource
            </p>
          </div>

          {/* Estimated Days */}
          <div className="space-y-2">
            <Label htmlFor="estimatedDays">Estimated Duration (Days)</Label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                id="estimatedDays"
                name="estimatedDays"
                type="number"
                min="1"
                max="365"
                defaultValue="30"
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (up to 5)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags like React, Beginner, Frontend..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                disabled={tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 5}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or click + to add tags. Help others discover your proposal!
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium text-blue-900">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your proposal will be open for community voting for 7 days</li>
                  <li>• Community members can vote, comment, and suggest improvements</li>
                  <li>• Top-voted proposals are reviewed by our team</li>
                  <li>• Approved proposals become official challenges with rewards!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Proposal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}






