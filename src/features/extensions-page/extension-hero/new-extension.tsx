import { HeroButton } from "@/features/ui/hero";
import { PocketKnife } from "lucide-react";
import { extensionStore } from "../extension-store";

export const NewExtension = () => {
  return (
    <HeroButton
      title="New Extension"
      description="Create a new extension with your own internal API"
      icon={<PocketKnife />}
      onClick={() => extensionStore.newAndOpenSlider()}
    />
  );
};
