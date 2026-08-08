import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  title: string;
}

export const ChatGroup = (props: Props) => {
  return (
    <div className="flex flex-col">
      <div className="text-xs font-medium text-muted-foreground px-3 pb-1">
        {props.title}
      </div>
      <div className="flex flex-col gap-0.5">{props.children}</div>
    </div>
  );
};
