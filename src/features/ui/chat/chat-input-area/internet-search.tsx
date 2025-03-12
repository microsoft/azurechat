import { Globe } from "lucide-react";
import { Button } from "../../button";
import { ExtensionModel } from "@/features/extensions-page/extension-services/models";
import { chatStore } from "@/features/chat-page/chat-store";
import { useState } from "react";

export const InternetSearch = (props: { extension: ExtensionModel; threadExtensions: string[] }) => {
  const [threadExtensions, setThreadExtensions] = useState<string[]>(props.threadExtensions);

  const toggleInstall = async () => {
    const isInstalled = threadExtensions.includes(props.extension.id);

    const newThreadExtensions = isInstalled
      ? threadExtensions.filter((id) => id !== props.extension.id)
      : [...threadExtensions, props.extension.id];

    setThreadExtensions(newThreadExtensions);

    try {
      if (isInstalled) {
        await chatStore.RemoveExtensionFromChatThread(props.extension.id);
      } else {
        await chatStore.AddExtensionToChatThread(props.extension.id);
      }
    } catch (error) {
      setThreadExtensions(threadExtensions); // Revert to the original state
    }
  };

  return (
    <>
      <Button
        size="icon"
        variant={threadExtensions.includes(props.extension.id) ? "default" : "ghost"}
        type="button"
        aria-label="Internet Access"
        onClick={toggleInstall}
      >
        <Globe size={16} />
      </Button>
    </>
  );
};
