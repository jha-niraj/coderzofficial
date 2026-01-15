import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import { Users, ExternalLink, UserPlus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function SharedInterviewCard({
    title,
    description,
    role,
    level,
    author,
    onAccept
}: {
    title: string
    description?: string
    role: string
    level: string
    author: { name: string; image?: string }
    onAccept?: () => void
}) {
    return (
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800 my-2">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                            Peer Interview
                        </Badge>
                    </div>
                    <h4 className="font-semibold text-lg text-neutral-900 dark:text-white mb-1">
                        {title}
                    </h4>
                    {description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                            {description}
                        </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                        <Badge variant="outline">{role}</Badge>
                        <Badge variant="outline">{level}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden relative">
                                {author.image && (
                                    <Image src={author.image} alt={author.name} fill className="object-cover" />
                                )}
                            </div>
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {author.name}
                            </span>
                        </div>
                        {onAccept && (
                            <Button size="sm" className="gap-2" onClick={onAccept}>
                                <UserPlus className="w-4 h-4" />
                                Accept Request
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function SharedProjectCard({
    title,
    description,
    url,
    thumbnail,
    author
}: {
    title: string
    description?: string
    url?: string
    thumbnail?: string
    author: { name: string; image?: string }
}) {
    return (
        <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 my-2">
            {thumbnail && (
                <div className="aspect-video relative">
                    <Image src={thumbnail} alt={title} fill className="object-cover" />
                </div>
            )}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                        Project
                    </Badge>
                </div>
                <h4 className="font-semibold text-lg text-neutral-900 dark:text-white mb-1">
                    {title}
                </h4>
                {description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 block line-clamp-2">
                        {description}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden relative">
                            {author.image && (
                                <Image src={author.image} alt={author.name} fill className="object-cover" />
                            )}
                        </div>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {author.name}
                        </span>
                    </div>
                    {url && (
                        <Button asChild size="sm" variant="outline" className="gap-2">
                            <Link href={url} target="_blank">
                                <ExternalLink className="w-4 h-4" />
                                Visit
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}