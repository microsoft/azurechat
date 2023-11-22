import Typography from "@/components/typography";
import { Card } from "@/components/ui/card";
import { FC } from "react";
import { useChatContext } from "../chat-context";
import { ChatFileUI } from "../chat-file/chat-file-ui";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatTypeSelector } from "./chat-type-selector";

interface Prop {}

export const ChatMessageEmptyState: FC<Prop> = (props) => {
  const { fileState } = useChatContext();

  const { showFileUpload } = fileState;


/*
下記Cardにもともと入っていたコード Fileのものもこちら
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            How would you like to chat?
          </p>
          <ChatTypeSelector disable={false} />
        </div>
        {showFileUpload === "data" && <ChatFileUI />}

*/
  return (
    <div className="grid grid-cols-5 w-full items-center container mx-auto max-w-3xl justify-center h-full gap-9">
      <div className="col-span-2 gap-5 flex flex-col flex-1">
        <img src="/ai-icon.png" className="w-36" />
        <p className="">
          下のメッセージボックスにメッセージを入力してください。右のボタンでチャットのスタイルやタイプを変更することもできます。
        </p>
      </div>
      <Card className="col-span-3 flex flex-col gap-5 p-5 ">
        <Typography variant="h4" className="text-primary">
          オプション設定
        </Typography>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            会話のスタイルを変更する
          </p>
          <ChatStyleSelector disable={false} />
        </div>
      </Card>
    </div>
  );
};
