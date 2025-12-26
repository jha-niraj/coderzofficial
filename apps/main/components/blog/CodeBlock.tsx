'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { cn } from '@repo/ui/lib/utils'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export function CodeBlock({ code, language = 'typescript', className }: { code: string; language?: string; className?: string }) {
	const [copied, setCopied] = useState(false)
	return (
		<div className={cn("relative rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden", className)}>
			<div className="absolute right-3 top-3 z-10">
				<Button
					variant="outline"
					size="sm"
					onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200) }}
					className="h-8 text-xs"
				>
					{copied ? 'Copied' : 'Copy'}
				</Button>
			</div>
			<div className="h-[360px]">
				<MonacoEditor
					height="100%"
					defaultLanguage={language}
					value={code}
					options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', theme: 'vs-dark' }}
				/>
			</div>
		</div>
	)
}