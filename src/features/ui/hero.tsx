import { Button } from "@/features/ui/button";
import { FC, PropsWithChildren } from "react";

interface HeroProps extends PropsWithChildren {
  title: React.ReactNode;
  description: string;
}

export const Hero: FC<HeroProps> = (props) => {
  return (
    <div className="w-full py-16 pb-4 h-auto">
      <div className="container max-w-4xl h-full flex flex-col gap-16">
        <div className="flex gap-6 flex-col items-center">
          <h1 className="text-4xl font-bold flex gap-2 items-center">
            {props.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-center text-sm">
            {props.description}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">{props.children}</div>
      </div>
    </div>
  );
};

interface HeroButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export const HeroButton: FC<HeroButtonProps> = (props) => {
  return (
    <Button
      variant={"outline"}
      className="flex flex-col gap-4 h-auto p-4 items-start text-start justify-start dark:bg-opacity-5 dark:bg-[#FFFFFF]  dark:hover:border-fuchsia-400 hover:border-fuchsia-400"
      onClick={props.onClick}
    >
      <span className="flex flex-col gap-2 text-primary">
        <span className="dark:text-white w-7 h-7">{props.icon}</span>
        <span className="dark:text-white text-base">{props.title}</span>
      </span>

      <span className="text-muted-foreground whitespace-break-spaces font-thin dark:text-white text-sm">
        {props.description}
      </span>
    </Button>
  );
};
