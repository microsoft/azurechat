import { ExtensionModel } from "@/features/extensions-page/extension-services/models";
import { CHAT_DEFAULT_PERSONA } from "@/features/theme/theme-config";
import { VenetianMask } from "lucide-react";
import { FC } from "react";
import { ChatDocumentModel, ChatThreadModel } from "../chat-services/models";
import { DocumentDetail } from "./document-detail";
import { ExtensionDetail } from "./extension-detail";
import { PersonaDetail } from "./persona-detail";
import Image from "next/image";
import { useTheme } from "next-themes";

interface Props {
  chatThread: ChatThreadModel;
  chatDocuments: Array<ChatDocumentModel>;
  extensions: Array<ExtensionModel>;
}

export const ChatHeader: FC<Props> = (props) => {
  const { theme } = useTheme();
  const persona =
    props.chatThread.personaMessageTitle === "" ||
    props.chatThread.personaMessageTitle === undefined
      ? CHAT_DEFAULT_PERSONA
      : props.chatThread.personaMessageTitle;
  return (
    <div className="bg-background border-b flex items-center py-2">
      <div className="container max-w-3xl flex justify-between items-center">
        <div className="flex flex-col">
          <div className="grid grid-rows-2 grid-flow-col gap-5 items-center">
            <div className="row-span-2">
              <Image
                src={theme === 'dark' ? "/aico-white.png" : "/aico-blue.png"}
                alt={props.chatThread.name}
                width={100}
                height={100}
              />
            </div>
            <div className="row-span-3">
                 <span style={{ fontWeight: 'bold', fontSize: '30px' }}>
                 {/* <VenetianMask size={18} /> */}
                {persona} (AI for Comau)
              </span>
              <div style={{ height: '10px' }}></div>
              <span className="flex flex-col" style={{ fontSize: '15px'}}>Current Chat:  {props.chatThread.name}</span>
            </div>
          </div>
        </div>

       

        <div className="flex gap-2">
          {/* <PersonaDetail chatThread={props.chatThread} /> 
          
          <ExtensionDetail
            disabled={props.chatDocuments.length !== 0}
            extensions={props.extensions}
            installedExtensionIds={props.chatThread.extension}
            chatThreadId={props.chatThread.id}
          />*/}
          <DocumentDetail chatDocuments={props.chatDocuments} />
        </div>
      </div>
    </div>
  );
};


