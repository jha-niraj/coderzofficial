import * as React from "react"
import { cn } from "../../lib/utils"

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				ref={ref}
				className={cn(
					`
						flex min-h-[96px] w-full
						rounded-xl border
						bg-white dark:bg-neutral-900
						border-gray-200 dark:border-neutral-700
						px-3 py-2 text-sm

						text-gray-900 dark:text-gray-100
						placeholder:text-gray-400 dark:placeholder:text-neutral-500

						transition-colors
						hover:bg-gray-50 dark:hover:bg-neutral-800

						focus:outline-none
						focus:ring-2
						focus:ring-ring
						focus:ring-offset-2

						disabled:cursor-not-allowed
						disabled:opacity-50
          			`,
					className
				)}
				{...props}
			/>
		)
	}
)
Textarea.displayName = "Textarea"

export { Textarea }