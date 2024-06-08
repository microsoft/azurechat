import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  title: string;
}

export const ChatGroup = (props: Props) => {
  return (
    <div className="flex flex-col">
      <div className="text-sm text-primary p-3 font-semibold">
        {props.title}
      </div>
      <div>{props.children}</div>
    </div>
  );
};
