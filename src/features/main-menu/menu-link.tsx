"use client";
import { cn } from "@/ui/lib";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { ButtonLinkVariant } from "../ui/button";

interface MenuLinkProps {
  href: string;
  ariaLabel: string;
  children: React.ReactNode;
}

export const MenuLink: FC<MenuLinkProps> = (props) => {
  const path = usePathname();
  const isActive = path.startsWith(props.href) && props.href !== "/";
  return (
    <Link
      className={cn(
        ButtonLinkVariant,
        // Filling the glyph marks the current page at a glance. The class
        // beats the icon's own fill="none" presentation attribute. A tinted
        // fill rather than a solid one keeps the outline readable — filled
        // with currentColor, shapes like the reporting sheet collapse into a
        // featureless block.
        isActive ? "text-primary [&_svg]:fill-primary/25" : ""
      )}
      href={props.href}
      aria-label={props.ariaLabel}
      aria-current={isActive ? "page" : undefined}
    >
      {props.children}
    </Link>
  );
};
