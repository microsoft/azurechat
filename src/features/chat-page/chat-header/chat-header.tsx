import { ExtensionModel } from "@/features/extensions-page/extension-services/models";
import { CHAT_DEFAULT_PERSONA } from "@/features/theme/theme-config";
import { VenetianMask } from "lucide-react";
import { FC } from "react";
import { ChatDocumentModel, ChatThreadModel } from "../chat-services/models";
import { DocumentDetail } from "./document-detail";
import { ExtensionDetail } from "./extension-detail";
import { PersonaDetail } from "./persona-detail";
import { chatStore, useChat } from "@/features/chat-page/chat-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";

interface Props {
  chatThread: ChatThreadModel;
  chatDocuments: Array<ChatDocumentModel>;
  extensions: Array<ExtensionModel>;
}

export const ChatHeader: FC<Props> = (props) => {
  const persona =
    props.chatThread.personaMessageTitle === "" ||
    props.chatThread.personaMessageTitle === undefined
      ? CHAT_DEFAULT_PERSONA
      : props.chatThread.personaMessageTitle;
  return (
    <div className="bg-background border-b flex items-center py-2">
      <div className="container max-w-3xl flex justify-between items-center">
        <div className="flex flex-col">
          <span>{props.chatThread.name}</span>
          <span className="text-sm text-muted-foreground flex gap-1 items-center">
            <VenetianMask size={18} />
            {persona}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          {/* Model selector */}
          <ModelSelect />
          <PersonaDetail chatThread={props.chatThread} />
          <DocumentDetail chatDocuments={props.chatDocuments} />
          <ExtensionDetail
            disabled={props.chatDocuments.length !== 0}
            extensions={props.extensions}
            installedExtensionIds={props.chatThread.extension}
            chatThreadId={props.chatThread.id}
          />
        </div>
      </div>
    </div>
  );
};

const ModelSelect: FC = () => {
  const { selectedModel } = useChat();
  const onChange = (v: string) => chatStore.updateSelectedModel(v);

  return (
    <Select value={selectedModel} onValueChange={onChange}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Välj modell" />
      </SelectTrigger>
      <SelectContent>
        {/* Use your Azure OpenAI deployment names here */}
        <SelectItem value="gpt-4o">gpt-4o</SelectItem>
        <SelectItem value="gpt-5">gpt-5</SelectItem>
        <SelectItem value="gpt-5-mini">gpt-5-mini</SelectItem>
      </SelectContent>
    </Select>
  );
};
