import * as React from "react";

import { cn } from "@/ui/lib";
import { LucideProps } from "lucide-react";
import { Button, ButtonLinkVariant, ButtonProps } from "./button";
import { TooltipProvider } from "./tooltip";

const Menu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-full", className)} {...props}>
    <TooltipProvider>{props.children}</TooltipProvider>
  </div>
));
Menu.displayName = "Menu";

const MenuBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-background z-10 p-2 w-16 flex flex-col justify-between h-full items-stretch border-r",
      className
    )}
    {...props}
  >
    <TooltipProvider>{props.children}</TooltipProvider>
  </div>
));
MenuBar.displayName = "MenuBar";

type AnchorProps = ButtonProps & {
  tooltip?: string;
};

const MenuItemContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(" flex flex-col ", className)} {...props}>
    {props.children}
  </div>
));
MenuItemContainer.displayName = "MenuItemContainer";

const MenuItem = React.forwardRef<HTMLButtonElement, AnchorProps>(
  ({ className, variant = "ghost", size, asChild = false, ...props }, ref) => {
    return (
      <Button
        title={props.tooltip}
        variant={variant}
        {...props}
        className={cn(ButtonLinkVariant)}
        ref={ref}
      />
    );
  }
);
MenuItem.displayName = "MenuItem";

const menuIconProps: LucideProps = {
  size: 24,
  strokeWidth: 1.6,
};

export { Menu, MenuBar, MenuItem, MenuItemContainer, menuIconProps };
