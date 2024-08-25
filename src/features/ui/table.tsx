import * as React from "react"

import Typography from "@/components/typography"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom", className)} {...props} />
    </div>
  )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn(className)} {...props} />
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-b-4 [&_tr:last-child]:border-accent", className)}
      {...props}
    />
  )
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("bg-primary font-medium text-primary-foreground", className)} {...props} />
  )
)
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { "data-row-index"?: number }
>(({ className, "data-row-index": rowIndex, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { "data-col-index"?: number }
>(({ className, "data-col-index": colIndex, ...props }, ref) => {
  const isFirstColumn = colIndex === 0
  return (
    <th
      ref={ref}
      className={cn(
        "h-12 border-b-4 border-accent px-4 align-middle",
        isFirstColumn ? "text-left" : "text-center",
        className
      )}
      scope="col"
      {...props}
    >
      <Typography variant="h5" className="font-bold">
        {props.children}
      </Typography>
    </th>
  )
})
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { "data-col-index"?: number; "data-row-index"?: number }
>(({ className, "data-col-index": colIndex, "data-row-index": rowIndex, ...props }, ref) => {
  const isFirstColumn = colIndex === 0
  return (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        isFirstColumn ? "text-left" : "text-center",
        className
      )}
      {...props}
    >
      <Typography variant="p">{props.children}</Typography>
    </td>
  )
})
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-muted-foreground", className)} {...props}>
      <Typography variant="p">
        <span>Table caption</span>
        <span className="block text-sm">Table is ordered by</span>
      </Typography>
    </caption>
  )
)
TableCaption.displayName = "TableCaption"

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
