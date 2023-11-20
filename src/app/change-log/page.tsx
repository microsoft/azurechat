import { Markdown } from "@/components/markdown/markdown";
import { Card } from "@/components/ui/card";
import { VersionDisplay } from "@/features/change-log/version-display";
import { promises as fs } from "fs";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await loadContent();
  return (
    <Card className="h-full flex justify-center flex-1 overflow-y-scroll">
      <div className="flex flex-col gap-8 py-8">
        <Suspense fallback={"Getting version"}>
          <VersionDisplay />
        </Suspense>
        <div className="prose prose-slate dark:prose-invert break-words prose-p:leading-relaxed prose-pre:p-0 max-w-4xl ">
          <Markdown content={content} />
        </div>
      </div>
    </Card>
  );
}

const loadContent = async () => {
  if (process.env.NODE_ENV === "production") {
    const response = await fetch(
      "https://raw.githubusercontent.com/microsoft/azurechat/main/src/app/change-log/update.md",
      {
        cache: "no-cache",
      }
    );
    return await response.text();
  } else {
    return await fs.readFile(
      process.cwd() + "/app/change-log/update.md",
      "utf8"
    );
  }
};
