import * as RadixSelect from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import React, { FC, forwardRef } from "react"

import { cn } from "@/lib/utils"

type SelectOption = { label: string; value: string }

export interface SelectProps {
  label?: string
  preventEmpty?: boolean
  options: SelectOption[] | { label: string; options: SelectOption[] }[]
  className?: string
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

const EMPTY_VALUE = "_"

const Select: FC<SelectProps> = ({ className, label, options, preventEmpty, value, disabled, onValueChange }) => {
  return (
    <RadixSelect.Root
      value={value}
      disabled={disabled}
      onValueChange={val => onValueChange(val === EMPTY_VALUE ? "" : val)}
    >
      <RadixSelect.Trigger
        className={cn(
          `flex size-full max-h-11 items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap rounded-md border-2 px-3 py-2 pr-7 text-base placeholder:text-muted-foreground focus:border-text focus:outline-none disabled:opacity-50 ${disabled ? "cursor-default" : "cursor-pointer border-2 hover:bg-altBackground"}`,
          className
        )}
        aria-label={label}
        disabled={disabled}
      >
        <RadixSelect.Value placeholder={label || "Select"} />
        <RadixSelect.Icon className="h-6 w-6">
          <ChevronDown />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="rounded-md border-2 border-text bg-altBackground" position="popper">
          <RadixSelect.ScrollUpButton className="flex h-11 cursor-default items-center justify-center bg-altBackground text-text">
            <ChevronUp />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="p-2 uppercase text-muted-foreground">
            <SelectItem
              value={EMPTY_VALUE}
              aria-label={label}
              className={`${preventEmpty && "hidden bg-underline underline underline-offset-2"}`}
            >
              {label || "Select"}
            </SelectItem>
            <RadixSelect.Separator className={`m-1 h-[1px] bg-border ${preventEmpty && "hidden"}`} />
            {options.map(option =>
              "options" in option ? (
                <RadixSelect.Group key={option.label} className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {option.label}
                  {option.options?.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </RadixSelect.Group>
              ) : (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              )
            )}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="flex h-6 cursor-default items-center justify-center bg-altBackground text-text">
            <ChevronDown />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}

Select.displayName = "Select"

export { Select }

const SelectItem = forwardRef<HTMLDivElement, RadixSelect.SelectItemProps & { children: React.ReactNode }>(
  ({ children, className, ...props }, ref) => (
    <RadixSelect.Item
      className={cn(
        "relative flex h-6 max-h-11 cursor-pointer items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-sm pl-7 pr-2 normal-case text-text data-[disabled]:pointer-events-none data-[highlighted]:bg-focus data-[disabled]:text-textMuted data-[highlighted]:text-altBackground data-[highlighted]:outline-none",
        className
      )}
      {...props}
      ref={ref}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="absolute left-1">
        <Check className="h-6 w-6" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  )
)

SelectItem.displayName = "SelectItem"
