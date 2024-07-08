import * as RadixSelect from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import React, { forwardRef } from "react"

import Typography from "@/components/typography" // adjust import based on your file structure
import { cn } from "@/lib/utils" // adjust import based on your file structure

export interface SelectProps {
  label?: string
  preventEmpty?: boolean
  groups: { label: string; options: { value: string; label: string }[] }[]
  className?: string // Added className prop here
  onValueChange: (value: string) => void
  value: string
  disabled?: boolean
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ className, groups, label, preventEmpty, onValueChange, value, disabled, ...props }, ref) => {
    return (
      <RadixSelect.Root onValueChange={onValueChange} value={value} disabled={disabled}>
        <RadixSelect.Trigger
          className={cn(
            "inline-flex h-[35px] items-center justify-center gap-[5px] rounded bg-altBackgroundShade px-[15px] text-[13px] leading-none text-text shadow-[0_2px_10px] shadow-black/10 outline-none hover:bg-altBackground focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-textMuted",
            className
          )}
          aria-label={label}
          ref={ref}
          {...props}
        >
          <RadixSelect.Value placeholder={label || "Select"} />
          <RadixSelect.Icon className="text-text">
            <ChevronDown />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            className="overflow-hidden rounded-md bg-altBackground shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
            position="popper"
          >
            <RadixSelect.ScrollUpButton className="flex h-[25px] cursor-default items-center justify-center bg-altBackground text-text">
              <ChevronUp />
            </RadixSelect.ScrollUpButton>
            <RadixSelect.Viewport className="p-[5px]">
              {groups.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  <RadixSelect.Group>
                    <Typography variant="span" className="px-[25px] text-xs leading-[25px] text-text">
                      {group.label}
                    </Typography>
                    {!preventEmpty && groupIndex === 0 && (
                      <SelectItem value="placeholder" aria-label={label}>
                        {label || "Select"}
                      </SelectItem>
                    )}
                    {group.options.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </RadixSelect.Group>
                  {groupIndex < groups.length - 1 && <RadixSelect.Separator className="m-[5px] h-[1px] bg-border" />}
                </React.Fragment>
              ))}
            </RadixSelect.Viewport>
            <RadixSelect.ScrollDownButton className="flex h-[25px] cursor-default items-center justify-center bg-altBackground text-text">
              <ChevronDown />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    )
  }
)

const SelectItem = forwardRef<HTMLDivElement, RadixSelect.SelectItemProps & { children: React.ReactNode }>(
  ({ children, className, ...props }, ref) => (
    <RadixSelect.Item
      className={cn(
        "relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[35px] text-[13px] leading-none text-text data-[disabled]:pointer-events-none data-[highlighted]:bg-focus data-[disabled]:text-textMuted data-[highlighted]:text-altBackground data-[highlighted]:outline-none",
        className
      )}
      {...props}
      ref={ref}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
        <Check />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  )
)

Select.displayName = "Select"
SelectItem.displayName = "SelectItem"

export { Select }
