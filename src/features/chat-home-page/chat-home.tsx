import { getCurrentUser } from "@/features/auth-page/helpers";
import { GetFeatureFlags } from "@/features/common/feature-flags";
import { AddExtension } from "@/features/extensions-page/add-extension/add-new-extension";
import { ExtensionModel } from "@/features/extensions-page/extension-services/models";
import { PersonaModel } from "@/features/persona-page/persona-services/models";
import { PHI_DISCLAIMER } from "@/features/theme/theme-config";
import { HomeInput, PersonaSuggestion } from "./home-input";

interface ChatPersonaProps {
  personas: PersonaModel[];
  extensions: ExtensionModel[];
}

export const ChatHome = async (props: ChatPersonaProps) => {
  const flags = GetFeatureFlags();
  const user = await getCurrentUser();
  const firstName = user.name?.split(" ")[0] ?? "";

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8 -mt-16">
        <h1 className="text-3xl font-normal tracking-tight text-center">
          {firstName ? `Good to see you, ${firstName}.` : "Good to see you."}
        </h1>

        <HomeInput />

        {props.personas.length > 0 && (
          <div className="w-full max-w-xl flex flex-col">
            {props.personas.slice(0, 3).map((persona) => (
              <PersonaSuggestion key={persona.id} persona={persona} />
            ))}
          </div>
        )}
      </div>

      <p className="absolute bottom-4 text-[11px] text-muted-foreground text-center px-4">
        {PHI_DISCLAIMER}
      </p>

      {flags.extensionsEnabled && <AddExtension />}
    </main>
  );
};
