import { LoadingIndicator } from "../../loading";
import { FC } from "react";

interface ChatLoadingProps {
  message?: string;
}

export const ChatLoading: FC<ChatLoadingProps> = ({ 
  message = "" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="mb-3">
        <LoadingIndicator isLoading={true} />
      </div>
      <div className="text-center text-muted-foreground font-medium">
        {message}
      </div>
    </div>
  );
};
