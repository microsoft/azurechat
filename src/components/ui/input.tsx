import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  accept?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, accept = type === 'file' ? '.pdf' : undefined, ...props }, ref) => {
    return (
      <input
        type={type}
        accept={accept}
        className={cn("flex h-10 w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50", className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };