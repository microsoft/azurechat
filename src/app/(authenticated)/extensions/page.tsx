import { GetFeatureFlags } from "@/features/common/feature-flags";
import { ExtensionPage } from "@/features/extensions-page/extension-page";
import { FindAllExtensionForCurrentUser } from "@/features/extensions-page/extension-services/extension-service";
import { DisplayError } from "@/features/ui/error/display-error";

export default async function Home() {
  if (!GetFeatureFlags().extensionsEnabled) {
    return (
      <DisplayError
        errors={[
          { message: "Extensions are not enabled on this deployment." },
        ]}
      />
    );
  }

  const extensionResponse = await FindAllExtensionForCurrentUser();

  if (extensionResponse.status !== "OK") {
    return <DisplayError errors={extensionResponse.errors} />;
  }

  return <ExtensionPage extensions={extensionResponse.response} />;
}
