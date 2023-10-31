import { APP_VERSION } from "@/app-global";

export const UpdateIndicatorAction = async () => {
  const appVersion = await fetch(
    "https://raw.githubusercontent.com/microsoft/azurechat/main/src/package.json",
    {
      cache: "no-cache",
    }
  );

  const version = (await appVersion.json()).version as string;

  if (APP_VERSION === version) {
    return null;
  } else {
    return (
      <div className="absolute left-0 top-0  bg-red-400 rounded-full -translate-x-0.5 -translate-y-0.5">
        <div className="w-3  h-3 animate-ping bg-red-600 rounded-full "></div>
      </div>
    );
  }
};
