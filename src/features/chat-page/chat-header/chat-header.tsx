import { ExtensionModel } from "@/features/extensions-page/extension-services/models";
import { CHAT_DEFAULT_PERSONA } from "@/features/theme/theme-config";
import { VenetianMask } from "lucide-react";
import { FC } from "react";
import { ChatDocumentModel, ChatThreadModel } from "../chat-services/models";
import { DocumentDetail } from "./document-detail";
import { ExtensionDetail } from "./extension-detail";
import { PersonaDetail } from "./persona-detail";

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
        <div className="flex gap-2">
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
