"use client";
import { useRouter } from "next/navigation";
import { ChatThreadModel } from "../chat-page/chat-services/models";
import { TableCell, TableRow } from "../ui/table";

interface ChatThreadRowProps extends ChatThreadModel {}

const ChatThreadRow: React.FC<ChatThreadRowProps> = (props) => {
  const chatThread = props;

  const router = useRouter();

  return (
    <TableRow
      key={chatThread.id}
      className="cursor-pointer"
      onClick={() => {
        router.push("/reporting/chat/" + chatThread.id);
      }}
    >
      <TableCell className="font-medium">{chatThread.name}</TableCell>
      <TableCell>{chatThread.useName}</TableCell>
      <TableCell>
        {new Date(chatThread.createdAt).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
};

export default ChatThreadRow;
