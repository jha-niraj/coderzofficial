'use client'

import {
    Sheet, SheetContent, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import { ResumeCreatorTabs } from '@/app/(main)/ai/resume/_components/resume-creator-tabs'

export type ProfileEditSection = 'experience' | 'projects' | 'education' | 'skills' | 'socials'

const SECTION_TITLES: Record<ProfileEditSection, string> = {
    experience: 'Work Experience',
    projects: 'Portfolio Projects',
    education: 'Education',
    skills: 'Skills',
    socials: 'Social Links',
}

// Tab IDs match what ResumeCreatorTabs uses internally
const SECTION_TO_TAB: Record<ProfileEditSection, string> = {
    experience: 'experience',
    projects: 'projects',
    education: 'education',
    skills: 'skills',
    socials: 'socials',
}

interface Props {
    open: boolean
    section: ProfileEditSection | null
    onClose: () => void
    onSaved: () => void
}

export function ProfileDataEditSheet({ open, section, onClose, onSaved }: Props) {
    if (!section) return null

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                    <SheetTitle className="text-lg">{SECTION_TITLES[section]}</SheetTitle>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        Changes here update your profile and will be picked up next time you create a resume.
                    </p>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                    <ResumeCreatorTabs
                        defaultTab={SECTION_TO_TAB[section]}
                        onSaved={onSaved}
                        compact
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}
