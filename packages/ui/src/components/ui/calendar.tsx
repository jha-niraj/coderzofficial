"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "../../lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
	onDayClick?: () => void
}

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	onDayClick,
	onSelect,
	mode,
	...props
}: CalendarProps) {
	const handleSelect = React.useCallback(
		(...args: Parameters<NonNullable<typeof onSelect>>) => {
			onSelect?.(...args)
			// Close popover after selection in single mode
			if (mode === "single") {
				onDayClick?.()
			}
		},
		[onSelect, onDayClick, mode]
	)

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn(
				"p-4 rounded-xl border border-border bg-popover shadow-lg",
				className
			)}
			captionLayout="dropdown"
			fromYear={1900}
			toYear={new Date().getFullYear() + 10}
			mode={mode}
			onSelect={handleSelect}
			classNames={{
				months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
				month: "space-y-4",
				caption: "flex justify-center pt-1 pb-4 relative items-center gap-2",
				caption_label: "hidden",
				caption_dropdowns: "flex gap-2 justify-center items-center",
				dropdown_month: "inline-flex items-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
				dropdown_year: "inline-flex items-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
				nav: "hidden",
				nav_button: "hidden",
				nav_button_previous: "hidden",
				nav_button_next: "hidden",
				table: "w-full border-collapse",
				head_row: "flex justify-between mb-2",
				head_cell:
					"text-muted-foreground w-9 h-9 flex items-center justify-center text-xs font-medium rounded-md",
				row: "flex w-full mt-1",
				cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day_outside)]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
				day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background aria-selected:opacity-100",
				day_range_end: "day-range-end",
				day_selected:
					"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md font-medium",
				day_today: "bg-accent/80 text-accent-foreground font-semibold rounded-md ring-2 ring-primary/20",
				day_outside:
					"text-muted-foreground/50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
				day_disabled: "text-muted-foreground/40 opacity-50 cursor-not-allowed line-through",
				day_range_middle:
					"aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
				day_hidden: "invisible",
				...classNames,
			}}
			{...props}
		/>
	)
}
Calendar.displayName = "Calendar"

export { Calendar }