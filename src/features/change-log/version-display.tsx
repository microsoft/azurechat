import { APP_VERSION } from "@/app-global";
import { appVersionDetails } from "./app-version";

export const VersionDisplay = async () => {
  const appVersion = await appVersionDetails();

  return (
    <div className="flex flex-col">
      <h1 className="text-sm font-bold">
        Version: {APP_VERSION}
      </h1>
    </div>
  );
};
