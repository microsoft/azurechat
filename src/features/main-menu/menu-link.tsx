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
  return (
    <Link
      className={cn(
        ButtonLinkVariant,
        path.startsWith(props.href) && props.href !== "/" ? "text-primary" : ""
      )}
      href={props.href}
      aria-label={props.ariaLabel}
    >
      {props.children}
    </Link>
  );
};
