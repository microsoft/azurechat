import { Loader } from "lucide-react";
import { FC } from "react";

interface Props {}

const ChatLoading: FC<Props> = (props) => {
  return (
    <div className="container mx-auto max-w-4xl py-6">
      <Loader className="animate-spin" />
    </div>
  );
};

export default ChatLoading;
