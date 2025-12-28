"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Label } from "@repo/ui/components/ui/label";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs";
import {
    User, Camera, Briefcase, MapPin, Globe, Loader2, Check, ImageIcon, Sparkles
} from "lucide-react";
import toast from "@repo/ui/components/ui/sonner";
import { useUserStore } from "@/app/store/useUserStore";
import { updateProfileSettings } from "@/actions/(main)/user/profile.action";
import Image from "next/image";
import { cn } from "@repo/ui/lib/utils";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
        bio: string | null;
        location: string | null;
        company: string | null;
        occupation: string | null;
        website: string | null;
        userProfile?: {
            coverImage: string | null;
            coverGradient: string | null;
            tagline: string | null;
            theme: string;
        } | null;
    };
    onUpdate?: () => void;
}

// Theme options
const THEME_OPTIONS = [
    { id: "OCEAN_BLUE", name: "Ocean Blue", gradient: "from-blue-600 via-cyan-500 to-teal-400" },
    { id: "SUNSET_ORANGE", name: "Sunset", gradient: "from-orange-500 via-amber-500 to-yellow-400" },
    { id: "FOREST_GREEN", name: "Forest", gradient: "from-emerald-600 via-green-500 to-lime-400" },
    { id: "PURPLE_DREAM", name: "Purple Dream", gradient: "from-purple-600 via-violet-500 to-pink-400" },
    { id: "DARK_MODE", name: "Dark", gradient: "from-gray-800 via-gray-700 to-gray-600" },
];

export function EditProfileModal({
    isOpen,
    onClose,
    user,
    onUpdate,
}: EditProfileModalProps) {
    const { updateUser } = useUserStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: user.name || "",
        bio: user.bio || "",
        tagline: user.userProfile?.tagline || "",
        location: user.location || "",
        company: user.company || "",
        occupation: user.occupation || "",
        website: user.website || "",
        theme: user.userProfile?.theme || "OCEAN_BLUE",
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Update basic profile info via store
            await updateUser({
                name: formData.name,
                bio: formData.bio,
                location: formData.location,
                company: formData.company,
                occupation: formData.occupation,
                website: formData.website,
            });

            // Update profile settings (tagline, theme)
            const profileResult = await updateProfileSettings({
                tagline: formData.tagline,
                theme: formData.theme as "OCEAN_BLUE" | "SUNSET_ORANGE" | "FOREST_GREEN" | "PURPLE_DREAM" | "DARK_MODE",
            });

            if (!profileResult.success) {
                throw new Error(profileResult.error);
            }

            toast.success("Profile updated successfully!");
            onUpdate?.();
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Edit Profile
                    </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full justify-start px-6 pt-2 bg-transparent border-b rounded-none h-auto gap-4">
                            <TabsTrigger
                                value="basic"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                            >
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="appearance"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                            >
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger
                                value="work"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
                            >
                                Work & Education
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="basic" className="px-6 py-4 space-y-5 mt-0">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-background shadow-lg">
                                        <Image
                                            src={user.image || "/default-avatar.png"}
                                            alt="Avatar"
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="secondary"
                                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full shadow-md"
                                        onClick={() => avatarInputRef.current?.click()}
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                    </Button>
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={() => toast.info("Avatar upload coming soon!")}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{user.name || "Your Name"}</h3>
                                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Your display name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tagline" className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Tagline
                                </Label>
                                <Input
                                    id="tagline"
                                    value={formData.tagline}
                                    onChange={(e) => handleChange("tagline", e.target.value)}
                                    placeholder="A short tagline that appears below your name"
                                    maxLength={100}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {formData.tagline.length}/100 characters
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => handleChange("bio", e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {formData.bio.length}/500 characters
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location" className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => handleChange("location", e.target.value)}
                                    placeholder="City, Country"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website" className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Website
                                </Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleChange("website", e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="appearance" className="px-6 py-4 space-y-5 mt-0">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Cover Image
                                </Label>
                                <div
                                    className={cn(
                                        "relative h-32 rounded-lg overflow-hidden cursor-pointer group",
                                        `bg-gradient-to-r ${THEME_OPTIONS.find((t) => t.id === formData.theme)?.gradient}`
                                    )}
                                    onClick={() => coverInputRef.current?.click()}
                                >
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="text-white text-sm flex items-center gap-2">
                                            <Camera className="w-5 h-5" />
                                            Upload Cover
                                        </div>
                                    </div>
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={() => toast.info("Cover upload coming soon!")}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label>Profile Theme</Label>
                                <div className="grid grid-cols-5 gap-3">
                                    {
                                        THEME_OPTIONS.map((theme) => (
                                            <motion.button
                                                key={theme.id}
                                                type="button"
                                                onClick={() => handleChange("theme", theme.id)}
                                                className={cn(
                                                    "relative h-16 rounded-lg overflow-hidden transition-all",
                                                    `bg-gradient-to-r ${theme.gradient}`,
                                                    formData.theme === theme.id
                                                        ? "ring-2 ring-primary ring-offset-2"
                                                        : "hover:scale-105"
                                                )}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {
                                                    formData.theme === theme.id && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                            <Check className="w-5 h-5 text-white" />
                                                        </div>
                                                    )
                                                }
                                            </motion.button>
                                        ))
                                    }
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Selected: {THEME_OPTIONS.find((t) => t.id === formData.theme)?.name}
                                </p>
                            </div>
                        </TabsContent>
                        <TabsContent value="work" className="px-6 py-4 space-y-5 mt-0">
                            <div className="space-y-2">
                                <Label htmlFor="occupation" className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Job Title / Role
                                </Label>
                                <Input
                                    id="occupation"
                                    value={formData.occupation}
                                    onChange={(e) => handleChange("occupation", e.target.value)}
                                    placeholder="e.g. Full Stack Developer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company">Company / Organization</Label>
                                <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={(e) => handleChange("company", e.target.value)}
                                    placeholder="Where do you work?"
                                />
                            </div>
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    To add detailed work experience and education, visit the Resume tab on your profile.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {
                            isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}