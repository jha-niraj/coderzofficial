'use client'

import dynamic from 'next/dynamic'
import { cn } from '@repo/ui/lib/utils'

const CodeEditor = dynamic(() => import('@/components/main/code-editor'), { ssr: false })

export function CodeBlock({ code, language = 'typescript', className }: { code: string; language?: string; className?: string }) {
	return (
		<div className={cn("relative rounded-xl overflow-hidden", className)}>
			<CodeEditor
				code={code}
				language={language}
				readOnly={true}
				height="360px"
				showLanguageSelector={false}
				showCopyButton={true}
			/>
		</div>
	)
}