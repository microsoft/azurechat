import React, { ForwardRefRenderFunction } from "react";

interface ChatMessageContentAreaProps {
  children?: React.ReactNode;
}

const ChatMessageContentArea: ForwardRefRenderFunction<
  HTMLDivElement,
  ChatMessageContentAreaProps
> = (props, ref) => {
  return (
    <div
      ref={ref}
      className="container max-w-3xl relative min-h-screen pb-[240px] pt-20 flex flex-col gap-8"
    >
      {props.children}
    </div>
  );
};

export default React.forwardRef(ChatMessageContentArea);
