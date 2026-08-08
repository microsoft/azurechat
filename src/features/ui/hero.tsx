import { FC, PropsWithChildren } from "react";
import { cn } from "./lib";

interface HeroProps extends PropsWithChildren {
  title: React.ReactNode;
  description: string;
}

export const Hero: FC<HeroProps> = (props) => {
  return (
    <div className="w-full pt-12 pb-2">
      <div className="container max-w-4xl flex flex-col gap-8">
        <div className="flex gap-2 flex-col items-start">
          <h1 className="text-2xl font-normal tracking-tight flex gap-2 items-center">
            {props.title}
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            {props.description}
          </p>
        </div>
        {props.children && (
          <div className="flex flex-wrap gap-2">{props.children}</div>
        )}
      </div>
    </div>
  );
};

interface HeroButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "primary" | "default";
}

export const HeroButton: FC<HeroButtonProps> = (props) => {
  return (
    <button
      onClick={props.onClick}
      className={cn(
        "flex flex-col gap-1 items-start text-start rounded-2xl border px-4 py-3 max-w-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        props.variant === "primary"
          ? "bg-foreground text-background border-transparent hover:opacity-90"
          : "bg-background hover:bg-secondary"
      )}
    >
      <span className="flex gap-2 items-center text-sm font-medium [&_svg]:h-4 [&_svg]:w-4">
        {props.icon}
        {props.title}
      </span>
      <span
        className={cn(
          "text-xs font-normal line-clamp-2",
          props.variant === "primary"
            ? "text-background/70"
            : "text-muted-foreground"
        )}
      >
        {props.description}
      </span>
    </button>
  );
};
