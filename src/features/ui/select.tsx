import { forwardRef } from "react"

import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  preventEmpty?: boolean
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, options, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-full w-full cursor-pointer rounded-md border-2 px-3 py-2 text-base placeholder:text-muted-foreground focus:border-text focus:outline-none disabled:opacity-50",
        className
      )}
      ref={ref}
      title={props.title || props.label}
      {...props}
    >
      <>
        <option hidden={!!props.preventEmpty} value="" aria-label={props.label}>
          {props.label || "Select"}
        </option>
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </>
    </select>
  )
})

Select.displayName = "Select"

export { Select }
