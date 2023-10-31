import { APP_VERSION } from "@/app-global";

export const VersionDisplay = async () => {
  const appVersion = await fetch(
    "https://raw.githubusercontent.com/microsoft/azurechat/main/src/package.json",
    {
      cache: "no-cache",
    }
  );
  const version = (await appVersion.json()).version as string;

  return (
    <div className="flex flex-col">
      <h1 className="text-sm font-bold">
        Version: {APP_VERSION}{" "}
        {APP_VERSION === version ? (
          <span className="font-normal bg-green-200 rounded-2xl p-1 px-3l">
            You are up to date
          </span>
        ) : (
          <span className="font-normal bg-red-200 rounded-2xl p-1 px-3">
            new version available {version}
          </span>
        )}
      </h1>
    </div>
  );
};
