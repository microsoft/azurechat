import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  title: string;
}

export const ChatGroup = (props: Props) => {
  return (
    <div className="flex flex-col">
      <div className="text-primary p-3 font-semibold text-size-['14px']">
        {props.title}
      </div>
      <div>{props.children}</div>
    </div>
  );
};
