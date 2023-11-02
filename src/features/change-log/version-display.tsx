import { APP_VERSION } from "@/app-global";
import { appVersionDetails } from "./app-version";

export const VersionDisplay = async () => {
  const appVersion = await appVersionDetails();

  return (
    <div className="flex flex-col">
      <h1 className="text-sm font-bold">
        Version: {APP_VERSION}{" "}
        {appVersion.isOutdated ? (
          <span className="font-normal bg-red-200 rounded-2xl p-1 px-3">
            new version available {appVersion.version}
          </span>
        ) : (
          <span className="font-normal bg-green-200 rounded-2xl p-1 px-3">
            You are up to date
          </span>
        )}
      </h1>
    </div>
  );
};
